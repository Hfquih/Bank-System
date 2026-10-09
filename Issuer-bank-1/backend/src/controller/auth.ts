import { StatusCodes } from "http-status-codes";
import Unauthorized from '../errors/Unauthorized'
import BadRequest from "../errors/BadRequest";
import NotFound from "../errors/NotFound";
import { createJWT , hashPass , comparePasse } from "../util/util";
import { Request , Response } from "express";
import crypto from "crypto";

//import {PrismaClient , Prisma} from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient, Prisma , LedgerEntryType, Transaction, TransactionStatus, TransactionType } from "../../generated/prisma/client.js";
import da from "zod/v4/locales/da.js";
import { TransactionCreateInput, TransactionWhereInput } from "../../generated/prisma/models";
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


export const register = async (req : Request , res : Response) => {
  const {firstName , lastName , email , phone , password , confirmPassord} = req.body 

  const hashedPass = await hashPass(password)

  function generateAccountNumber(): string {
    return Math.floor(
      100000000000 + Math.random() * 900000000000
    ).toString();
  }

  await prisma.$transaction(async(tx)=>{
    const customer = await tx.customer.create({
      data : {
        firstName,
        lastName,
        email,
        phone,
        password:hashedPass,
        confirmPassword:hashedPass
      }
    })

    await tx.account.create({
      data:{
        accountNumber : generateAccountNumber(),
        balance:0,
        availableBalance:0,
        currency:"USD",
        customerId:customer.id
      }
    })
  })

  return(res.status(StatusCodes.CREATED).json({msg : "account created"}))
}


export const login = async (req : Request , res : Response) => {
  const {email , password} = req.body

  if(!email || !password){
    throw new BadRequest("please provide all info")
  }

  const customer = await prisma.customer.findFirst({
    where : {
      email,
      status:"ACTIVE"
    }
  })

  if(!customer){
    throw new Unauthorized("invalid credential")
  }

  const match = await comparePasse(password , customer.password)

  if(!match){
    throw new Unauthorized("invalid credential")
  }

  if(customer.isDeleted){
    throw new Unauthorized("account disabled")
  }

  const token = createJWT(customer)

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(StatusCodes.OK).json({msg : `welcome ${customer.firstName}`})

}

export const logout = async (req: Request, res: Response) => {
    
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.status(200).json({
        msg: "Logged out successfully",
    });

}


export const getCustomer = async (req : Request , res : Response) => {
  const customerId = (req.user as { id: number }).id

  const customer = await prisma.customer.findUnique({
    where : {
      id : customerId
    }
  })

  if(!customer){
    throw new NotFound("customer not found")
  }

  res.status(StatusCodes.OK).json({customer})
}


export const updateCustomer = async (req : Request , res : Response) =>{
  const customerId = (req.user as { id: number }).id

  const customer = await prisma.customer.findUnique({
    where : {
      id : customerId
    }
  })

  if(!customer){
    throw new NotFound("customer not found")
  }

  const {firstName , lastName , email , phone , password , confirmPassword} = req.body


  const data : {
    firstName?:string,
    lastName?:string,
    email?:string,
    phone?:string,
    password?:string,
    confirmPassword?:string
  }={
    firstName,
    lastName,
    email,
    phone
  }

  if(password && confirmPassword){
    data.password = await hashPass(password),
    data.confirmPassword=await hashPass(confirmPassword)
  }

  await prisma.customer.update({
    where:{
      id : customer.id
    },
    data
  })

  res.status(StatusCodes.OK).json({msg:"Info updated"})
}


export const getAccount = async (req : Request , res:Response) => {
  const customerId = (req.user as { id: number }).id

  const account = await prisma.account.findFirst({
    where:{
      customerId : customerId,
      status : "ACTIVE"
    },
    include : {
      customer : true
    }
  })

  if(!account){
    throw new NotFound("Account not found")
  }

  res.status(StatusCodes.OK).json({account})
}


export const createTransaction = async (req : Request , res : Response) =>{
  const customerId = (req.user as { id: number }).id

  const debitAccount = await prisma.account.findFirst({
    where : {
      customerId : customerId,
      status:"ACTIVE"
    }
  })

  if(!debitAccount){
    throw new NotFound("account not found")
  }


  const {amount , accountNumber , description} = req.body 

  if (debitAccount.balance.lt(amount)) {
    throw new BadRequest("Insufficient balance")
  }

  const creditAccount = await prisma.account.findFirst({
    where : {
      accountNumber : accountNumber,
      status:"ACTIVE"
    }
  })

  if(!creditAccount){
    throw new NotFound("account not found")
  }

  if (debitAccount.id === creditAccount.id) {
    throw new BadRequest("You cannot transfer money to yourself")
  }

  const reference = `TRX-${crypto.randomUUID()}`;

  const TransactionData : TransactionCreateInput = {
    reference,
    type:"transfer",
    amount, 
    currency:"USD",
    description:description
  }


  await prisma.$transaction(async (tx)=>{
    const transaction = await tx.transaction.create({
      data:TransactionData
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId : transaction.id,
        accountId : debitAccount.id,
        type:"debit",
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId : transaction.id,
        accountId : creditAccount.id,
        type:"credit",
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.account.update({
      where :{
        id: debitAccount.id
      },
      data:{
        balance : {decrement : amount},
        availableBalance : {decrement : amount}
      }
    })

    await tx.account.update({
      where :{
        id: creditAccount.id
      },
      data:{
        balance : {increment : amount},
        availableBalance : {increment : amount}
      }
    })

    await tx.transaction.update({
      where : {
        id : transaction.id
      },
      data:{
        status:"completed"
      }
    })
  })

  res.status(StatusCodes.OK).json({msg:'Transaction completed'})
  
}


export const createRequest = async (req : Request , res : Response) => {
  const customerId = (req.user as { id: number }).id

  const requesterAccount = await prisma.account.findFirst({
    where : {
      customerId : customerId,
      status : "ACTIVE"
    }
  })

  if(!requesterAccount){
    throw new NotFound("sorry, we dont found this account")
  }

  const {amount , accountNumber , description} = req.body 

  const recipientAccount = await prisma.account.findFirst({
    where:{
      accountNumber:accountNumber,
      status:"ACTIVE"
    }
  })

  if(!recipientAccount){
    throw new NotFound("sorry, we dont found this account")
  }

  if (requesterAccount.id === recipientAccount.id) {
    throw new BadRequest("You cannot request money from yourself")
  }

  await prisma.moneyRequest.create({
    data:{
      amount:amount,
      currency:"USD",
      description:description,
      requesterAccountId:requesterAccount.id,
      recipientAccountId:recipientAccount.id,

    }
  })

  res.status(StatusCodes.CREATED).json({msg:"request money created"})
}


export const getTransaction = async (req : Request , res : Response) => {
  const customerId = (req.user as { id: number }).id
  const {search , type , status , transferType} = req.query
  const queryObject :Prisma.LedgerEntryWhereInput = {}

  if(type && Object.values(LedgerEntryType).includes(type as LedgerEntryType)){
        queryObject.type = type as LedgerEntryType
    }

    if(status && Object.values(TransactionStatus).includes(status as TransactionStatus)){
        queryObject.transaction ={status : status as TransactionStatus}
    }

    if(transferType && Object.values(TransactionType).includes(transferType as TransactionType)){
        queryObject.transaction = {type : transferType as TransactionType}
    }

   if(typeof search === "string" && search.trim()){
        queryObject.transaction={reference:{ contains : search , mode:"insensitive"}}
    }


  const account = await prisma.account.findFirst({
    where : {
      customerId : customerId
    }
  })

  if(!account){
    throw new NotFound("we dont found this account")
  }
  
  const Transaction = await prisma.ledgerEntry.findMany({
    where : {
      accountId : account.id,
      ...queryObject
    },
    include:{
      transaction:true,
      account:true
    }
  })

  res.status(StatusCodes.OK).json({Transaction})
}

export const getRequest = async(req : Request , res : Response) => {
  const customerId = (req.user as { id: number }).id

  const account = await prisma.account.findFirst({
    where:{
      customerId : customerId,
      status : "ACTIVE"
    }
  })

  if(!account){
    throw new NotFound("account not found")
  }

  const debitRequest = await prisma.moneyRequest.findMany({
    where : {
      recipientAccountId : account.id
    }
  })

  const creditRequest = await prisma.moneyRequest.findMany({
    where : {
      requesterAccountId : account.id
    }
  })

  res.status(StatusCodes.OK).json({debitRequest , creditRequest})
}

export const acceptRequest = async (req:Request , res:Response) => {
    const requestId = Number(req.params.id)

    const customerId = (req.user as { id: number }).id

    const recipentAccount = await prisma.account.findFirst({
        where : {customerId : customerId , status:"ACTIVE"}
    })

    if(!recipentAccount){
        throw new NotFound('account not found')
    }

    const request = await prisma.moneyRequest.findFirst({
        where :{
            id:requestId , recipientAccountId : recipentAccount.id , status : "pending"
        }
    })

    if(!request){
        throw new NotFound("request not found")
    }

    if (recipentAccount.availableBalance.lt(request.amount)) {
        throw new BadRequest("Insufficient balance")
    }

    const reference = `TRX-${crypto.randomUUID()}`;

    await prisma.$transaction(async(tx)=>{
        const transaction = await tx.transaction.create({
            data :{
                reference , type : "transfer" , amount : request.amount , currency : request.currency
            }
        })

        await tx.ledgerEntry.create({
            data : {
                transactionId : transaction.id , accountId : request.recipientAccountId , type : "debit" , amount : request.amount , currency : request.currency
            }
        })

        await tx.ledgerEntry.create({
            data : {
                transactionId : transaction.id , accountId : request.requesterAccountId , type : "credit" , amount : request.amount , currency : request.currency
            }
        })

        await tx.transaction.update({
            where : {id:transaction.id},
            data : {status : "completed"}
        })

        await tx.moneyRequest.update({
            where : {id : request.id},
            data : {status : "accepted"}
        })

        await tx.account.update({
            where:{id : request.recipientAccountId},
            data : {balance:{decrement : request.amount} , availableBalance:{decrement : request.amount}}
        })

        await tx.account.update({
            where : {id:request.requesterAccountId},
            data : {balance : {increment : request.amount} , availableBalance : {increment : request.amount}}
        })
    })

    res.status(StatusCodes.OK).json({msg : "Request Accepted"})
}

export const rejectRequest = async (req:Request , res:Response) => {
    const customerId = (req.user as { id: number }).id

    const requestId = Number(req.params.id)

    const account = await prisma.account.findFirst({
        where : {customerId : customerId , status:"ACTIVE"}
    })

    if(!account){
        throw new NotFound('account not found')
    }

    const request = await prisma.moneyRequest.findFirst({
        where : {
            id:requestId,
            recipientAccountId : account.id,
            status:"pending"
        }
    })

    if(!request){
        throw new NotFound('request not found')
    }

    await prisma.moneyRequest.update({
        where:{
            id : request.id
        },
        data:{
            status : "rejected"
        }
    })

    res.status(200).json({msg : "request rejected"})
}


export const withdrawalRequest = async (req:Request , res:Response) => {
    const {amount , cardNumber , description} = req.body

    const customerId = (req.user as { id: number }).id

    const account = await prisma.account.findFirst({
      where:{
        customerId:customerId,
        status:"ACTIVE"
      }
    })

    if(!account){
      throw new NotFound("account not found")
    }

    if(account.balance.lt(amount)) {
        throw new BadRequest("Insufficient balance")
    }

    const reference = `TRX-${crypto.randomUUID()}`;

    try{
        const {data} = await axios.post("http://localhost:6000/api/v1/financial/bank-withdrawal" , {amount , cardNumber , description})

        if(data.status==="success"){
          await prisma.$transaction(async (tx)=>{
            const transaction = await tx.transaction.create({
              data:{
                reference:reference,
                type:"withdrawal",
                amount,
                currency:"USD",
                description
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
                id: account.id 
              },
              data:{
                balance:{
                  decrement:amount
                },
                availableBalance:{
                  decrement:amount
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
        }

    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}


// card section //

export const createCard = async (req:Request , res:Response) => {
  const customerId = (req.user as { id: number }).id

  const {cardType , cardBrand} = req.body

  const account = await prisma.account.findFirst({
    where:{
      customerId:customerId,
      status:"ACTIVE"
    }
  })

  if(!account){
    throw new NotFound("account not found")
  }

  let start: string
  let end: string

  if (cardBrand === "VISA") {
    start = "400000"
    end = "400999"
  } else if (cardBrand === "MASTERCARD") {
    start = "510000"
    end = "510999"
  } else {
    throw new BadRequest("invalid card brand")
  }

  const bin = crypto.randomInt(Number(start), Number(end) + 1).toString().padStart(start.length, "0")

  const remainingDigits = Array.from({ length: 10 },() => crypto.randomInt(0, 10)).join("")

  const cardNumber = `${bin}${remainingDigits}`

  const expMonth = new Date().getMonth() + 1
  const expYear = new Date().getFullYear() + 4

  const cvv = crypto.randomInt(100, 1000).toString()

  await prisma.card.create({
    data:{
      cardNumber:cardNumber,
      brand:cardBrand,
      type:cardType,
      expMonth:expMonth,
      expYear:expYear,
      cvv:cvv,
      accountId:account.id
    }
  })

  return res.status(StatusCodes.OK).json({msg:"Card created"})

}


export const financialNetwork = async (req : Request , res : Response) => {
  const {payment , card} = req.body

  const findAccount = await prisma.card.findFirst({
    where:{
      cardNumber:card.cardNumber,
      expMonth:card.expMonth,
      cvv:card.cvv
    },
    include:{
      account:true 
    }
  })

  if(!findAccount){
    throw new NotFound("incorrect card info")
  }

  if(findAccount.account.balance.lt(payment.amount)) {
    throw new BadRequest("Insufficient balance")
  }

  const reference = `TRX-${crypto.randomUUID()}`;

  await prisma.$transaction(async (tx)=>{
    const transaction = await tx.transaction.create({
      data:{
        reference:reference,
        type:"payment",
        amount:payment.amount,
        currency:payment.currency,
        description:''
      }
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId:transaction.id,
        accountId:findAccount.account.id,
        type:'debit',
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.account.update({
      where:{
        id:findAccount.account.id
      },
      data:{
        balance:{
          decrement:transaction.amount
        },
        availableBalance:{
          decrement:transaction.amount
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
  
  res.status(StatusCodes.OK).json({msg:"payment success" , status:"success"})
}


export const myCard = async (req:Request , res:Response) => {
  const customerId = (req.user as { id: number }).id

  const account = await prisma.account.findFirst({
    where:{
      customerId:customerId,
      status:"ACTIVE"
    }
  })

  if(!account){
    throw new NotFound("account not found")
  }

  const card = await prisma.card.findMany({
    where:{
      accountId:account.id,
      status:"ACTIVE"
    }
  })

  if(!card){
    throw new NotFound("cart not found")
  }

  res.status(StatusCodes.OK).json({card})
}


export const verifyCard = async (req:Request , res:Response)=>{
  const {cardNumber , expMonth , expYear , cvv} = req.body 

  const findCard = await prisma.card.findFirst({
    where:{
      cardNumber,
      expMonth,
      expYear,
      cvv,
      status:"ACTIVE"
    }
  })

  if(!findCard){
    throw new NotFound("incorrect card info")
  }

  res.status(StatusCodes.OK).json({msg:"Card verified" , status:"success" , brand:findCard.brand , cardId:findCard.id})
}


export const onlineBankDeposite = async (req:Request , res:Response) => {
  const {amount , description , cardId} = req.body 

  const account = await prisma.card.findFirst({
    where:{
      id:cardId,
      status:"ACTIVE"
    },
    include:{
      account:true 
    }
  })

  if(!account){
    throw new NotFound("account not found")
  }

  if(account.account.balance.lt(amount)) {
    throw new BadRequest("Insufficient balance")
  }

  const reference = `TRX-${crypto.randomUUID()}`;

  await prisma.$transaction(async (tx)=>{
    const transaction = await tx.transaction.create({
      data:{
        reference:reference,
        type:"withdrawal",
        amount:amount,
        currency:"USD",
        description:description
      }
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId:transaction.id,
        accountId: account.account.id,
        type:'debit',
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.account.update({
      where:{
        id:account.account.id
      },
      data:{
        balance:{
          decrement:transaction.amount
        },
        availableBalance:{
          decrement:transaction.amount
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
  
  res.status(StatusCodes.OK).json({msg:"payment success" , status:"success"})


}


export const onlineBankwithdrawal = async (req:Request , res:Response) => {
  const {amount , description , cardId} = req.body 

  const account = await prisma.card.findFirst({
    where:{
      id:cardId,
      status:"ACTIVE"
    },
    include:{
      account:true 
    }
  })

  if(!account){
    throw new NotFound("account not found")
  }

  const reference = `TRX-${crypto.randomUUID()}`;

  await prisma.$transaction(async (tx)=>{
    const transaction = await tx.transaction.create({
      data:{
        reference:reference,
        type:"deposit",
        amount:amount,
        currency:"USD",
        description:description
      }
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId:transaction.id,
        accountId: account.account.id,
        type:"credit",
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.account.update({
      where:{
        id:account.account.id
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
  
  res.status(StatusCodes.OK).json({msg:"payment success" , status:"success"})


}

export const bankWithdrawal = async (req : Request , res : Response) => {
  const {amount , cardNumber , description} = req.body

  const findAccount = await prisma.card.findFirst({
    where:{
      cardNumber:cardNumber,
    },
    include:{
      account:true 
    }
  })

  if(!findAccount){
    throw new NotFound("incorrect card info")
  }

  const reference = `TRX-${crypto.randomUUID()}`;

  await prisma.$transaction(async (tx)=>{
    const transaction = await tx.transaction.create({
      data:{
        reference:reference,
        type:"payment",
        amount:amount,
        currency:"USD",
        description:description
      }
    })

    await tx.ledgerEntry.create({
      data:{
        transactionId:transaction.id,
        accountId:findAccount.account.id,
        type:'credit',
        amount:transaction.amount,
        currency:transaction.currency
      }
    })

    await tx.account.update({
      where:{
        id:findAccount.account.id
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
  
  res.status(StatusCodes.OK).json({msg:"withdrawal success" , status:"success"})
}