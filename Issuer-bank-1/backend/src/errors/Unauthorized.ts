import CustomApiError from "./CustomApiError";
import { StatusCodes } from "http-status-codes";


class Unauthorized extends CustomApiError{
    constructor(message:string){
        super(message , StatusCodes.UNAUTHORIZED)
    }
}

export default Unauthorized