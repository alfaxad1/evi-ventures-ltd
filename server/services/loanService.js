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
    // Find loans that are 30+ days overdue
    const [overdueLoans] = await connection.promise().query(`
        SELECT l.id 
        FROM loans l
        WHERE l.status IN ('active', 'partially_paid')
        AND l.due_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        AND NOT EXISTS (
          SELECT 1 FROM loan_defaults 
          WHERE loan_id = l.id
        )
      `);

    // Mark them as defaulted
    for (const loan of overdueLoans) {
      await connection.promise().query(
        `
          UPDATE loans 
          SET status = 'defaulted',
              default_date = CURRENT_DATE()
          WHERE id = ?
        `,
        [loan.id]
      );

      // Record in defaults table
      await connection.promise().query(
        `
          INSERT INTO loan_defaults (loan_id, default_date, reason)
          VALUES (?, CURRENT_DATE(), '90 days overdue')
        `,
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
  const remainingBalance = await calculateRemainingBalance(loanId, connection);

  const [loanData] = await connection.promise().query(
    `
      SELECT 
        l.total_amount,
        l.status as current_status,
        l.due_date,
        COUNT(r.id) as payment_count
      FROM loans l
      LEFT JOIN repayments r ON r.loan_id = l.id AND r.status = 'paid'
      WHERE l.id = ?
      GROUP BY l.id
    `,
    [loanId]
  );

  if (loanData.length === 0) return;

  const { total_amount, current_status, due_date, payment_count } = loanData[0];

  let newStatus = current_status;
  let updateFields = { remaining_balance: remainingBalance };

  // Status transition logic
  if (remainingBalance <= 0) {
    newStatus = "paid";
    updateFields.completed_date = new Date();
  } else if (payment_count > 0) {
    newStatus = "partially_paid";
    if (current_status === "active") {
      updateFields.first_payment_date = new Date();
    }
  } else {
    newStatus = "active";
  }

  // Check for overdue status
  const isOverdue = new Date(due_date) < new Date();
  if (isOverdue && newStatus !== "paid") {
    newStatus = "overdue";
    //updateFields.overdue_since = due_date;
  }

  // Add newStatus to updateFields
  updateFields.status = newStatus;

  try {
    await connection
      .promise()
      .query(`UPDATE loans SET ? WHERE id = ?`, [updateFields, loanId]);
  } catch (err) {
    console.error("Error updating loan status:", err);
  }

  // Check for defaults after update
  try {
    await checkLoanDefaults(connection);
  } catch (err) {
    console.error("Error checking loan defaults:", err);
  }
};
