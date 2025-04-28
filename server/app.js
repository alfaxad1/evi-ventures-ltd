import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

import users from "./routes/users.js";
import customers from "./routes/customers.js";
import loanProducts from "./routes/loanProducts.js";
import loansApplication from "./routes/loansApplication.js";
import loans from "./routes/loans.js";
import repayments from "./routes/repayments.js";
import transactions from "./routes/mpesaTransactions.js";
import customerRoutes from "./routes/customerRoutes.js";

app.use("/api/users", users);
app.use("/api/customers", customers);
app.use("/api/loanProducts", loanProducts);
app.use("/api/loansApplication", loansApplication);
app.use("/api/loans", loans);
app.use("/api/repayments", repayments);
app.use("/api/transactions", transactions);
app.use("/api/customerNew", customerRoutes);

const PORT = process.env.PORT;
const appName = process.env.APP_NAME;

app.listen(PORT, () => {
  console.log(`${appName} is running on port ${PORT}`);
});
