import passport from "passport";
import configurePassport from "../passport/passport"
configurePassport(passport);
import Unauthorized from "../errors/Unauthorized.js";
import { NextFunction, Request, Response } from "express";
import {Customer} from "../../generated/prisma/client"


export const requireAuth = passport.authenticate('jwt', { session:false })

export const authorization=(...allowed:string[])=>{
    return(req:Request,res:Response,next:NextFunction)=>{
        const user = (req as Request & { user: Customer }).user
        if (!user) {
            throw new Unauthorized('Authentication required')
        }
        if(!allowed.includes(user.role)){
            throw new Unauthorized('sorry , you dont have access to this route')
        }
    
        next()
    }
}


export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any) => {
      if (err) {
        return next(err);
      }

      if (user) {
        req.user = user;
      }

      next();
    }
  )(req, res, next);
};