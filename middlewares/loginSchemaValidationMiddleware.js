import loginSchema from "../schemas/loginSchema.js";

export function loginSchemaValidationMiddleware(req, res, next) {
  const user = req.body;

  const validation = loginSchema.validate(user);

  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }

  next();
}
