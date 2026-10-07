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
    const {payment , merchant , card } = req.body 

    const bin = card.cardNumber.slice(0, 6)

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
        const { data } = await axios.post(`${binRange.issuer.baseUrl}/api/v1/auth/authorized`,{ payment, card })

        if (data.status === "success") {
            return res.status(StatusCodes.OK).json({status: "success", msg: data.msg})
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error.response?.data || {msg: "Internal server error"})
        }

        throw error
    }
}
