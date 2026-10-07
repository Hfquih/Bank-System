import express from "express"
const router = express.Router()
import {createFinancialNetwork , MinkiyIssuer , connectIssuer} from "../controller/network"
import { validate } from "../zod/midZod"
import { financialNetworkSchema } from "../zod/schema"

router.post("/create-fn-net" , createFinancialNetwork)

router.post("/minkiy" , MinkiyIssuer)

router.post('/connect' , validate(financialNetworkSchema) , connectIssuer)


export default router

