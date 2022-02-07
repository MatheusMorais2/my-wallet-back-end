import joi from "joi";
import dayjs from "dayjs";
import db from "../db.js";

export async function postTransaction(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  const transactionSchema = joi.object({
    type: joi.valid("deposit", "withdraw"),
    value: joi.number().required(),
    description: joi.string().required(),
  });

  const validation = transactionSchema.validate(req.body);

  if (validation.error) return res.sendStatus(422);

  if (!token) return res.sendStatus(401);

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) return res.sendStatus(401);

    const user = await db.collection("users").findOne({ _id: session.userId });

    if (user) {
      const date = dayjs().format("DD/MM");
      const insertion = await db
        .collection("extracts")
        .insertOne({ ...req.body, userId: user._id, date: date });

      if (insertion) return res.sendStatus(200);
    } else {
      return res.sendStatus(401);
    }
  } catch {
    res.status(500).send("Internal server error");
  }
}

export async function getExtract(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) return res.sendStatus(401);

    const user = await db.collection("users").findOne({ _id: session.userId });

    if (user) {
      const extract = await db
        .collection("extracts")
        .find({ userId: user._id })
        .toArray();

      const output = extract.map((elem) => {
        return {
          type: elem.type,
          value: elem.value,
          date: elem.date,
          description: elem.description,
        };
      });

      res.status(200).send(output);
    } else {
      return res.sendStatus(401);
    }
  } catch {
    res.status(500).send("Internal server error");
  }
}
