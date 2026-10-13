import express from "express";
const router = express.Router()
import { createPaymentSession , createPaymentMethod , failedProcessCheck} from "../controller/processor";
import { validate } from "../zod/midZod";
import { createPaymentSessionSchema , paymentMethodSchema , networkPaymentSchema} from "../zod/schema";


router.post('/payment-sessions' , validate(createPaymentSessionSchema) , createPaymentSession)

router.post('/payment-method/:sessionId' , validate(paymentMethodSchema) , createPaymentMethod)

router.post('/check-issuerStatus' , validate(networkPaymentSchema) , failedProcessCheck)


export default router