//import { useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useEffect, useState } from "react";
import Select from "../../components/form/Select";
import axios from "axios";
import Button from "../../components/ui/button/Button";
import withAuth from "../../utils/withAuth";
import { toast, ToastContainer } from "react-toastify";

interface LoanApplicationData {
  productId: number;
  amount: number;
  purpose: string;
  comments: string;
  customerId: number;
  officerId: number;
}

const LoanApplication = () => {
  const [formData, setFormData] = useState<LoanApplicationData>({
    amount: 0,
    purpose: "",
    comments: "",
    productId: 0,
    customerId: 0,
    officerId: 0,
  });
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/loanProducts"
      );
      const formattedOptions = response.data.map(
        (product: { id: string; name: string }) => ({
          value: product.id,
          label: product.name,
        })
      );
      setOptions(formattedOptions);
      console.log("Data fetched successfully:", formattedOptions);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      productId: parseInt(value),
    });
    console.log("Updated formData:", { ...formData, productId: value });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const customerId = localStorage.getItem("customerId");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      customerId: customerId ? parseInt(customerId) : 0,
      officerId: userId ? parseInt(userId) : 0,
    }));
  }, [customerId, userId]);

  console.log("Form data:", formData);

  const resetForm = () => {
    setFormData({
      amount: 0,
      purpose: "",
      comments: "",
      productId: 0,
      customerId: 0,
      officerId: 0,
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/loansApplication",
        formData
      );
      resetForm();
      console.log("Form submitted successfully:", response);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form onSubmit={(e) => save(e)}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="first-name">Product</Label>
              <Select
                options={options}
                onChange={(selectedOption) =>
                  handleSelectChange(selectedOption)
                }
                placeholder="Select a product"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                value={formData.amount}
                type="number"
                placeholder="Amount"
                name="amount"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                value={formData.purpose}
                type="text"
                placeholder="Purpose"
                name="purpose"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Input
                type="text"
                placeholder="Enter some comments"
                name="comments"
                onChange={(e) => handleChange(e)}
                value={formData.comments}
              />
            </div>
          </div>
          <Button className="mt-6 w-md" type="submit">
            Submit
          </Button>
        </form>
      </div>
    </>
  );
};

const AuthenticatedLoanApplication = withAuth(LoanApplication);

export default AuthenticatedLoanApplication;
