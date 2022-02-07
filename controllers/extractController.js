import dayjs from "dayjs";
import db from "../db.js";

export async function postTransaction(req, res) {
  const user = res.locals.user;

  try {
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
  const user = res.locals.user;

  try {
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
