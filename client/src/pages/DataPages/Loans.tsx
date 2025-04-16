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
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
//import { useNavigate } from "react-router";

interface Loan {
  id: number;
  customer_name: string;
  national_id: string;
  loan_product: string;
  purpose: string;
  principal: number;
  total_amount: number;
  remaining_balance: number;
  status: string;
  due_date: string;
}
const Loans = () => {
  const { isOpen, openModal, closeModal } = useModal();
  useEffect(() => {
    fetchLoans();
  }, []);

  const [loansData, setLoansData] = useState<Loan[]>([]);
  const fetchLoans = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loans/loan-details"
      );
      console.log("Data fetched successfully:", response.data);
      setLoansData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [createdBy, setCreatedBy] = useState<number>(0);
  const [loanId, setLoanId] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [mpesaCode, setMpesaCode] = useState<string>("");
  const [paidDate, setPaidDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setPaidDate(new Date().toISOString().split("T")[0]);
    setStatus("pending");
    setCreatedBy(parseInt(localStorage.getItem("userId") || "0"));
  }, []);

  const handleRepay = async (loanId: number, dueDate: string) => {
    console.log("loan ID:", loanId);
    console.log("due date:", dueDate);
    setLoanId(loanId);
    setDueDate(dueDate);
    openModal();
  };

  const repaymentData = {
    loanId,
    amount,
    dueDate,
    paidDate,
    status,
    mpesaCode,
    createdBy,
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/repayments",
        repaymentData
      );
      console.log("Data posted successfully:", response.data);
      fetchLoans();
    } catch (error) {
      console.error("Error posting data:", error);
    }
    closeModal();
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
                    Loan Product
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
                    Principal
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Loan Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
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
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loansData.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {loan.customer_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.national_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.loan_product}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {loan.purpose}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.principal}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.total_amount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.remaining_balance}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.status}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {loan.due_date.split(" ")[0]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => handleRepay(loan.id, loan.due_date)}
                        className="text-success-500 hover:text-success-700 ml-4"
                      >
                        Repay
                      </button>
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
              Repayment
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={(e) => handleSaveClick(e)}>
            <div className="custom-scrollbar h-[200px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Amount</Label>
                    <Input
                      type="text"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Mpesa Code</Label>
                    <Input
                      type="text"
                      onChange={(e) => setMpesaCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
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

const AuthenticatedLoans = withAuth(Loans);

export default AuthenticatedLoans;
