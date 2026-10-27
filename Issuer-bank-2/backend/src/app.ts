import 'dotenv/config'

import express from "express"
const app = express()
import auth from "./router/auth"
import connectDb from './connectDb/connectDb'
import { errorHandler } from './middleware/errorHandler'
import notFound from './middleware/notFound'
import NotFound from './errors/NotFound'

import cors from "cors"
import helmet from 'helmet'
import {rateLimit} from "express-rate-limit"

import cookieParser from "cookie-parser"

app.use(cookieParser())

app.use(helmet())
const allowedOrigins = process.env.FRONTEND_URL?.split(",");
app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE" , "PATCH"]
}))
app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/v1/auth' , auth)
app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT || 5000

const start = async () => {
    const DBURL = process.env.DATABASE_URL
    if(!DBURL){
        throw new NotFound("url not found")
    }
    try{
        await connectDb(DBURL)
        app.listen(port , ()=>console.log("server lestening"))
    }catch(error){
        console.log(error)
    }
}

start()