import { StatusCodes } from "http-status-codes";
import Unauthorized from "../errors/Unauthorized";
import BadRequest from "../errors/BadRequest";
import NotFound from "../errors/NotFound";
import { Request , Response } from "express";
import crypto from "crypto";

import {PrismaClient , Prisma} from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import axios from "axios";
import da from "zod/v4/locales/da.js";



const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl
  })
})


export const createPaymentSession = async (req : Request , res : Response) => {
    const {merchant , merchantAccount, payment} = req.body;

    const checkoutSessionId = `cs_${crypto.randomUUID()}`;

    const findMerchantAccount = await prisma.merchantAccount.findUnique({
        where : {
            accountCode : merchantAccount.accountCode
        }
    })

    if(findMerchantAccount){
        const createPayment = await prisma.payment.create({
            data : {
                merchantAccountId : findMerchantAccount.id,
                merchantReference : merchantAccount.accountCode,
                userReference:payment.userReference,
                checkoutSessionId : checkoutSessionId, 
                currency : payment.currency,
                amount : payment.amount,
                paymentId:merchant.paymentId,
                successUrl:payment.successUrl,
                cancelUrl:payment.cancelUrl,
                webhookUrl:payment.webhookUrl,
                apiBaseUrl:merchantAccount.apiBaseUrl
            }
        })

        return res.status(StatusCodes.CREATED).json({msg : "payement created" , checkoutUrl: `http://localhost:5175/${createPayment.checkoutSessionId}`})
    }

    await prisma.$transaction(async (tx)=>{
        const createMerchant = await tx.merchant.create({
            data:{
                name : merchant.name,
                legalName : merchant.legalName,
                country : merchant.country,
                defaultCurrency : merchant.defaultCurrency
            }
        })

        const createMerchantAccount = await tx.merchantAccount.create({
            data:{
                merchantId : createMerchant.id,
                accountCode : merchantAccount.accountCode,
                country : merchantAccount.country,
                currency : merchantAccount.currency,
            }
        })

        const createPayment = await tx.payment.create({
            data :{
                merchantAccountId : createMerchantAccount.id,
                merchantReference : merchantAccount.accountCode,
                userReference:payment.userReference,
                checkoutSessionId : checkoutSessionId,
                currency : payment.currency,
                amount : payment.amount,
                paymentId:merchant.paymentId,
                successUrl:payment.successUrl,
                cancelUrl:payment.cancelUrl,
                webhookUrl:payment.webhookUrl,
                apiBaseUrl:merchantAccount.apiBaseUrl
            }
        })

        return res.status(StatusCodes.CREATED).json({msg : "payement created" , checkoutUrl: `http://localhost:5175/${createPayment.checkoutSessionId}`})
    })

}

export const createPaymentMethod = async (req : Request , res : Response) => {
    const {firstName , lastName , cardNumber , expMonth , expYear , cvv} = req.body

    const {sessionId} = req.params

    const findPayment = await prisma.payment.findUnique({
        where:{
            checkoutSessionId : String(sessionId),
            paymentMethodId:null
        },
        include:{
            merchantAccount:true
        }
    })

    if(!findPayment){
        throw new NotFound("Payment session not found. please repeat the payment process");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const last4 = cardNumber.slice(-4);

    const paymentMethod = await prisma.paymentMethod.create({
        data : {
            type : "CARD" , token , last4 , expMonth , expYear
        }
    })

    //request the financial network

    const networkData = {
        payment: {
            amount: findPayment.amount,
            currency: findPayment.currency,
            paymentId:findPayment.paymentId
        },

        card: {
            cardNumber,
            expMonth,
            expYear,
            cvv,
        },
    };

    try {
        const { data } = await axios.post('http://localhost:6000/api/v1/financial/connect',networkData)

        console.log("its run 1")

        // Financial Network succeeded
        await prisma.payment.update({
            where: {
                id: findPayment.id
            },
            data: {
                paymentMethodId: paymentMethod.id,
                status: "AUTHORIZED"
            }
        })

        await axios.post(
            `${findPayment.apiBaseUrl}/api/v1/payment/processor`,
            {
                merchantReference: findPayment.merchantReference,
                paymentId: findPayment.paymentId,
                issuerStatus:data.issuerStatus
            }
        )

        await axios.patch(
            findPayment.webhookUrl,
            {
                userReference: findPayment.userReference,
                status: "APPROVED",
            }
        )

        return res.status(StatusCodes.OK).json({msg: data.msg,redirectUrl: findPayment.successUrl})

    } catch (error) {

        // Financial Network / Issuer declined the payment
        if (axios.isAxiosError(error)) {


            try{
                const {data} = await axios.post('http://localhost:6000/api/v1/financial/check' , {paymentId:findPayment.paymentId})

                console.log("its run 2")

                console.log(data.issuerStatus)

                if(data.issuerStatus === "completed"){
                    await axios.post(`${findPayment.apiBaseUrl}/api/v1/payment/processor`,
                        {
                            merchantReference: findPayment.merchantReference,
                            paymentId: findPayment.paymentId,
                            issuerStatus:data.issuerStatus
                        }
                    )

                    await axios.patch(findPayment.webhookUrl,
                        {
                            userReference: findPayment.userReference,
                            status: "APPROVED",
                        }
                    )

                    return res.status(StatusCodes.OK).json({msg: data.msg , redirectUrl: findPayment.successUrl})
                    
                }else if(data.issuerStatus === "incomplete"){
                    await prisma.payment.update({
                        where: {
                            id: findPayment.id
                        },
                        data: {
                            paymentMethodId: paymentMethod.id,
                            status: "CANCELED"
                        }
                    })

                    return res.status(StatusCodes.OK).json({msg: "transaction failed"})
                }


            }catch (reconciliationError) {
   
                try{
                    const {data} = await axios.post(`${findPayment.apiBaseUrl}/api/v1/payment/failedProcessor`,
                        {
                            merchantReference: findPayment.merchantReference,
                            paymentId: findPayment.paymentId,
                        }
                    )
                    
                    if(data.issuerStatus === "incomplete"){
                    await prisma.payment.update({
                            where: {
                                id: findPayment.id
                            },
                            data: {
                                paymentMethodId: paymentMethod.id,
                                status: "CANCELED"
                            }
                        })
                    }   

                    return res.status(StatusCodes.OK).json({msg:data.msg});
                }catch (recoveryError) {
                    await prisma.payment.update({
                        where: {
                            id: findPayment.id
                        },
                        data: {
                            paymentMethodId: paymentMethod.id,
                            status: "PENDING"
                        }
                    })
                    if (axios.isAxiosError(recoveryError)) {
                        return res.status(recoveryError.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(recoveryError.response?.data ||{ msg: "Online Bank recovery failed." });
                    }

                    throw recoveryError;
                }
            }

        }   

        throw error
    }
    
}


export const failedProcessCheck = async (req:Request , res:Response) =>{
    const {paymentId} = req.body 

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/check" , {paymentId})

        if(data.issuerStatus){

            await prisma.payment.update({
                where: {
                    paymentId: paymentId
                },
                data: {
                    status: "AUTHORIZED"
                }
            })

            return res.status(StatusCodes.OK).json({issuerStatus:data.issuerStatus})

        }

    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}