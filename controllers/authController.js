import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as tokenGenerator } from "uuid";
import db from "../db.js";

export async function signUp(req, res) {
  const user = req.body;

  const signupSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
  });

  const validation = signupSchema.validate(user);
  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }

  try {
    let isEmailDuplicate = await db
      .collection("users")
      .findOne({ email: user.email });

    if (isEmailDuplicate) {
      res.status(409).send("Email ja cadastrado");
      return;
    }
    const encryptedPassword = bcrypt.hashSync(user.password, 10);

    const userInsertion = { ...user, password: encryptedPassword };
    await db.collection("users").insertOne(userInsertion);

    res.sendStatus(201);
  } catch {
    res.status(500).send("Internal server error");
  }
}

export async function logIn(req, res) {
  const user = req.body;

  const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  const validation = loginSchema.validate(user);

  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }

  try {
    const userExists = await db
      .collection("users")
      .findOne({ email: user.email });

    if (userExists && bcrypt.compareSync(user.password, userExists.password)) {
      const token = tokenGenerator();

      await db.collection("sessions").insertOne({
        userId: userExists._id,
        token,
      });

      res.status(200).send({ name: userExists.name, token: token });
    } else {
      res.sendStatus(401);
      return;
    }
  } catch {
    res.status(500).send("Internal server error");
  }
}
