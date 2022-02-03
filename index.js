import { MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import cors from "cors";
import { v4 as tokenGenerator } from "uuid";

dotenv.config();

// eslint-disable-next-line no-undef
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect(() => {
  db = mongoClient.db("MyWallet");
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
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
});

app.post("/extract", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  const transactionSchema = joi.object({
    type: joi.valid("deposit", "withdraw"),
    value: joi.number().required(),
  });

  const validation = transactionSchema.validate(req.body);

  if (validation.error) return res.sendStatus(422);

  if (!token) return res.sendStatus(401);

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) return res.sendStatus(401);

    const user = await db.collection("users").findOne({ _id: session.userId });

    if (user) {
      const insertion = await db
        .collection("extracts")
        .insertOne({ ...req.body, userId: user._id });

      if (insertion) return res.sendStatus(200);
    } else {
      return res.sendStatus(401);
    }
  } catch {
    res.status(500).send("Internal server error");
  }
});

app.get("/extract", async (req, res) => {
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
        return { type: elem.type, value: elem.value };
      });

      res.status(200).send(output);
    } else {
      return res.sendStatus(401);
    }
  } catch {
    res.status(500).send("Internal server error");
  }
});

app.listen(5000, () => {
  console.log("@@@@@@@@@ Listening to port 5000");
});
