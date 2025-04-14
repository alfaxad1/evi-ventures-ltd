import { Calendar1Icon } from "lucide-react";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Flatpickr from "react-flatpickr";
import { useState } from "react";
import Button from "../../components/ui/button/Button";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import withAuth from "../../utils/withAuth";
import Select from "../../components/form/Select";
//import { useNavigate } from "react-router";

interface CustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: number;
  DOB?: string;
  gender: string;
  address: string;
  county: string;
  occupation: string;
  monthlyIncome: number;
  createdBy?: number;
}

const CustomersForm = () => {
  const [formData, setFormData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: 0,
    DOB: "",
    gender: "",
    address: "",
    county: "",
    occupation: "",
    monthlyIncome: 0,
    createdBy: 1,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };
  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const formattedDate = selectedDates[0].toISOString().split("T")[0];
      setFormData({
        ...formData,
        DOB: formattedDate,
      });
    }
  };
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      nationalId: 0,
      DOB: "",
      gender: "",
      address: "",
      county: "",
      occupation: "",
      monthlyIncome: 0,
    });
  };
  const save = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/customers",
        formData
      );
      resetForm();
      toast.success(response.data.message);
      console.log(response.data.message);
      resetForm();
    } catch (err: unknown) {
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
      <div className="text-error-500 text-left" id="error-message"></div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label htmlFor="first-name">First Name</Label>
            <Input
              value={formData.firstName}
              type="text"
              placeholder="first name"
              name="firstName"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              value={formData.lastName}
              type="text"
              placeholder="last name"
              name="lastName"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              value={formData.phone}
              type="text"
              placeholder="phone number"
              name="phone"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="ID">ID Number</Label>
            <Input
              value={formData.nationalId}
              type="number"
              placeholder="ID"
              name="nationalId"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="DOB">Date of Birth</Label>
            <div className="relative w-full flatpickr-wrapper">
              <Flatpickr
                value={formData.DOB}
                name="DOB"
                options={{
                  dateFormat: "Y-m-d",
                }}
                placeholder="Select date of birth"
                onChange={(selectedDates) => handleDateChange(selectedDates)}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <Calendar1Icon className="size-6" />
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              onChange={handleSelectChange}
              placeholder="Select gender"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              value={formData.address}
              type="text"
              placeholder="address"
              name="address"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="county">County</Label>
            <Input
              value={formData.county}
              type="text"
              placeholder="county"
              name="county"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              value={formData.occupation}
              type="text"
              placeholder="occupation"
              name="occupation"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="income">Monthly Income</Label>
            <Input
              value={formData.monthlyIncome}
              name="monthlyIncome"
              type="number"
              placeholder="monthlyIncome"
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <Button className="w-full mt-6" onClick={save}>
          Submit
        </Button>
      </div>
    </>
  );
};

const AuthenticatedCustomersForm = withAuth(CustomersForm);

export default AuthenticatedCustomersForm;
