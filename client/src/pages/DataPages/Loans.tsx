import axios from "axios";
import { useEffect } from "react";

const Loans = () => {
  useEffect(() => {
    fetchLoans();
  }, []);
  
  const fetchLoans = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/loans");
      console.log("Data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return <div>Loans</div>;
};

export default Loans;
