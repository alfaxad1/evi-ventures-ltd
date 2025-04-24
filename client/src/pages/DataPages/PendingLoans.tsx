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
import { toast, ToastContainer } from "react-toastify";

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
  loan_id: number;
}

const PendingLoans = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingLoans, setPendingLoans] = useState<pendingLoan[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);
  const [disbursedAmount, setDisbursedAmount] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

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

  const handleApproveClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId); // Set the application ID for approval
    setIsApproveModalOpen(true); // Open the approval modal
  };

  const handleApproveSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!selectedApplicationId || !disbursedAmount || disbursedAmount <= 0) {
      alert("Please enter a valid disbursed amount.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not authorized ");
        return;
      }
      await axios.put(
        `http://localhost:8000/api/loansApplication/approve/${selectedApplicationId}`,
        { disbursedAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Loan approved successfully");
      fetchPendingLoans();
      setIsApproveModalOpen(false);
      setDisbursedAmount(null);
      setSelectedApplicationId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setIsApproveModalOpen(false);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          toast.error("You are not authorized to approve this loan.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
        console.error("Error approving loan:", error);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleRejectClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId); // Set the application ID for rejection
    openModal(); // Open the rejection modal
  };

  const handleRejectSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!selectedApplicationId) return; // Ensure an application ID is selected

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not authorized ");
        return;
      }
      await axios.put(
        `http://localhost:8000/api/loansApplication/reject/${selectedApplicationId}`,
        { reason: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Loan rejected successfully");
      fetchPendingLoans();
      setIsApproveModalOpen(false);
      closeModal();
      setReason("");
      setSelectedApplicationId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setIsApproveModalOpen(false);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          toast.error("You are not authorized to approve this loan.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
        console.error("Error approving loan:", error);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
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
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleApproveClick(loan.loan_id)}
                          className="bg-success-500 text-white text-sm  py-1 rounded-md mb-2 w-16"
                        >
                          Approve
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleRejectClick(loan.loan_id)}
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

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Enter Disbursed Amount
            </h4>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => handleApproveSave(e)}
          >
            <div className="custom-scrollbar h-[200px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Disbursed Amount</Label>
                    <Input
                      type="number"
                      value={disbursedAmount || ""}
                      onChange={(e) =>
                        setDisbursedAmount(parseFloat(e.target.value))
                      }
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

      {/* Reject Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Reason
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={(e) => handleRejectSave(e)}>
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
