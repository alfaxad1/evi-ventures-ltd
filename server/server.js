import cron from "node-cron";
import { checkLoanDefaults } from "./services/loanService.js";

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running daily default check...");
  try {
    await checkLoanDefaults(connection);
  } catch (err) {
    console.error("Cron job failed:", err);
  }
});
