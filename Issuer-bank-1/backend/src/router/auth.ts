import express from "express"
const router = express.Router()
import {register , login , logout , getCustomer , getAccount , getTransaction , getRequest , createTransaction , createRequest , updateCustomer} from "../controller/auth"
import { registerSchema , loginSchema , updateSchema , moneyOperationSchema} from "../zod/schema"
import { validate } from "../zod/zodMid"
import {requireAuth ,  authorization } from "../middleware/auth"


router.post('/register' , validate(registerSchema) , register)

router.post('/login' , validate(loginSchema) , login)

router.get('/logout' , logout)

router.get('/unique', requireAuth , authorization("admin" , "user") , getCustomer)

router.get('/account' , requireAuth , authorization("user" , "admin") , getAccount)

router.get('/get-transaction' , requireAuth , authorization("user" , "admin") , getTransaction)

router.get('/get-request' , requireAuth , authorization("user" , "admin") , getRequest)

router.post('/createTransaction' , validate(moneyOperationSchema) , requireAuth , authorization("user" , "admin") , createTransaction)

router.post('/createRequest' , validate(moneyOperationSchema) , requireAuth , authorization("user" , "admin") , createRequest)

router.patch('/update-info' , validate(updateSchema) , requireAuth , authorization("admin" , "user") , updateCustomer)



export default router