import axios from "axios";
import { useEffect } from "react";

const LoanApplications = () => {
  useEffect(() => {
    fethLoanAplications();
  }, []);

  const fethLoanAplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loansApplication"
      );
      console.log("Data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return <div>LoanApplications</div>;
};

export default LoanApplications;
