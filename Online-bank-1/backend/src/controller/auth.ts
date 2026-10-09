import { StatusCodes } from "http-status-codes";
import Unauthorized from '../errors/Unauthorized'
import BadRequest from "../errors/BadRequest";
import NotFound from "../errors/NotFound";
import { createJWT , hashPass , comparePasse } from "../util/util";
import { Request , Response } from "express";
import crypto from "crypto";

import {PrismaClient , Prisma , LedgerEntryType, TransactionStatus, TransactionType } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { TransactionCreateInput , MoneyRequestCreateInput, LedgerEntryWhereInput } from "../generated/prisma/models";


const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl
  })
})


export const register = async (req:Request , res:Response) => {
    const {firstName , lastName , phone , email , password , confirmPassword} = req.body 

    if(!firstName || !lastName || !phone || !email || !password || !confirmPassword){
        throw new BadRequest('please provide all information!')
    }

    const hashedPassword = await hashPass(password)

    function generateAccountNumber(): string {
        return Math.floor(
            100000000000 + Math.random() * 900000000000
        ).toString();
    }

    await prisma.$transaction((async(tx)=>{
        const user = await tx.user.create({data:{
            firstName:firstName , lastName:lastName , phone:phone , email:email , password:hashedPassword , confirmPassword:hashedPassword
        }})

        await tx.account.create({data:{
            userId: user.id,
            accountNumber: generateAccountNumber(),
            balance: 0,
            availableBalance: 0,
            currency: "USD",
            apiBaseUrl:"http://localhost:5000"
        }})
    }))

    

    res.status(StatusCodes.CREATED).json({msg:'User Created'})
}

export const login = async (req:Request , res:Response) => {
    const {email , password} = req.body 

    if(!email || !password){
        throw new BadRequest('please provide all info')
    }

    const user = await prisma.user.findUnique({
        where:{email:email}
    })

    if(!user){
        throw new Unauthorized('invalid credential')
    }

    if(user.isDeleted){
        throw new Unauthorized('account disabled')
    }

    const isMatch = await comparePasse(password , user.password)

    if(!isMatch){
        throw new Unauthorized('invalid credential')
    }

    const token = createJWT(user)

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(StatusCodes.OK).json({msg:`Welcom ${user.firstName}`})
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

export const getUser = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const user = await prisma.user.findUnique({
        where:{id:userId}
    })

    if(!user){
        throw new NotFound(`their is no user with this : ${userId}`)
    }

    res.status(StatusCodes.OK).json({user})
}

type Data = {
    firstName : string,
    lastName : string,
    phone : string,
    email: string,
    password ?: string,
    confirmPassword?: string
}

export const updateUser = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id
    
    const {firstName , lastName , phone , email , password , confirmPassword} = req.body

    const data : Data = {
        firstName ,
        lastName,
        phone,
        email
    }

    if(password){
        data.password = await hashPass(password)
        data.confirmPassword = await hashPass(confirmPassword)
    }

    const user = await prisma.user.findUnique({
        where:{id:userId}
    })

    if(!user){
        throw new NotFound(`their is no user with this id: ${userId}`)
    }

    await prisma.user.update({
        where:{id:user.id},
        data
    })

    res.status(StatusCodes.OK).json({msg:'USER UPDATED'})
}


export const getUserAccount = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const user = await prisma.user.findFirst({
        where : {id : userId , status:"active"}
    })

    if(!user){
        throw new NotFound(`their is no user with this id: ${userId}`)
    }

    const account = await prisma.account.findFirst({
        where:{userId : user.id , status:"active"}
    })

    res.status(StatusCodes.OK).json({account})
}


export const createUserTransaction = async(req : Request , res : Response) => {
    const userId = (req.user as { id: number }).id

    const {amount , description , accountNumber} = req.body 

    const user = await prisma.user.findUnique({
        where : {id:userId}
    })

    if(!user){
        throw new NotFound(`their is no user with this id: ${userId}`)
    }

    const account = await prisma.account.findUnique({
        where:{userId:user.id}
    })

    if(!account){
        throw new NotFound("account not found")
    }

    if (account.balance.lt(amount)) {
        throw new BadRequest("Insufficient balance")
    }

    const receiverAccount = await prisma.account.findUnique({
        where : {accountNumber : accountNumber}
    })

    if(!receiverAccount){
        throw new NotFound("account not found")
    }

    if (account.id === receiverAccount.id) {
        throw new BadRequest("You cannot transfer money to yourself")
    }

    const reference = `TRX-${crypto.randomUUID()}`;

    const transactionData : TransactionCreateInput={
        reference,
        type:"transfer",
        amount,
        currency:'USD'
    }

    if(description){
        transactionData.description = description
    }


    await prisma.$transaction(async(tx)=>{
        const transaction = await tx.transaction.create({
            data:transactionData
        })

        await tx.ledgerEntry.create({
            data : {transactionId : transaction.id , accountId : account.id , type:"debit" , amount , currency:"USD"}
        })

        await tx.ledgerEntry.create({
            data : {transactionId : transaction.id , accountId : receiverAccount.id , type:"credit" , amount , currency:"USD"}
        })

        await tx.account.update({
            where:{userId : user.id},
            data:{balance:{decrement : amount} , availableBalance:{decrement : amount}}
        })

        await tx.account.update({
            where:{accountNumber : accountNumber},
            data:{balance:{increment : amount} , availableBalance:{increment : amount}}
        })

        await tx.transaction.update({
            where:{
                id:transaction.id
            },
            data:{
                status:'completed'
            }
        })
    })

    res.status(StatusCodes.OK).json({msg:'Transaction completed'})
}

export const getUserTransfer = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const {search , type , status , transferType} = req.query
    const queryObject : Prisma.LedgerEntryWhereInput  = {}

    if(type && Object.values(LedgerEntryType).includes(type as LedgerEntryType)){
        queryObject.type = type as LedgerEntryType
    }

    if(status && Object.values(TransactionStatus).includes(status as TransactionStatus)){
        queryObject.transaction = {status : status as TransactionStatus}
    }

    if(transferType && Object.values(TransactionType).includes(transferType as TransactionType)){
        queryObject.transaction = {type : transferType as TransactionType}
    }

    if(typeof search === "string" && search.trim()){
        queryObject.transaction={reference:{ contains : search , mode:"insensitive"}}
    }


    const account = await prisma.account.findUnique({
        where : {userId : userId}
    })

    if(!account){
        throw new NotFound('account not found')
    }

    const transfer = await prisma.ledgerEntry.findMany({
        where : {accountId:account.id  , ...queryObject},
        include : {
            account : true ,
            transaction:true
        }
    })

    res.status(StatusCodes.OK).json({transfer})
}


export const requestMoney = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const {amount , accountNumber , description} = req.body 

    if (amount <= 0) {
        throw new BadRequest("Amount must be greater than 0")
    }

    const requesterAccount = await prisma.account.findUnique({
        where : {userId : userId}
    })

    if(!requesterAccount){
        throw new NotFound('sender account not found')
    }

    const recipientAccount = await prisma.account.findUnique({
        where : {accountNumber : accountNumber}
    })

    if(!recipientAccount){
        throw new NotFound('receiver account not found')
    }

    if (requesterAccount.id === recipientAccount.id) {
        throw new BadRequest("You cannot request money from yourself")
    }

    const data : MoneyRequestCreateInput = {
        amount,
        currency:'USD',
        requester:{
            connect : {id : requesterAccount.id}
        },
        recipient:{
            connect : {id : recipientAccount.id}
        }
    }

    if(description){
        data.description = description
    }

    const request = await prisma.moneyRequest.create({
        data
    })

    res.status(StatusCodes.OK).json({msg:'Money request sent'})
}


export const getDemandRequest = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const account = await prisma.account.findUnique({
        where:{userId:userId}
    })

    if(!account){
        throw new NotFound('account not found')
    }

    const demande = await prisma.moneyRequest.findMany({
        where : {requesterAccountId : account.id}
    })

    const request = await prisma.moneyRequest.findMany({
        where : {recipientAccountId : account.id}
    })

    res.status(StatusCodes.OK).json({demande , request})
}


export const acceptRequest = async (req:Request , res:Response) => {
    const requestId = Number(req.params.requestId)

    const userId = (req.user as { id: number }).id

    const account = await prisma.account.findUnique({
        where : {userId : userId}
    })

    if(!account){
        throw new NotFound('account not found')
    }

    const request = await prisma.moneyRequest.findFirst({
        where :{
            id:requestId , recipientAccountId : account.id , status : "pending"
        }
    })

    if(!request){
        throw new NotFound("request not found")
    }

    if (account.availableBalance.lt(request.amount)) {
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
    const userId = (req.user as { id: number }).id

    const requestId = Number(req.params.requestId)

    const account = await prisma.account.findUnique({
        where : {userId : userId}
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


export const createAPIKey = async (req: Request, res: Response) => {
  const userId = (req.user as { id: number }).id

  const account = await prisma.account.findUnique({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new NotFound("account not found")
  }

  const existingApi = await prisma.aPIKey.findFirst({
    where : {accountId : account.id , status:"active"}
  })

  if(existingApi){
    throw new BadRequest('you already have an apiKey, if you want a new one delete the current one')
  }

  const { name } = req.body;

  const apiKey = `bank_pk_${crypto.randomBytes(24).toString("hex")}`;
  const apiSecret = `bank_sk_${crypto.randomBytes(32).toString("hex")}`;

  const newAPIKey = await prisma.aPIKey.create({
    data: {
      name,
      apiKey,
      apiSecret,
      accountId: account.id,
    },
  });

  return res.status(StatusCodes.CREATED).json({msg:'Data created'});
};


export const getUserKey = async(req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const account = await prisma.account.findUnique({
        where: {userId : userId}
    })

    if(!account){
        throw new NotFound("account not found")
    }

    const apiInfo = await prisma.aPIKey.findFirst({
        where : {accountId : account.id , status:'active'}
    })

    if (!apiInfo) {
        throw new NotFound("No active API key found");
    }

    res.status(StatusCodes.OK).json({apiInfo})
}

export const deleteAPIKey = async (req:Request , res:Response) => {
    const userId = (req.user as { id: number }).id

    const account = await prisma.account.findUnique({
        where : {
            userId : userId
        }
    })

    if(!account){
        throw new NotFound("Account not found")
    }

    const currentApiKey = await prisma.aPIKey.findFirst({
        where : {
            accountId : account.id,
            status:"active"
        }
    })

    if(!currentApiKey){
        throw new NotFound("you have no created api key")
    }

    await prisma.aPIKey.update({
        where:{
            id : currentApiKey.id,
        },
        data:{
            status:'revoked'
        }
    })
    res.status(StatusCodes.OK).json({msg:"api key revoked"})
}