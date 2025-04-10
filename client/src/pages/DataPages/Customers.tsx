import { useEffect } from "react";
import axios from "axios";

const Customers = () => {
  useEffect(() => {
    fetchData();
  });
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/customers");
      console.log("Data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return <div className="">Customers</div>;
};

export default Customers;
