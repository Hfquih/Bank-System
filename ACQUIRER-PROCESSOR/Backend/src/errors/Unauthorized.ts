import CustomAPIERROR from "./CustomeError";
import { StatusCodes } from "http-status-codes";

class Unauthorized extends CustomAPIERROR{
    constructor(message:string){
        super(message , StatusCodes.UNAUTHORIZED)
    }
}

export default Unauthorized