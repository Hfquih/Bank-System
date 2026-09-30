import express from "express";
const router = express.Router()
import { createPaymentSession , createPaymentMethod} from "../controller/processor";
import { validate } from "../zod/midZod";
import { createPaymentSessionSchema , paymentMethodSchema} from "../zod/schema";


router.post('/payment-sessions' , validate(createPaymentSessionSchema) , createPaymentSession)

router.post('/payment-method/:sessionId' , validate(paymentMethodSchema) , createPaymentMethod)


export default router