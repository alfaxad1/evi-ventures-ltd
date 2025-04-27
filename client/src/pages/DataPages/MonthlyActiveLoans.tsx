import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import withAuth from "../../utils/withAuth";
import { BarLoader } from "react-spinners";

interface Loan {
  id: number;
  customer_name: string;
  national_id: string;
  phone: string;
  loan_product: string;
  principal: number;
  total_interest: number;
  total_amount: number;
  disbursement_date: string;
}

interface Summary {
  loan_count: number;
  total_amount_sum: number;
  deficit: number;
  percentage: string;
  target_amount: number;
}

const MonthlyActiveLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const officerId = localStorage.getItem("userId") || "";
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
  const currentYear = new Date().getFullYear();

  const fetchMonthlyActiveLoans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/api/loans/monthly-active-loans",
        {
          params: {
            officerId,
            month: currentMonth,
            year: currentYear,
          },
        }
      );

      setLoans(response.data.loans);
      setSummary(response.data.summary);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to fetch loans.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [officerId, currentMonth, currentYear]);

  useEffect(() => {
    fetchMonthlyActiveLoans();
  }, [fetchMonthlyActiveLoans]);

  if (loading) {
    return <BarLoader color="#36D7B7" width={150} height={4} />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Monthly Active Loans</h1>

      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Summary</h2>
          <p>Total Loans: {summary.loan_count}</p>
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
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Customer Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    National ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Loan Product
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Principal
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total Interest
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Disbursement Date
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {loan.customer_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.national_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.phone}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.loan_product}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.principal.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.total_interest.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.disbursement_date.split("T")[0]}
                    </TableCell>
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

const AuthenticatedMonthlyActiveLoans = withAuth(MonthlyActiveLoans);
export { AuthenticatedMonthlyActiveLoans as MonthlyActiveLoans };
