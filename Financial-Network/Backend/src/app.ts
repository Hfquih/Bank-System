import 'dotenv/config'
import express from "express"
import connectDb from './DB/connectDb'
import financial from "./router/network"
import { errorHandler } from './middleware/errorHandler'
import notFound from './middleware/notFound'
import cors from "cors"


const app = express()

const allowedOrigins = process.env.FRONTEND_URL?.split(",");

app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE" , "PATCH"]
}))

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/v1/financial' , financial)
app.use(errorHandler)
app.use(notFound)


const start = async () => {
    if(!process.env.DATABASE_URL){
        return("db connection error")
    }
    try{
        connectDb(process.env.DATABASE_URL)
        app.listen(port , ()=>console.log('server lestening'))
    }catch(error){
        console.log(error)
    }
}

start()