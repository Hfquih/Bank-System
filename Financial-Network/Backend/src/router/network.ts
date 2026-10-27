import express from "express"
const router = express.Router()
import {createFinancialNetwork , MinkiyIssuer , connectIssuer , verifyCard , depositeFinancial , withdrawalFinancial , bankWithdrawal , financialCheck, wafaCashIssuer} from "../controller/network"
import { validate } from "../zod/midZod"
import { financialNetworkSchema , verifyCardSchema , depositWithdrawSchema , withdrawSchema , networkPaymentSchema} from "../zod/schema"

router.post("/create-fn-net" , createFinancialNetwork)

router.post("/minkiy" , MinkiyIssuer)

router.post("/wafaCash" , wafaCashIssuer)

router.post('/connect' , validate(financialNetworkSchema) , connectIssuer)

router.post('/verify-card' , validate(verifyCardSchema) , verifyCard)

router.post('/deposite-financial' , validate(depositWithdrawSchema) , depositeFinancial)

router.post('/withdrawal-financial' , validate(depositWithdrawSchema) , withdrawalFinancial)

router.post('/bank-withdrawal' , validate(withdrawSchema) , bankWithdrawal)

router.post('/check' , validate(networkPaymentSchema) , financialCheck)


export default router

