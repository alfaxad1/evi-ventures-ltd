import { toast, ToastContainer } from "react-toastify";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import withAuth from "../../utils/withAuth";
import { useState } from "react";
import axios from "axios";

interface productData {
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationDays: number;
  processingFee: number;
}

const AddLoanProduct = () => {
  const [formData, setFormData] = useState<productData>({
    name: "",
    description: "",
    minAmount: 0,
    maxAmount: 0,
    interestRate: 0,
    durationDays: 30,
    processingFee: 0,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      minAmount: 0,
      maxAmount: 0,
      interestRate: 0,
      durationDays: 30,
      processingFee: 0,
    });
  };

  const save = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/loanProducts`,
        formData
      );
      console.log(response.data.message);
      toast.success(response.data.message);
      resetForm();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.error("Error saving:", err.response.data);
        toast.error(
          err.response.data.error || err.response.data.errors?.[0]?.msg
        );
      } else {
        console.error("An unexpected error occurred", err);
      }
    }
  };
  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label htmlFor="product">Product Name</Label>
            <Input
              value={formData.name}
              type="text"
              placeholder="product name"
              name="name"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              value={formData.description}
              type="text"
              placeholder="description"
              name="description"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-amount">Minimum Amount</Label>
              <Input
                value={formData.minAmount}
                type="number"
                placeholder="Minimum amount"
                name="minAmount"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <Label htmlFor="max-amount">Maximum Amount</Label>
              <Input
                value={formData.maxAmount}
                type="number"
                placeholder="Maximum amount"
                name="maxAmount"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="interest-rate">Interest Rate</Label>
            <Input
              value={formData.interestRate}
              type="number"
              placeholder="interestRate"
              name="interestRate"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (Days)</Label>
            <Input
              value={formData.durationDays}
              type="number"
              placeholder="Duration"
              name="durationDays"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="processing-fee">Processing Fee</Label>
            <Input
              value={formData.processingFee}
              type="number"
              placeholder="Processing Fee"
              name="processingFee"
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-items-end">
        <Button className="w-20 mt-6" onClick={save}>
          Save
        </Button>
      </div>
    </>
  );
};

const AuthenticatedAddLoanProduct = withAuth(AddLoanProduct);
export { AuthenticatedAddLoanProduct as AddLoanProduct };
