import express from "express";
import cors from "cors";

import router from "./routes/index.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

app.listen(5000, () => {
  console.log("@@@@@@@@@ Listening to port 5000");
});
