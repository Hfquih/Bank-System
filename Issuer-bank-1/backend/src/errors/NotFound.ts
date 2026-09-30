import CustomApiError from "./CustomApiError";
import { StatusCodes } from "http-status-codes";


class NotFound extends CustomApiError{
    constructor(message:string){
        super(message , StatusCodes.NOT_FOUND)
    }
}

export default NotFound