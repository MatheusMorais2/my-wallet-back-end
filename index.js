import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("MyWallet");
});

const app = express();
app.use(express.json());
