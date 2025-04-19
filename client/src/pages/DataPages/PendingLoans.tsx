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
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

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
  const { isOpen, openModal, closeModal } = useModal();

  const [pendingLoans, setPendingLoans] = useState<pendingLoan[]>([]);
  const [reason, setReason] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);

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

  const handleRejectClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId); // Set the application ID for rejection
    openModal(); // Open the modal
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!selectedApplicationId) return; // Ensure an application ID is selected

    try {
      await axios.put(
        `http://localhost:8000/api/loansApplication/reject/${selectedApplicationId}`,
        { reason: reason }
      );
      console.log("Loan rejected successfully");
      fetchPendingLoans(); 
      closeModal(); 
      setReason(""); 
      setSelectedApplicationId(null); 
    } catch (error) {
      console.error("Error rejecting loan:", error);
    }
  };

  return (
    <>
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
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleApprove(loan.application_id)}
                          className="bg-success-500 text-white text-sm  py-1 rounded-md mb-2 w-16"
                        >
                          Approve
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleRejectClick(loan.application_id)}
                          className="bg-error-500 text-white text-sm  py-1 rounded-md mr-2 w-16"
                        >
                          Reject
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Reason
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={(e) => handleSaveClick(e)}>
            <div className="custom-scrollbar h-[200px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Reason</Label>
                    <Input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

const AuthenticatedPendingLoans = withAuth(PendingLoans);
export default AuthenticatedPendingLoans;
