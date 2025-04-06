import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT;
const appName = process.env.APP_NAME;

app.listen(PORT, () => {
  console.log(`${appName} is running on port ${PORT}`);
});
