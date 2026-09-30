import 'dotenv/config'
import express from "express"
import connectDb from './DB/connectDb'
import notFound from './middleware/notFound'


const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))


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