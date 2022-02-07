import { Router } from "express";
import {
  postTransaction,
  getExtract,
} from "../controllers/extractController.js";

const extractRouter = Router();

extractRouter.post("/extract", postTransaction);
extractRouter.get("/extract", getExtract);

export default extractRouter;
