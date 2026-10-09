import express from "express"
const router = express.Router()
import {createPaymentSession , processor , addCard , depositeMoney , withdrawalMoney , myCard} from '../controller/payment'
import { validate } from "../zod/midZod"
import {createPaymentSessionSchema , addCardSchema , depositSchema} from '../zod/schema'
import { requireAuth , authorization } from "../middleware/auth"


router.post('/payment-session' , createPaymentSession)

router.post('/processor' , processor)

router.post('/add-card' , validate(addCardSchema) , requireAuth , authorization("admin" , "user") , addCard)

router.post('/deposite' , validate(depositSchema) , requireAuth , authorization("admin" , "user") , depositeMoney)

router.post('/withdrawal' , validate(depositSchema) , requireAuth , authorization("admin" , "user") , withdrawalMoney)

router.get("/my-cards" , requireAuth , authorization("admin" , "user") , myCard)

export default router