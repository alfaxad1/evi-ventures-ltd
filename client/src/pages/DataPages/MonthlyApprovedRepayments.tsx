import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import withAuth from "../../utils/withAuth";
import { BarLoader } from "react-spinners";

interface Repayment {
  id: number;
  amount: number;
  paid_date: string;
  customer_name: string;
  national_id: string;
  phone: string;
  loan_total: number;
  loan_product: string;
}

interface Summary {
  repayment_count: number;
  total_amount_sum: number;
  deficit: number;
  percentage: string;
  target_amount: number;
}

const MonthlyApprovedRepayments = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const officerId = localStorage.getItem("userId") || "";
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
  const currentYear = new Date().getFullYear();

  const fetchMonthlyApprovedRepayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/api/repayments/monthly-approved",
        {
          params: {
            officerId,
            month: currentMonth,
            year: currentYear,
          },
        }
      );

      setRepayments(response.data.repayments);
      setSummary(response.data.summary);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to fetch repayments.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [officerId, currentMonth, currentYear]); // Add dependencies here

  useEffect(() => {
    fetchMonthlyApprovedRepayments();
  }, [fetchMonthlyApprovedRepayments]); // Add the function as a dependency

  if (loading) {
    return <BarLoader color="#36D7B7" width={150} height={4} />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Monthly Approved Repayments</h1>

      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p>Total Repayments: {summary.repayment_count}</p>
          <p>Total Amount: {summary.total_amount_sum.toLocaleString()}</p>
          <p>Deficit: {summary.deficit.toLocaleString()}</p>
          <p>Percentage: {summary.percentage}</p>
          <p>Target Amount: {summary.target_amount.toLocaleString()}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-screen-lg mx-auto">
          <div className="w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>National ID</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Loan Product</TableCell>
                  <TableCell>Repayment Amount</TableCell>
                  <TableCell>Loan Total</TableCell>
                  <TableCell>Paid Date</TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {repayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell>{repayment.customer_name}</TableCell>
                    <TableCell>{repayment.national_id}</TableCell>
                    <TableCell>{repayment.phone}</TableCell>
                    <TableCell>{repayment.loan_product}</TableCell>
                    <TableCell>{repayment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {repayment.loan_total.toLocaleString()}
                    </TableCell>
                    <TableCell>{repayment.paid_date.split("T")[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedMonthlyApprovedRepayments = withAuth(
  MonthlyApprovedRepayments
);
export default AuthenticatedMonthlyApprovedRepayments;
