import express from "express"
const router = express.Router()
import {register , login , getUser , getUserAccount , getUserTransfer , getUserRefund , getUserKey , createUserTransaction , getDemandRequest ,requestMoney , createRefundRequest , createAPIKey , updateUser , acceptRequest , rejectRequest} from '../controller/auth'
import { requireAuth , authorization } from "../middleware/auth"
import { registerSchema , loginSchema , updateSchema , moneyOperationSchema , createRefundRequestSchema , createAPIKeySchema} from "../zod/schema"
import { validate } from "../zod/midZod"


router.post('/register' , validate(registerSchema) , register)

router.post('/login' , validate(loginSchema) , login)

router.get('/unique' , requireAuth , authorization('user' , 'admin') , getUser)

router.get('/user-account' , requireAuth , authorization('user' , 'admin') , getUserAccount)

router.get('/user-transfer' , requireAuth , authorization('user' , 'admin') , getUserTransfer)

router.get('/user-refund' , requireAuth , authorization('user' , 'admin') , getUserRefund)

router.get('/demande-request' , requireAuth , authorization('user' , 'admin') , getDemandRequest)

router.get('/user-APIKey' , requireAuth , authorization('user' , 'admin') , getUserKey)

router.post('/create-transaction' , validate(moneyOperationSchema) , requireAuth , authorization('user' , 'admin') , createUserTransaction)

router.post('/request-money' , validate(moneyOperationSchema) , requireAuth , authorization('admin' , 'user') , requestMoney)

router.post('/refund-money' , validate(createRefundRequestSchema) , requireAuth , authorization('admin' , 'user') , createRefundRequest)

router.post('/create-APIKey' , validate(createAPIKeySchema) , requireAuth , authorization('admin' , 'user') , createAPIKey)

router.patch('/update-info' , validate(updateSchema) , requireAuth , authorization('user' , 'admin') , updateUser)

router.patch('/accept-request/:requestId' , requireAuth , authorization('user' , 'admin') , acceptRequest)

router.patch('/:requestId' , requireAuth , authorization('user' , 'admin') , rejectRequest)


export default router