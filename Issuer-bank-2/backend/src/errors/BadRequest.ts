import CustomApiError from "./CustomApiError";
import { StatusCodes } from "http-status-codes";


class BadRequest extends CustomApiError{
    constructor(message:string){
        super(message , StatusCodes.BAD_REQUEST)
    }
}

export default BadRequest