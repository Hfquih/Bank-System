import { Request , Response , NextFunction} from "express"
import { z } from "zod";


export const validate = (schema:z.ZodTypeAny) => {
  return (req:Request, res:Response, next:NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      console.log(error);
      console.log(req.body);

      next(error);
    }
  };
};
