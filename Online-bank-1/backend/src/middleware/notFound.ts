import { StatusCodes } from "http-status-codes";
import { Request , Response } from "express";

export const notFound = async (req:Request , res:Response) => res.status(StatusCodes.NOT_FOUND).json({msg:'sorry, we dont found this route!!'})