import { StatusCodes } from "http-status-codes";
import Unauthorized from '../errors/Unauthorized'
import BadRequest from "../errors/BadRequest";
import NotFound from "../errors/NotFound";
import { Request , Response } from "express";
import crypto from "crypto";

import {PrismaClient , Prisma} from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import axios from "axios";



const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl
  })
})


export const createPaymentSession = async (req : Request , res : Response) =>{

    const {amount , currency , userId , orderId , successUrl , cancelUrl , webhookUrl} = req.body 

    const apiKey = req.header("x-api-key");
    const apiSecret = req.header("x-api-secret");

    const reference = `TRX-${crypto.randomUUID()}`;
    const paymentId = crypto.randomUUID();

    const transaction = await prisma.transaction.create({
        data:{
            reference,
            type:"payment",
            amount,
            currency,
            description:"",
            paymentId:paymentId
        }
    })


    const findData = await prisma.aPIKey.findFirst({
        where : {
            apiKey:apiKey,
            apiSecret:apiSecret,
            status:"active"
        },
        include:{
            account:{
                include :{
                    user : true
                }
            }
        }
    })


    if(!findData){
        throw new BadRequest('invalid key')
    }

    if (findData.account.status !== "active") {
        throw new BadRequest("Account is not active");
    }

    const processorData = {
        merchant: {
            paymentId:transaction.paymentId,
            name: findData.account.user.firstName,
            legalName: `${findData.account.user.firstName} ${findData.account.user.lastName}`,
            country: "US",
            defaultCurrency: findData.account.currency,
        },

        merchantAccount: {
            accountCode: findData.account.accountNumber,
            country: "US",
            currency: findData.account.currency,
            apiBaseUrl:findData.account.apiBaseUrl
        },

        payment: {
            userReference: userId,
            orderReference:orderId,
            amount: amount,
            currency,
            successUrl,
            cancelUrl,
            webhookUrl
        },
    };

    const {data} = await axios.post('http://localhost:2000/api/v1/payment/payment-sessions', processorData)

    res.status(StatusCodes.OK).json({checkoutUrl:data.checkoutUrl})
}


export const processor = async (req: Request, res: Response) => {

    const {issuerStatus , paymentId , merchantReference} = req.body

    console.log("its run")

    const account = await prisma.account.findUnique({
        where:{
            accountNumber:merchantReference
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const transaction = await prisma.transaction.findUnique({
        where:{
            paymentId:paymentId
        }
    })

    if(!transaction){
        throw new NotFound("transaction not found")
    }

    if(issuerStatus==="incomplete"){
        await prisma.transaction.update({
            where:{
                id:transaction.id
            },
            data:{
                status:"failed"
            }
        })

        return res.sendStatus(StatusCodes.OK)
    }

    await prisma.$transaction(async (tx)=>{
        await tx.ledgerEntry.create({
            data:{
                transactionId:transaction.id,
                accountId:account.id,
                type:"credit",
                amount:transaction.amount,
                currency:transaction.currency
            }
        })

        await tx.account.update({
            where:{
                id:account.id 
            },
            data:{
                balance:{
                    increment:transaction.amount
                },
                availableBalance:{
                    increment:transaction.amount
                }
            }
        })

        await tx.transaction.update({
            where:{
                id:transaction.id 
            },
            data:{
                status:"completed"
            }
        })
    })

    res.sendStatus(StatusCodes.OK)
};


export const failedProcessor = async (req:Request , res:Response) => {
    const {paymentId , merchantReference} = req.body 

    const account = await prisma.account.findUnique({
        where:{
            accountNumber:merchantReference
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const transaction = await prisma.transaction.findUnique({
        where:{
            paymentId:paymentId
        }
    })

    if(!transaction){
        throw new NotFound("transaction not found")
    }

    let issuerStatusCon

    try{
        const {data} = await axios.post("http://localhost:2000/api/v1/payment/check-issuerStatus" , {paymentId:transaction.paymentId})

        if(data.issuerStatus){
            issuerStatusCon = data.issuerStatus
        }

    }catch(error){
        await prisma.transaction.update({
            where:{
                id:transaction.id 
            },
            data:{
                status:"processing"
            }
        })
        return res.status(StatusCodes.ACCEPTED).json({
            status: "processing",
            msg: "Your payment is being processed. Please wait while we confirm its status."
        });
    }

    if(issuerStatusCon==="incomplete"){
        await prisma.transaction.update({
            where:{
                id:transaction.id
            },
            data:{
                status:"failed"
            }
        })

        return res.status(StatusCodes.OK).json({msg:"transaction failed" , issuerStatus:issuerStatusCon})
    }

    await prisma.$transaction(async (tx)=>{
        await tx.ledgerEntry.create({
            data:{
                transactionId:transaction.id,
                accountId:account.id,
                type:"credit",
                amount:transaction.amount,
                currency:transaction.currency
            }
        })

        await tx.account.update({
            where:{
                id:account.id 
            },
            data:{
                balance:{
                    increment:transaction.amount
                },
                availableBalance:{
                    increment:transaction.amount
                }
            }
        })

        await tx.transaction.update({
            where:{
                id:transaction.id 
            },
            data:{
                status:"completed"
            }
        })
    })

    res.status(StatusCodes.OK).json({msg:"payment successed" , issuerStatus:issuerStatusCon})
}


export const addCard = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const {firstName , lastName , cardNumber , expMonth , expYear , cvv} = req.body 

    const account = await prisma.account.findFirst({
        where:{
            userId:userId,
            status:"active"
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/verify-card" , {cardNumber , expMonth , expYear , cvv , baseUrl:"http://localhost:5000/api/v1"})

        if(data.status==="success"){
            await prisma.linkedCard.create({
                data:{
                    token:data.token,
                    brand:data.brand,
                    last4:data.last4,
                    expMonth:expMonth,
                    expYear:expYear,
                    accountId:account.id
                }
            })

            return res.status(StatusCodes.OK).json({msg:data.msg})
        }
    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}


export const myCard = async (req:Request , res:Response)=>{
    const userId = (req.user as { id: number }).id

    const account = await prisma.account.findFirst({
        where:{
            userId:userId,
            status:"active"
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const cards = await prisma.linkedCard.findMany({
        where:{
            accountId:account.id
        }
    })

    if(!cards){
        throw new NotFound("link card not found")
    }

    res.status(StatusCodes.OK).json({cards})
}


export const depositeMoney = async (req:Request , res:Response) =>{
    const userId = (req.user as { id: number }).id

    const {amount , description , cardId} = req.body

    const account = await prisma.account.findFirst({
        where:{
            userId:userId
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const card = await prisma.linkedCard.findFirst({
        where:{
            id:cardId,
            status:"ACTIVE"
        }
    })

    const reference = `TRX-${crypto.randomUUID()}`;
    const paymentId = crypto.randomUUID();

    const transaction = await prisma.transaction.create({
        data:{
            reference:reference,
            type:"deposit",
            amount:amount,
            currency:"USD",
            description:description,
            paymentId:paymentId
        }
    })

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/deposite-financial" , {amount , description , token:card?.token , paymentId:transaction.paymentId , merchantReference:account.accountNumber})

        if(!data.issuerStatus || !data.msg){
            let issuerStatusCheck

            try{
                const {data} = await axios.post('http://localhost:6000/api/v1/financial/check' , {paymentId:transaction.paymentId})

                issuerStatusCheck = data.issuerStatus
            }catch(error){
                await prisma.transaction.update({
                    where:{
                        id:transaction.id 
                    },
                    data:{
                        status:"processing"
                    }
                })

                return res.status(StatusCodes.ACCEPTED).json({
                    msg: "The deposit outcome is still being reconciled."
                })
            }

            if(issuerStatusCheck==="incomplete"){
                await prisma.transaction.update({
                    where:{
                        id:transaction.id 
                    },
                    data:{
                        status:"failed"
                    }
                })

                res.status(StatusCodes.OK).json({msg:"transaction failed"})
            }

            await prisma.$transaction(async (tx)=>{
                await tx.transaction.update({
                    where:{
                        id:transaction.id
                    },
                    data:{
                        status:"completed"
                    }
                })

                await tx.ledgerEntry.create({
                    data:{
                        transactionId:transaction.id,
                        accountId:account.id,
                        type:"credit",
                        amount:transaction.amount,
                        currency:transaction.currency
                    }
                })

                await tx.account.update({
                    where:{
                        id:account.id 
                    },
                    data:{
                        balance:{
                            increment: transaction.amount
                        },
                        availableBalance:{
                            increment:transaction.amount
                        }
                    }
                })
            })

             res.status(StatusCodes.OK).json({msg:"deposite successed"})
        }

        if(data.issuerStatus==="success"){

            await prisma.$transaction(async (tx)=>{
                

                await tx.ledgerEntry.create({
                    data:{
                        transactionId:transaction.id,
                        accountId:account.id,
                        type:"credit",
                        amount:transaction.amount,
                        currency:transaction.currency
                    }
                })

                await tx.account.update({
                    where:{
                        id:account.id
                    },
                    data:{
                        balance:{
                            increment : transaction.amount
                        },
                        availableBalance:{
                            increment:transaction.amount
                        }
                    }
                })

                await tx.transaction.update({
                    where:{
                        id:transaction.id 
                    },
                    data:{
                        status:"completed"
                    }
                })
            }) 

            return res.status(StatusCodes.OK).json({msg:data.msg})

        }else if(data.issuerStatus==="incomplete"){
            await prisma.transaction.update({
                where:{
                    id:transaction.id 
                },
                data:{
                    status:"processing"
                }
            })

            return res.status(StatusCodes.OK).json({msg:data.msg})
        }
    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}


export const withdrawalMoney = async (req:Request , res:Response) =>{
    const userId = (req.user as { id: number }).id

    const {amount , description , cardId} = req.body

    const account = await prisma.account.findFirst({
        where:{
            userId:userId
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const card = await prisma.linkedCard.findFirst({
        where:{
            id:cardId,
            status:"ACTIVE"
        }
    })

    if(!card){
        throw new NotFound("link card not found")
    }

    const reference = `TRX-${crypto.randomUUID()}`;

    const paymentId = crypto.randomUUID();

    const transaction = await prisma.transaction.create({
        data:{
            reference:reference,
            paymentId:paymentId,
            type:"withdrawal",
            amount:amount,
            currency:"USD",
            description:description
        }
    })

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/withdrawal-financial" , {amount , description , token:card.token , merchantReference:account.accountNumber , paymentId:transaction.paymentId})

        if(!data.issuerStatus || !data.msg){

            let issuerStatusCheck

            try{
                const {data} = await axios.post('http://localhost:6000/api/v1/financial/check' , {paymentId:transaction.paymentId})

                issuerStatusCheck = data.issuerStatus
            }catch(error){
                await prisma.transaction.update({
                    where:{
                        id:transaction.id 
                    },
                    data:{
                        status:"processing"
                    }
                })

                return res.status(StatusCodes.ACCEPTED).json({
                    msg: "The deposit outcome is still being reconciled."
                })
            }

            if(issuerStatusCheck==="incomplete"){
                await prisma.transaction.update({
                    where:{
                        id:transaction.id 
                    },
                    data:{
                        status:"failed"
                    }
                })

                res.status(StatusCodes.OK).json({msg:"transaction failed"})
            }

            await prisma.$transaction(async (tx)=>{
                await tx.transaction.update({
                    where:{
                        id:transaction.id
                    },
                    data:{
                        status:"completed"
                    }
                })

                await tx.ledgerEntry.create({
                    data:{
                        transactionId:transaction.id,
                        accountId:account.id,
                        type:"credit",
                        amount:transaction.amount,
                        currency:transaction.currency
                    }
                })

                await tx.account.update({
                    where:{
                        id:account.id 
                    },
                    data:{
                        balance:{
                            decrement: transaction.amount
                        },
                        availableBalance:{
                            decrement:transaction.amount
                        }
                    }
                })
            })

             res.status(StatusCodes.OK).json({msg:"deposite successed"})
        }

        if(data.issuerStatus==="success"){
            await prisma.$transaction(async (tx)=>{
                await tx.transaction.update({
                    where:{
                        id:transaction.id
                    },
                    data:{
                        status:"completed"
                    }
                })

                await tx.ledgerEntry.create({
                    data:{
                        transactionId:transaction.id,
                        accountId:account.id,
                        type:"debit",
                        amount:transaction.amount,
                        currency:transaction.currency
                    }
                })

                await tx.account.update({
                    where:{
                        id:account.id
                    },
                    data:{
                        balance:{
                            decrement : transaction.amount
                        },
                        availableBalance:{
                            decrement:transaction.amount
                        }
                    }
                })
            }) 

            return res.status(StatusCodes.OK).json({msg:data.msg})

        }else if(data.issuerStatus==="incomplete"){
            await prisma.transaction.update({
                where:{
                    id:transaction.id 
                },
                data:{
                    status:"processing"
                }
            })

            return res.status(StatusCodes.OK).json({msg : data.msg})
        }

    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }

}


export const withdrawalDepositeFailed = async (req:Request , res:Response) => {
    const {merchantReference , paymentId} = req.body 

    const account = await prisma.account.findUnique({
        where:{
            accountNumber : merchantReference
        }
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const transaction = await prisma.transaction.findUnique({
        where:{
            paymentId:paymentId
        }
    })

    if(!transaction){
        throw new NotFound("transaction not found")
    }

    let issuerStatusCheck

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/check" , {paymentId})

        issuerStatusCheck=data.issuerStatus
    }catch(error){
        await prisma.transaction.update({
            where:{
                id:transaction.id 
            },
            data:{
                status:"processing"
            }
        })

        return res.status(StatusCodes.ACCEPTED).json({
            status: "processing",
            msg: "The deposit outcome is still being reconciled."
        })
    }

    if(issuerStatusCheck==="incomplete"){
        res.status(StatusCodes.OK).json({msg:"transaction failed" , issuerStatus:issuerStatusCheck})
    }

    if(issuerStatusCheck==="success"){
        res.status(StatusCodes.OK).json({msg:"transaction failed" , issuerStatus:issuerStatusCheck})
    }
}