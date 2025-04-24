import cron from "node-cron";
import {
  checkLoanDefaults,
  checkMissedPayments,
} from "./services/loanService.js";

// Schedule a cron job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily loan checks...");

  try {
    const connection = await getConnection(); // Ensure you have a function to get the DB connection

    // Check for loans that should be marked as defaulted
    await checkLoanDefaults(connection);

    // Check for missed payments and update arrears
    await checkMissedPayments(connection);

    console.log("Daily loan checks completed successfully.");
  } catch (err) {
    console.error("Error running daily loan checks:", err);
  }
});
