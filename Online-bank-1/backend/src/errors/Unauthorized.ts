import { StatusCodes } from "http-status-codes";
import CustomError from "./CustomError";

export default class Unauthorized extends CustomError{
    constructor(message:string){
        super(message , StatusCodes.UNAUTHORIZED)
    }
}
