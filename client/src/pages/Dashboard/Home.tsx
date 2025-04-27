import PageMeta from "../../components/common/PageMeta";
import { BarChart, Clock, DollarSign, Gift, Users } from "lucide-react";
import { BoxIconLine } from "../../icons";
import withAuth from "../../utils/withAuth";
import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const role = JSON.parse(localStorage.getItem("role") || "''");
  const officerId = localStorage.getItem("userId") || "";

  const [pendingLoansCount, setPendingLoansCount] = useState([]);
  const [approvedLoansCount, setApprovedLoansCount] = useState([]);
  const [rejectedLoansCount, setRejectedLoansCount] = useState([]);
  const [clearedLoansCount, setClearedLoansCount] = useState([]);
  const [dueTodayCount, setDueTodayCount] = useState([]);
  const [dueTommorrowCount, setDueTommorrowCount] = useState([]);

  //pending loans
  const fetchPendingLoans = async (
    role: string,
    officerId: string
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loansApplication/pending?role=${role}&officerId=${officerId}`
      );
      console.log("Pending loans fetched successfully:", response.data);
      setPendingLoansCount(response.data.total);
    } catch (error) {
      console.error("Error fetching pending loans:", error);
    }
  };
  useEffect(() => {
    fetchPendingLoans(role, officerId);
  }, [role, officerId]);

  //approved loans
  const fetchLoans = async (role: string, officerId: string): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loans/loan-details?role=${role}&officerId=${officerId}`
      );
      console.log("Approved loans", response.data.meta.total);
      setApprovedLoansCount(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchLoans(role, officerId);
  }, [role, officerId]);

  //rejected loans
  const fetchRejectedLoans = async (
    role: string,
    officerId: string
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loansApplication/rejected?role=${role}&officerId=${officerId}`
      );
      console.log("Rejected loans:", response.data.length);
      setRejectedLoansCount(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchRejectedLoans(role, officerId);
  }, [role, officerId]);

  //cleared loans
  const fetchPaidLoans = async (
    role: string,
    officerId: string
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/loans/loan-details/paid?role=${role}&officerId=${officerId}`
      );
      console.log("Cleared Loans:", response.data.length);
      setClearedLoansCount(response.data.length);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchPaidLoans(role, officerId);
  }, [role, officerId]);

  //due today
  const DueToday = async (role: string, officerId: string): Promise<void> => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loans/loan-details/due-today",
        {
          params: {
            role,
            officerId,
          },
        }
      );
      console.log("Due today:", response.data.meta.total);
      setDueTodayCount(response.data.meta.total);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    DueToday(role, officerId);
  }, [role, officerId]);

  //due tommorrow
  const DueTommorrow = async (
    role: string,
    officerId: string
  ): Promise<void> => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loans/loan-details/due-tomorrow",
        {
          params: {
            role,
            officerId,
          },
        }
      );
      console.log("Due tommorrow:", response.data.meta.total);
      setDueTommorrowCount(response.data.meta.total);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    DueTommorrow(role, officerId);
  }, [role, officerId]);

  return (
    <>
      <PageMeta title="Evi Ventures Ltd" description="This is Evi" />
      <div className="grid gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Users className="text-gray-800 size-6 dark:text-white/90" />
              </div>

              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Pending Loans
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-center text-title-sm dark:text-white/90">
                    {pendingLoansCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BarChart className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Approved Loans
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-center text-title-sm dark:text-white/90">
                    {approvedLoansCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Rejected Loans
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {rejectedLoansCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Users className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Cleared Loans
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {clearedLoansCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Gift className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Due Today
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {dueTodayCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Gift className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg  text-gray-500 dark:text-gray-400">
                    Due Tommorrow
                  </span>
                  <h4 className="mt-2 font-bold text-center text-gray-800 text-title-sm dark:text-white/90">
                    {dueTommorrowCount}
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Clock className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Due 2-7 Days
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    5,359
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <DollarSign className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    Defaulted
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    5,359
                  </h4>
                </div>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}
          </div>
        </div>
      </div>
    </>
  );
};

const AuthenticatedHome = withAuth(Home);
export default AuthenticatedHome;
