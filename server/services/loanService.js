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

// Update loan status based on payments
export const updateLoanStatus = async (loanId, connection) => {
  // Calculate current payment status
  const [loanData] = await connection.promise().query(
    `
      SELECT 
        l.total_amount,
        l.status as current_status,
        IFNULL(SUM(r.amount), 0) as total_paid,
        COUNT(r.id) as payment_count
      FROM loans l
      LEFT JOIN repayments r ON r.loan_id = l.id AND r.status = 'paid'
      WHERE l.id = ?
      GROUP BY l.id
    `,
    [loanId]
  );

  if (loanData.length === 0) return;

  const { total_amount, current_status, total_paid, payment_count } =
    loanData[0];
  const remainingBalance = total_amount - total_paid;

  let newStatus = current_status;
  let updateFields = { remaining_balance: remainingBalance };

  // Determine new status
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

  // Only update if status changed
  if (newStatus !== current_status) {
    updateFields.status = newStatus;
  }

  await connection
    .promise()
    .query(`UPDATE loans SET ? WHERE id = ?`, [updateFields, loanId]);
};
