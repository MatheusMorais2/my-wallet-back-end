import bcrypt from "bcrypt";
import { v4 as tokenGenerator } from "uuid";
import db from "../db.js";

export async function signUp(req, res) {
  const user = req.body;

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
    res.status(500).send("capetaaa");
  }
}
