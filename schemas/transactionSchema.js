import joi from "joi";

const transactionSchema = joi.object({
  type: joi.valid("deposit", "withdraw"),
  value: joi.number().required(),
  description: joi.string().required(),
});

export default transactionSchema;
