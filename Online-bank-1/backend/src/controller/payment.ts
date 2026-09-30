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

    const {amount , currency , orderReference , successUrl , cancelUrl , webhookUrl} = req.body 

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
        },

        payment: {
            merchantReference: orderReference,
            amount: amount,
            currency,
            successUrl,
            cancelUrl
        },
    };

    const {data} = await axios.post('http://localhost:2000/api/v1/payment/payment-sessions', processorData)

    console.log(data)

    res.status(StatusCodes.OK).json({checkoutUrl:data.checkoutUrl})
}
