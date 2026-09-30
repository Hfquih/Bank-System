import CustomAPIERROR from "./CustomeError";
import { StatusCodes } from "http-status-codes";

class NotFound extends CustomAPIERROR{
    constructor(message:string){
        super(message , StatusCodes.NOT_FOUND)
    }
}

export default NotFound