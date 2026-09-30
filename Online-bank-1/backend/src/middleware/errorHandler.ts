import CustomAPIERROR from "../errors/CustomError.js";
import { ZodError} from "zod";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError , PrismaClientValidationError} from "@prisma/client/runtime/client";


export const errorHandler=(err:unknown,req:Request,res:Response,next:NextFunction)=>{
  console.log(err)
  if(err instanceof CustomAPIERROR){
    return res.status(err.statusCode).json({msg:err.message})
  }
  
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        msg: issue.message,
      })),
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
  if (err.code === "P2002") {
    const fields =
      (err.meta as any)?.driverAdapterError?.cause?.constraint?.fields ?? [];

    return res.status(409).json({
      success: false,
      errors: fields.map((field: string) => ({
        field,
        msg: `${field} already exists`,
      })),
    });
  }
}
   

  else{
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Internal server error"})
  }
}