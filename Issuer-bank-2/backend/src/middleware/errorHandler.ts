import CustomApiError from "../errors/CustomApiError";
import { ZodError} from "zod";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError , PrismaClientValidationError} from "@prisma/client/runtime/client";
import { Prisma } from "../../generated/prisma/client";




export const errorHandler=(err:unknown,req:Request,res:Response,next:NextFunction)=>{
  console.log(err)
  if(err instanceof CustomApiError){
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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
  if (err.code === "P2002") {

    const constraintName =
      (err.meta as any)?.driverAdapterError?.cause?.constraint?.index;

    const field = constraintName?.split("_")[1];

    return res.status(409).json({
      success: false,
      errors: [
        {
          field,
          msg: `${field} already exists`,
        },
      ],
    });
  }
}
   

  else{
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Internal server error"})
  }
}