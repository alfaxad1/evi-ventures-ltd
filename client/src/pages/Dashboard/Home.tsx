import PageMeta from "../../components/common/PageMeta";
import {
  AlertTriangle,
  Calendar,
  Calendar1,
  CheckCircle,
  Clock,
  Clock1,
  DollarSign,
  XCircle,
} from "lucide-react";

import withAuth from "../../utils/withAuth";
import { useEffect, useState } from "react";
import axios from "axios";

interface Count {
  loans_due_today: number;
  loans_due_tomorrow: number;
  loans_due_2_7_days: number;
  defaulted_loans: number;
  pending_disbursement_loans: number;
  active_loans: number;
  pending_loan_applications: number;
  rejected_loan_applications: number;
}

const Home = () => {
  const role = JSON.parse(localStorage.getItem("role") || "''");
  const officerId = localStorage.getItem("userId") || "";

  const [counts, setCounts] = useState<Count | null>(null); // Initialize as null

  const fetchLoans = async (role: string, officerId: string): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loans/loan-details/counts?role=${role}&officerId=${officerId}`
      );
      console.log("Data fetched successfully:", response.data);
      setCounts(response.data); // Set the counts object
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchLoans(role, officerId);
  }, [role, officerId]);

  if (!counts) {
    return <p>Loading...</p>; // Show a loading message while data is being fetched
  }

  return (
    <>
      <PageMeta title="Evi Ventures Ltd" description="This is Evi" />
      <div className="grid gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
            {/* Metric Item: Pending Loans */}
            <div className="rounded-2xl border border-gray-300 bg-yellow-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Clock1 className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Pending Loans
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-center text-title-sm dark:text-white/90">
                    {counts.pending_loan_applications}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Approved Loans */}
            <div className="rounded-2xl border border-gray-300 bg-green-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <CheckCircle className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Active Loans
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-center text-title-sm dark:text-white/90">
                    {counts.active_loans}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Rejected Loans */}
            <div className="rounded-2xl border border-gray-300 bg-red-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <XCircle className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Rejected Loans
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.rejected_loan_applications}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item:Pending Disbursement */}
            <div className="rounded-2xl border border-gray-300 bg-yellow-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <DollarSign className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Pending Disbursement
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.pending_disbursement_loans}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Due Today */}
            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Calendar className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Due Today
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.loans_due_today}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Due Tomorrow */}
            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Calendar1 className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Due Tomorrow
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.loans_due_tomorrow}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Due 2-7 Days */}
            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Clock className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Due 2-7 Days
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.loans_due_2_7_days}
                  </h4>
                </div>
              </div>
            </div>

            {/* Metric Item: Defaulted Loans */}
            <div className="rounded-2xl border border-gray-300 bg-red-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <AlertTriangle className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Defaulted Loans
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {counts.defaulted_loans}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AuthenticatedHome = withAuth(Home);
export default AuthenticatedHome;
