import { StatusCodes } from "http-status-codes";
import CustomError from "./CustomError";

export default class NotFound extends CustomError{
    constructor(message:string){
        super(message , StatusCodes.NOT_FOUND)
    }
}