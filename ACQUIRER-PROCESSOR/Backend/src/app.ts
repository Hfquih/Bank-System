import 'dotenv/config'
import express from "express"
import connectDb from './DB/connectDb'
import payment from './router/processor'
import notFound from './middleware/notFound'
import errorHandler from './middleware/errorHandler'


const app = express()

const port = process.env.PORT || 2000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/v1/payment' , payment)
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