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
import { access } from "fs";



const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl
  })
})


export const createFinancialNetwork = async (req : Request , res : Response) => {

    await prisma.$transaction(async(tx)=>{
        const FinancialNetwork = await tx.financialNetwork.create({
            data:{
                name: "Global Payment Network",
                code:"GPN"
            }
        })

        await tx.networkBrand.create({
            data:{
                name:"Visa",
                code:"VISA",
                networkId : FinancialNetwork.id
            }
        })

        await tx.networkBrand.create({
            data:{
                name:"Mastercard",
                code:"MC",
                networkId : FinancialNetwork.id
            }
        })

    })

    res.status(StatusCodes.CREATED).json({msg:"financial network created"})
}

export const MinkiyIssuer = async(req : Request , res : Response) => {

    const financialNetwork = await prisma.financialNetwork.findUnique({
        where : {
            code:"GPN"
        }
    })

    if(!financialNetwork){
        throw new NotFound("financial network dont found")
    }

    const brandNetworkVisa = await prisma.networkBrand.findFirst({
        where:{
            networkId:financialNetwork.id,
            code:"VISA"
        }
    })

    if(!brandNetworkVisa){
        throw new NotFound("financial Visa brand not found")
    }

    const brandNetworkMc = await prisma.networkBrand.findFirst({
        where:{
            networkId:financialNetwork.id,
            code:"MC"
        }
    })

    if(!brandNetworkMc){
        throw new NotFound("financial MC brand not found")
    }

    await prisma.$transaction(async (tx)=>{
        const minkiy = await tx.issuer.create({
            data:{
                name : "Minkiy Bank",
                code : "MINKIY",
                country: "USA",
                baseUrl:"http://localhost:8000",
                networkId:financialNetwork.id
            }
        })

        const visaStart = "400000"
        const visaEnd = "400999"

        const mastercardStart = "510000"
        const mastercardEnd = "510999"

        await tx.bINRange.create({
            data:{
                start:visaStart,
                end:visaEnd,
                length:6,
                networkId:financialNetwork.id,
                brandId:brandNetworkVisa.id,
                issuerId:minkiy.id,
                country:minkiy.country
            }
        })

        await tx.bINRange.create({
            data:{
                start:mastercardStart,
                end:mastercardEnd,
                length:6,
                networkId:financialNetwork.id,
                brandId:brandNetworkMc.id,
                issuerId:minkiy.id,
                country:minkiy.country
            }
        })
    })
    

    res.status(StatusCodes.CREATED).json({msg: "minkiy issuer created"})
}

export const connectIssuer = async (req : Request , res : Response) => {
    const {payment , card } = req.body 

    const bin = card.cardNumber.slice(0, 6)

    const binRange = await prisma.bINRange.findFirst({
        where: {
            start: { lte: bin },
            end: { gte: bin },
            length: bin.length,
            status: "ACTIVE",
        },
        include: {
            issuer: true,
            brand: true
        }
    })

    if(!binRange){
        throw new NotFound("bin range not found")
    }

    await prisma.networkPayment.create({

        data:{
            paymentId:payment.paymentId,
            issuerId:binRange.issuer.id
        }
    })

    
    try {
        const { data } = await axios.post(`${binRange.issuer.baseUrl}/api/v1/auth/authorized`,{ payment, card })

        if (data.issuerStatus === "success") {
            return res.status(StatusCodes.OK).json({issuerStatus: data.issuerStatus, msg: data.msg})
        }

    } catch (error) {
        console.log("its running")
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}

export const verifyCard = async (req : Request , res : Response) => {
    const {cardNumber , expMonth , expYear , cvv , baseUrl} = req.body

    const bin = cardNumber.slice(0, 6)

    const binRange = await prisma.bINRange.findFirst({
        where: {
            start: { lte: bin },
            end: { gte: bin },
            length: bin.length,
            status: "ACTIVE"
        },
        include: {
            issuer: true,
        }
    })

    if(!binRange){
        throw new NotFound("bin range not found")
    }

    const last4 = cardNumber.slice(-4);

    const token = crypto.randomBytes(32).toString("hex");

    try{
        const {data} = await axios.post(`${binRange.issuer.baseUrl}/api/v1/auth/verify-card` , {cardNumber , expMonth , expYear , cvv})

        if(data.status === "success"){
            const network = await prisma.networkToken.create({
                data:{
                    token:token,
                    networkId:binRange.networkId,
                    issuerId:binRange.issuerId,
                    issuerCardId:data.cardId,
                    baseUrl:baseUrl
                }
            })

            return res.status(StatusCodes.OK).json({status:data.status , msg:data.msg , token:network.token , brand:data.brand , last4})
        }

    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}


export const depositeFinancial = async (req:Request , res:Response) => {
    const {amount , description , token , paymentId , merchantReferance} = req.body 

    const getNetwork = await prisma.networkToken.findFirst({
        where:{
            token:token,
            status:"ACTIVE"
        },
        include:{
            issuer:true 
        }
    })

    if(!getNetwork){
        throw new NotFound("Invalid Card")
    }

    try{
        const {data} = await axios.post(`${getNetwork.issuer.baseUrl}/api/v1/auth/deposite` , {amount , description , cardId:getNetwork.issuerCardId})

        if(data.issuerStatus==="success"){
            return res.status(StatusCodes.OK).json({msg:data.msg , issuerStatus:data.status})
        }
    }catch (error) {

        // Financial Network / Issuer declined the payment
        if (axios.isAxiosError(error)) {


            try{
                const {data} = await axios.post(`${getNetwork.issuer.baseUrl}/api/v1/auth/check-issuer` , {paymentId}) 

                return res.status(StatusCodes.OK).json({msg: data.msg , issuerStatus:data.issuerStatus})

            }catch (reconciliationError) {
                
                try {
                    const { data } = await axios.post(
                        `${getNetwork.baseUrl}/payment/failed-Deposite`,
                        { paymentId, merchantReferance }
                    );

                    return res.status(StatusCodes.OK).json({msg:data.msg});

                }catch (recoveryError) {
                    if (axios.isAxiosError(recoveryError)) {
                        return res.status(recoveryError.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(recoveryError.response?.data ||{ msg: "Online Bank recovery failed." });
                    }

                    throw recoveryError;
                }

            }
        }   
    }
}


export const withdrawalFinancial = async (req:Request , res:Response) => {
    const {amount , description , token , merchantReferance , paymentId} = req.body 

    const getNetwork = await prisma.networkToken.findFirst({
        where:{
            token:token,
            status:"ACTIVE"
        },
        include:{
            issuer:true 
        }
    })

    if(!getNetwork){
        throw new NotFound("Invalid Card")
    }

    try{
        const {data} = await axios.post(`${getNetwork.issuer.baseUrl}/api/v1/auth/withdrawal` , {amount , description , cardId:getNetwork.issuerCardId})

        if(data.issuerStatus==="success"){
            return res.status(StatusCodes.OK).json({msg:data.msg , issuerStatus:data.status})
        }
    }catch (error) {

        // Financial Network / Issuer declined the payment
        if (axios.isAxiosError(error)) {


            try{
                const {data} = await axios.post(`${getNetwork.issuer.baseUrl}/api/v1/auth/check-issuer` , {paymentId}) 

                return res.status(StatusCodes.OK).json({msg: data.msg , issuerStatus:data.issuerStatus})

            }catch (reconciliationError) {
                
                try {
                    const { data } = await axios.post(
                        `${getNetwork.baseUrl}/payment/failed-Deposite`,
                        { paymentId, merchantReferance }
                    );

                    return res.status(StatusCodes.OK).json({msg:data.msg});

                }catch (recoveryError) {
                    if (axios.isAxiosError(recoveryError)) {
                        return res.status(recoveryError.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(recoveryError.response?.data ||{ msg: "Online Bank recovery failed." });
                    }

                    throw recoveryError;
                }

            }
        }   
    }
}


export const bankWithdrawal = async (req : Request , res : Response) => {
    const {amount , cardNumber , description } = req.body 

    const bin = cardNumber.slice(0, 6)

    const binRange = await prisma.bINRange.findFirst({
        where: {
            start: { lte: bin },
            end: { gte: bin },
            length: bin.length,
            status: "ACTIVE"
        },
        include: {
            issuer: true,
            brand: true
        }
    })

    if(!binRange){
        throw new NotFound("bin range not found")
    }

    
    try {
        const { data } = await axios.post(`${binRange.issuer.baseUrl}/api/v1/auth/bank-withdrawal`,{ amount, cardNumber, description })

        if (data.status === "success") {
            return res.status(StatusCodes.OK).json({issuerStatus: data.issuerStatus , msg: data.msg})
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}


export const financialCheck = async (req : Request , res : Response) => {
    const {paymentId} = req.body 

    const issuer = await prisma.networkPayment.findUnique({
        where:{
            paymentId:paymentId,
        },
        include:{
            issuer:true 
        }
    })

    if(!issuer){
        throw new NotFound("issuer not found")
    }

    try{
        const {data} = await axios.post(`${issuer.issuer.baseUrl}/api/v1/auth/check-issuer` , {paymentId})

        if(data.issuerStatus){
            return res.status(StatusCodes.OK).json({issuerStatus:data.issuerStatus , msg:data.msg})
        }
    }catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}