import express from "express"
const router = express.Router()
import {register , login , logout , getCustomer , getAccount , getTransaction , getRequest , myCard , createTransaction , createRequest , createCard , financialNetwork , updateCustomer , acceptRequest , rejectRequest, verifyCard , onlineBankDeposite , onlineBankwithdrawal , withdrawalRequest , bankWithdrawal} from "../controller/auth"
import { registerSchema , loginSchema , updateSchema , moneyOperationSchema , createCardSchema , financialNetworkSchema , withdrawSchema} from "../zod/schema"
import { validate } from "../zod/zodMid"
import {requireAuth ,  authorization } from "../middleware/auth"


router.post('/register' , validate(registerSchema) , register)

router.post('/login' , validate(loginSchema) , login)

router.get('/logout' , logout)

router.get('/unique', requireAuth , authorization("admin" , "user") , getCustomer)

router.get('/account' , requireAuth , authorization("user" , "admin") , getAccount)

router.get('/get-transaction' , requireAuth , authorization("user" , "admin") , getTransaction)

router.get('/get-request' , requireAuth , authorization("user" , "admin") , getRequest)

router.get('/my-card' , requireAuth , authorization("user" , "admin") , myCard)

router.post('/createTransaction' , validate(moneyOperationSchema) , requireAuth , authorization("user" , "admin") , createTransaction)

router.post('/createRequest' , validate(moneyOperationSchema) , requireAuth , authorization("user" , "admin") , createRequest)

router.post('/createCard' , validate(createCardSchema) , requireAuth , authorization("admin" , "user") , createCard)

router.post('/authorized' , validate(financialNetworkSchema) , financialNetwork)

router.post('/verify-card' , verifyCard)

router.post('/deposite' , onlineBankDeposite)

router.post('/withdrawal' , onlineBankwithdrawal)

router.post('/withdrawal-isuer' , validate(withdrawSchema) , requireAuth , authorization("admin" , "user") , withdrawalRequest)

router.post('/bank-withdrawal' , bankWithdrawal)

router.patch('/update-info' , validate(updateSchema) , requireAuth , authorization("admin" , "user") , updateCustomer)

router.patch('/accept-request/:id' , requireAuth , authorization("user" , "admin") , acceptRequest)

router.patch('/reject-request/:id' , requireAuth , authorization("user" , "admin") , rejectRequest)


export default router