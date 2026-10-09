import express from "express"
const router = express.Router()
import {createFinancialNetwork , MinkiyIssuer , connectIssuer , verifyCard , depositeFinancial , withdrawalFinancial , bankWithdrawal} from "../controller/network"
import { validate } from "../zod/midZod"
import { financialNetworkSchema } from "../zod/schema"

router.post("/create-fn-net" , createFinancialNetwork)

router.post("/minkiy" , MinkiyIssuer)

router.post('/connect' , validate(financialNetworkSchema) , connectIssuer)

router.post('/verify-card' , verifyCard)

router.post('/deposite-financial' , depositeFinancial)

router.post('/withdrawal-financial' , withdrawalFinancial)

router.post('/bank-withdrawal' , bankWithdrawal)


export default router

