import transactionSchema from "../schemas/transactionSchema.js";

export function transactionSchemaValidationMiddleware(req, res, next) {
  const transaction = req.body;

  const validation = transactionSchema.validate(transaction);

  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }

  next();
}
