import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import NotFound from '../errors/NotFound.js'
import { Customer, UserRole } from '../../generated/prisma/client'


const privateKey = process.env.JWT_PRIVATE_KEY

if(!privateKey){
    throw new NotFound("private key not found")
}

const PRV_KEY= privateKey.replace(/\\n/g, '\n');

export type JWTPayload = {
    id:number,
    firstName:string,
    lastName:string,
    role:UserRole
}


export function createJWT(users:Customer){
    const payload : JWTPayload={id:users.id , firstName:users.firstName , lastName:users.lastName , role:users.role}
    return jwt.sign(payload , PRV_KEY , {algorithm:'RS256' , expiresIn:'1d'})
}

export async function hashPass(password:string){
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password , salt)
    return hash
}

export async function comparePasse(userPass:string , hashPassword:string){
    const isMatch= await bcrypt.compare(userPass , hashPassword)
    return isMatch
}