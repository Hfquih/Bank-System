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

    const {amount , currency , userId , successUrl , cancelUrl , webhookUrl} = req.body 

    const apiKey = req.header("x-api-key");
    const apiSecret = req.header("x-api-secret");



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
            name: findData.account.user.firstName,
            legalName: `${findData.account.user.firstName} ${findData.account.user.lastName}`,
            country: "US",
            defaultCurrency: findData.account.currency,
        },

        merchantAccount: {
            accountCode: findData.account.accountNumber,
            country: "US",
            currency: findData.account.currency,
            status: findData.account.status,
            apiBaseUrl:findData.account.apiBaseUrl
        },

        payment: {
            userReference: userId,
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


export const processor = async (req : Request , res : Response) =>{
    const {amount , currency , merchantReference} = req.body 

    const account = await prisma.account.findUnique({
        where:{
            accountNumber:merchantReference
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
                type:"payment",
                amount:amount,
                currency:currency,
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
                    increment : amount
                },
                availableBalance: {
                    increment : amount
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


    return res.sendStatus(StatusCodes.OK)

}
