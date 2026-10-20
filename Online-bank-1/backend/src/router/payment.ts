import express from "express"
const router = express.Router()
import {createPaymentSession , processor , failedProcessor , addCard , depositeMoney , withdrawalMoney , myCard, withdrawalDepositeFailed} from '../controller/payment'
import { validate } from "../zod/midZod"
import {createPaymentSessionSchema , paymentProcessorSchema ,addCardSchema , depositSchema , paymentRecoverySchema} from '../zod/schema'
import { requireAuth , authorization } from "../middleware/auth"


router.post('/payment-session', validate(createPaymentSessionSchema) , createPaymentSession)

router.post('/processor' , validate(paymentProcessorSchema) , processor)

router.post('/failedProcessor' , validate(paymentRecoverySchema) , failedProcessor)

router.post('/add-card' , validate(addCardSchema) , requireAuth , authorization("admin" , "user") , addCard)

router.post('/deposite' , validate(depositSchema) , requireAuth , authorization("admin" , "user") , depositeMoney)

router.post('/failed-withdrawal-deposite' , validate(paymentRecoverySchema) , withdrawalDepositeFailed)

router.post('/withdrawal' , validate(depositSchema) , requireAuth , authorization("admin" , "user") , withdrawalMoney)

router.get("/my-cards" , requireAuth , authorization("admin" , "user") , myCard)

export default router