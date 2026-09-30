import express from "express"
const router = express.Router()
import {createPaymentSession} from '../controller/payment'
import { validate } from "../zod/midZod"
import {createPaymentSessionSchema} from '../zod/schema'
import { requireAuth , authorization } from "../middleware/auth"


router.post('/payment-session' , createPaymentSession)


export default router