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
import { toast, ToastContainer } from "react-toastify";

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
  loan_id?: number;
  customer_id?: number;
  created_by?: number;
}

const PendingRepayments = () => {
  const [pendingRepayments, setPendingRepayments] = useState<
    pendingRepayment[]
  >([]);

  const fetchPendingRepayments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/repayments/pending"
      );
      console.log("Pending repayments fetched successfully:", response.data);

      setPendingRepayments(response.data.data);
    } catch (error) {
      console.error("Error fetching pending repayments:", error);
    }
  };
  useEffect(() => {
    fetchPendingRepayments();
  }, []);

  console.log("Pending repayments:", pendingRepayments);

  // const approvalData = {
  //   loanId: pendingRepayments.loan_id,
  //   amount: pendingRepayments.amount,
  //   status: "paid",
  //   mpesaCode: pendingRepayments.mpesa_code,
  //   customerId: pendingRepayments.customer_id,
  //   initiatedBy: pendingRepayments.created_by,
  // };

  const handleApprove = async (repayment: pendingRepayment) => {
    const approvalData = {
      loanId: repayment.loan_id,
      amount: repayment.amount,
      status: "paid",
      mpesaCode: repayment.mpesa_code,
      customerId: repayment.customer_id,
      initiatedBy: repayment.created_by,
    };

    try {
      const response = await axios.put(
        `http://localhost:8000/api/repayments/${repayment.id}`,
        approvalData
      );
      console.log("Approved successfully:", response.data);
      fetchPendingRepayments();
      toast.success("Repayment approved successfully!");
    } catch (error) {
      console.error("Error approving repayment:", error);
    }
  };

  return (
    <>
      <ToastContainer />
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
                      <span
                        style={{
                          color:
                            repayment.loan_status === "active"
                              ? "green"
                              : "blue",
                        }}
                      >
                        {repayment.loan_status === "partially_paid"
                          ? "partially paid"
                          : repayment.loan_status}
                      </span>
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
                      {repayment.due_date.split(" ")[0]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {repayment.created_at.split("T")[0] +
                        " " +
                        repayment.created_at.split("T")[1].split(".")[0]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleApprove(repayment)}
                          className="bg-success-500 text-white text-sm  py-1 rounded-md mb-2 w-16"
                        >
                          Approve
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

const AuthenticatedPendingRepayments = withAuth(PendingRepayments);
export default AuthenticatedPendingRepayments;
