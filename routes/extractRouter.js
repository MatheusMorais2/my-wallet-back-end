import { Router } from "express";
import {
  postTransaction,
  getExtract,
} from "../controllers/extractController.js";
import { validateToken } from "../middlewares/tokenValidationMiddleware.js";
import { transactionSchemaValidationMiddleware } from "../middlewares/transactionSchemaValidationMiddleware.js";

const extractRouter = Router();

extractRouter.use(validateToken);
extractRouter.post(
  "/extract",
  transactionSchemaValidationMiddleware,
  postTransaction
);
extractRouter.get("/extract", getExtract);

export default extractRouter;
