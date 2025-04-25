import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import withAuth from "../../utils/withAuth";
import { BarLoader } from "react-spinners";

interface DueLoan {
  id: number;
  customer_name: string;
  national_id: string;
  phone: string;
  loan_product: string;
  principal: number;
  total_interest: number;
  total_amount: number;
  due_date: string;
}
interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DueToday = () => {
  const [dueLoans, setDueLoans] = useState<DueLoan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const fetchDueLoans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const role = JSON.parse(localStorage.getItem("role") || "''");
      const officerId = localStorage.getItem("userId") || "";
      const response = await axios.get(
        "http://localhost:8000/api/loans/loan-details/due-today",
        {
          params: {
            role,
            officerId,
            page,
            limit,
          },
        }
      );
      setDueLoans(response.data.data);
      setMeta(response.data.meta);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to fetch loans.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchDueLoans();
  }, [fetchDueLoans]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && meta && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return <BarLoader color="#36D7B7" width={150} height={4} />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-screen-lg mx-auto">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <BarLoader color="#36D7B7" width={150} height={4} />
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : dueLoans && dueLoans.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No loans are due today.
            </div>
          ) : (
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
                    Due Date
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {dueLoans.map((loan) => (
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
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.principal}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.total_interest}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.total_amount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.due_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {meta && dueLoans.length > 0 && (
            <div>
              <button
                className=""
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === meta.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthenticatedDueToday = withAuth(DueToday);
export { AuthenticatedDueToday as DueToday };
