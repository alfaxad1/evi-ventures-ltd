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

//import { useNavigate } from "react-router";

interface pendingLoan {
  id: number;
  customer_full_name: string;
  national_id: string;
  phone: string;
  occupation: string;
  address: string;
  monthly_income: number;
  product_name: string;
  amount: number;
  purpose: string;
  comments: string;
  application_id: number;
}

const PendingLoans = () => {

  const [pendingLoans, setPendingLoans] = useState<pendingLoan[]>([]);

  const fetchPendingLoans = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loansApplication/pending"
      );
      console.log("Pending loans fetched successfully:", response.data);
      setPendingLoans(response.data);
    } catch (error) {
      console.error("Error fetching pending loans:", error);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const handleApprove = async (applicationId: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/loansApplication/approve/${applicationId}`
      );
      console.log("Loan approved successfully");
      fetchPendingLoans(); // Refresh the list after approval
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };
  //const reason = "fake details";
  const handleReject = async (applicationId: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/loansApplication/reject/${applicationId}`,
        { reason: "fake details" }
      );
      console.log("Loan rejected successfully");
      fetchPendingLoans(); // Refresh the list after rejection
    } catch (error) {
      console.error("Error rejecting loan:", error);
    }
  };

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
                  National ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone Number
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Occupation
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Monthly Income
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
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Purpose
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Comments
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
              {pendingLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {loan.customer_full_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {loan.national_id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {loan.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {loan.occupation}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.address}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.monthly_income}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.product_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.purpose}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {loan.comments}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      className="bg-success-500 text-white text-sm px-4 py-2 rounded-md mb-2 w-20"
                      onClick={() => handleApprove(loan.application_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-error-500 text-white text-sm px-4 py-2 rounded-md mr-2 w-20"
                      onClick={() => handleReject(loan.application_id)}
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

const AuthenticatedPendingLoans = withAuth(PendingLoans);

export default AuthenticatedPendingLoans;
