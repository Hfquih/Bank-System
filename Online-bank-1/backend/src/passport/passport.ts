import type { Request } from "express";
import {Strategy as jwtStrategy , StrategyOptions , VerifiedCallback} from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import NotFound from '../errors/NotFound.js'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl
  })
})


const publicKey =  process.env.JWT_PUBLIC_KEY

if(!publicKey){
    throw new NotFound('public key not found')
}

const PUB_KEY= publicKey.replace(/\\n/g, '\n');

if(!process.env.JWT_PUBLIC_KEY){
    throw new NotFound(
        'environment variables are missing'
    );
}

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.accessToken || null;
};

const options : StrategyOptions={
    jwtFromRequest : cookieExtractor,
    secretOrKey : PUB_KEY,
    algorithms : ['RS256']
}

interface JWTpayload {
    id:number,
    firstName:string,
    lastName:string,
    role:string
}

type User = {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: string;
    status: string;
    isDeleted: boolean;
};

export default (passport: typeof import("passport"))=>{
    passport.use(new jwtStrategy(options , async (payload:JWTpayload , done:VerifiedCallback)=>{
        try{
            const users : User | null= await prisma.user.findUnique({where :{id:payload.id}})

            if(!users){
                return done(null , false)
            }
            if (users?.status !== "active" || users?.isDeleted) {
                return done(null, false)
            }
            return done(null, users);
        }catch(error){
            return done(error)
        }
    }))
}