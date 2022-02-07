import { Router } from "express";
import { signUp, logIn } from "../controllers/authController.js";
import { signupSchemaValidationMiddleware } from "../middlewares/signupSchemaValidationMiddleware.js";
import { loginSchemaValidationMiddleware } from "../middlewares/loginSchemaValidationMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", signupSchemaValidationMiddleware, signUp);
authRouter.post("/login", loginSchemaValidationMiddleware, logIn);

export default authRouter;
