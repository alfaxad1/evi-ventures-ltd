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
      <h1 className="text-gray-900 text-xl px-4 py-2 inline-block mb-3">
        Monthly Collection
      </h1>

      {summary && (
        <div className="mb-6">
          <div className="flex items-center mb-2 text-green-600">
            <svg className="w-4 h-4 mr-2" data-lucide="dollar-sign"></svg>
            <span>Total Disbursements: {summary.repayment_count}</span>
          </div>
          <div className="flex items-center mb-2 text-blue-600">
            <svg className="w-4 h-4 mr-2" data-lucide="dollar-sign"></svg>
            <span>
              Total Amount: {summary.total_amount_sum.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center mb-2 text-pink-600">
            <svg className="w-4 h-4 mr-2" data-lucide="dollar-sign"></svg>
            <span>Deficit: {summary.deficit.toLocaleString()}</span>
          </div>
          <div className="flex items-center mb-2 text-green-600">
            <svg className="w-4 h-4 mr-2" data-lucide="dollar-sign"></svg>
            <span>Percentage: {summary.percentage}</span>
          </div>
          <div className="flex items-center mb-2 text-blue-600">
            <svg className="w-4 h-4 mr-2" data-lucide="dollar-sign"></svg>
            <span>Target Amount: {summary.target_amount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-screen-lg mx-auto">
          <div className="w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Customer Name
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    National ID
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Phone
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Loan Product
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Repayment Amount
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Loan Total
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400">
                    Paid Date
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {repayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.customer_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.national_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.phone}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.loan_product}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.loan_total.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.paid_date.split("T")[0]}
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

const AuthenticatedMonthlyApprovedRepayments = withAuth(
  MonthlyApprovedRepayments
);
export default AuthenticatedMonthlyApprovedRepayments;
