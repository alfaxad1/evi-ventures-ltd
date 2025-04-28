import axios from "axios";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import withAuth from "../../utils/withAuth";
import { BarLoader } from "react-spinners";
import Button from "../../components/ui/button/Button";

interface DefaultedLoan {
  id: number;
  customer_name: string;
  national_id: string;
  phone: string;
  loan_product: string;
  principal: number;
  total_interest: number;
  total_amount: number;
  due_date: string;
  default_date: string;
  days_overdue: number;
}

const Defaulted = () => {
  const [defaultedLoans, setDefaultedLoans] = useState<DefaultedLoan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const role = JSON.parse(localStorage.getItem("role") || "''");
  const officerId = localStorage.getItem("userId") || "";

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchDefaultedLoans = async (
    role: string,
    officerId: string,
    page: number
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loans/loan-details/defaulted?role=${role}&officerId=${officerId}&page=${page}`
      );
      setDefaultedLoans(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching defaulted loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultedLoans(role, officerId, page);
  }, [role, officerId, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return <BarLoader color="#36D7B7" width={150} height={4} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-screen-lg mx-auto">
        <div className="w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  National ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Loan Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Principal
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Interest
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Due Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Default Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Days Overdue
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {defaultedLoans.map((loan) => (
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
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.default_date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.days_overdue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            size="sm"
            className="hover:bg-gray-200 m-4"
            variant="outline"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            className="hover:bg-gray-200 m-4"
            variant="outline"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedDefaulted = withAuth(Defaulted);
export { AuthenticatedDefaulted as Defaulted };
