import express from "express"
const router = express.Router()
import {createPaymentSession , processor} from '../controller/payment'
import { validate } from "../zod/midZod"
import {createPaymentSessionSchema} from '../zod/schema'
import { requireAuth , authorization } from "../middleware/auth"


router.post('/payment-session' , createPaymentSession)

router.post('/processor' , processor)


export default router