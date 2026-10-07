import { StatusCodes } from "http-status-codes";
import Unauthorized from "../errors/Unauthorized";
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
            paymentId: findPayment.id,
            amount: findPayment.amount,
            currency: findPayment.currency,
            merchantReference: findPayment.merchantReference,
        },

        merchant: {
            merchantAccountId: findPayment.merchantAccount.id,
            accountCode: findPayment.merchantAccount.accountCode,
            country: findPayment.merchantAccount.country,
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
                paymentId: findPayment.id,
                merchantReference: findPayment.merchantReference,
                status: "APPROVED",
                amount: findPayment.amount,
                currency: findPayment.currency
            }
        )

        await axios.patch(
            findPayment.webhookUrl,
            {
                paymentId: findPayment.id,
                userReference: findPayment.userReference,
                status: "APPROVED",
                amount: findPayment.amount,
                currency: findPayment.currency
            }
        )

        return res.status(StatusCodes.OK).json({msg: data.msg,redirectUrl: findPayment.successUrl})

    } catch (error) {

        // Financial Network / Issuer declined the payment
        if (axios.isAxiosError(error)) {

            await prisma.payment.update({
                where: {
                    id: findPayment.id
                },
                data: {
                    paymentMethodId: paymentMethod.id,
                    status: "CANCELED"
                }
            })

            return res.status(error.response?.status ||StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
    
}