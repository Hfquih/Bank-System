import CustomAPIERROR from "./CustomeError";
import { StatusCodes } from "http-status-codes";

class BadRequest extends CustomAPIERROR{
    constructor(message:string){
        super(message , StatusCodes.BAD_REQUEST)
    }
}

export default BadRequest