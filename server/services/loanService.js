// Calculate remaining balance for a loan
export const calculateRemainingBalance = async (loanId, connection) => {
  const [results] = await connection.promise().query(
    `
      SELECT 
        l.total_amount,
        IFNULL(SUM(r.amount), 0) as total_paid
      FROM loans l
      LEFT JOIN repayments r ON r.loan_id = l.id AND r.status = 'paid'
      WHERE l.id = ?
      GROUP BY l.id
    `,
    [loanId]
  );

  if (results.length === 0) return 0;

  const { total_amount, total_paid } = results[0];
  return total_amount - total_paid;
};

// function to detect defaults
export const checkLoanDefaults = async (connection) => {
  try {
    // Find loans past their expected completion date
    const [defaultedLoans] = await connection.query(`
      SELECT id 
      FROM loans 
      WHERE status = 'active' 
      AND expected_completion_date < CURDATE()
    `);

    // Mark loans as defaulted
    for (const loan of defaultedLoans) {
      await connection.query(
        `UPDATE loans 
        SET status = 'defaulted' 
        WHERE id = ?`,
        [loan.id]
      );
    }
  } catch (err) {
    console.error("Error checking loan defaults:", err);
    throw err;
  }
};

// Modified updateLoanStatus to include default checks
export const updateLoanStatus = async (loanId, connection) => {
  try {
    // Get loan details
    const [loan] = await connection
      .promise()
      .query("SELECT * FROM loans WHERE id = ?", [loanId]);

    if (loan.length === 0) {
      throw new Error("Loan not found");
    }

    const { total_amount, due_date, arrears } = loan[0];

    // Calculate installments sum
    const [installments] = await connection
      .promise()
      .query(
        "SELECT IFNULL(SUM(amount), 0) as installments_sum FROM repayments WHERE loan_id = ? AND status = 'paid'",
        [loanId]
      );

    const installmentsSum = installments[0].installments_sum;

    // Calculate remaining balance
    const remainingBalance = total_amount - installmentsSum;

    // Determine new loan status
    let newStatus = loan[0].status;
    let newArrears = arrears;

    if (installmentsSum >= total_amount) {
      newStatus = "paid";
      newArrears = 0; // Clear arrears when fully paid
    } else if (new Date(due_date) < new Date() && arrears > 0) {
      newStatus = "defaulted"; // Mark as defaulted if arrears exist on due date
    } else if (installmentsSum > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "active";
    }

    // Update loan record
    await connection.promise().query(
      `UPDATE loans 
      SET installments_sum = ?, 
          remaining_balance = ?, 
          arrears = ?, 
          status = ? 
      WHERE id = ?`,
      [installmentsSum, remainingBalance, newArrears, newStatus, loanId]
    );
  } catch (err) {
    console.error("Error updating loan status:", err);
    throw err;
  }
};

//check for missed repayments
export const checkMissedPayments = async (connection) => {
  try {
    // Find loans with missed payments
    const [missedLoans] = await connection.promise().query(`
      SELECT 
        id, 
        installment_amount, 
        installment_type, 
        due_date, 
        arrears 
      FROM loans 
      WHERE status IN ('active', 'partially_paid') 
      AND due_date < CURDATE()
    `);

    for (const loan of missedLoans) {
      const { id, installment_amount, installment_type, due_date, arrears } =
        loan;

      // Add missed installment to arrears
      const newArrears = arrears + installment_amount;

      // Calculate the next due date
      let nextDueDate = new Date(due_date);
      if (installment_type === "daily") {
        nextDueDate.setDate(nextDueDate.getDate() + 1);
      } else if (installment_type === "weekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      }

      // Update loan record
      await connection.promise().query(
        `UPDATE loans 
        SET arrears = ?, 
            due_date = ? 
        WHERE id = ?`,
        [newArrears, nextDueDate, id]
      );
    }
  } catch (err) {
    console.error("Error checking missed payments:", err);
    throw err;
  }
};
