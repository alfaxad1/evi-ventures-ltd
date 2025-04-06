import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

import users from "./routes/users.js";
import customers from "./routes/customers.js";
import loanProducts from "./routes/loanProducts.js";
import loansApplication from "./routes/loansApplication.js";

app.use("/api/users", users);
app.use("/api/customers", customers);
app.use("/api/loanProducts", loanProducts);
app.use("/api/loansApplication", loansApplication);

const PORT = process.env.PORT;
const appName = process.env.APP_NAME;

app.listen(PORT, () => {
  console.log(`${appName} is running on port ${PORT}`);
});
