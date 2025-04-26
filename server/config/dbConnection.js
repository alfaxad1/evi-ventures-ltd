import dotenv from "dotenv";
import mysql from "mysql2/promise.js";

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("connected to MySQL");
});

export default connection;
