import withAuth from "../../utils/withAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";

interface pendingRepayment {
  id: number;
  amount: number;
  due_date: string;
  paid_date: string;
  mpesa_code: string;
  created_at: string;
  total_amount: number;
  loan_status: string;
  customer_name: string;
}

const PendingRepayments = () => {
  const [pendingRepayments, setPendingRepayments] = useState<
    pendingRepayment[]
  >([]);
  
  const fetchPendingRepayments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loansApplication/pending"
      );
      console.log("Pending repayments fetched successfully:", response.data);
      setPendingRepayments(response.data);
    } catch (error) {
      console.error("Error fetching pending repayments:", error);
    }
  };
  useEffect(() => {
    fetchPendingRepayments();
  }, []);

  console.log("Pending repayments:", pendingRepayments);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
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
                  Loan Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Mpesa Reference
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Paid Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Due Date
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {pendingRepayments.map((repayment) => (
                <TableRow key={repayment.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {repayment.customer_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.loan_status}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.mpesa_code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.paid_date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.due_date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {repayment.created_at}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      className="bg-success-500 text-white text-sm px-4 py-2 rounded-md mb-2 w-20"
                      onClick={() => handleApprove(repayment.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-error-500 text-white text-sm px-4 py-2 rounded-md mr-2 w-20"
                      onClick={() => handleReject(repayment.id)}
                    >
                      Reject
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedPendingRepayments = withAuth(PendingRepayments);
export default AuthenticatedPendingRepayments;
