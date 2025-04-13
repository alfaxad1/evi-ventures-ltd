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
//import { useNavigate } from "react-router";

interface CustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  DOB?: string;
  gender: string;
  address: string;
  county: string;
  occupation: string;
  monthlyIncome: string;
  createdBy?: number;
}

const CustomersForm = () => {

  const [formData, setFormData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: "",
    DOB: "",
    gender: "",
    address: "",
    county: "",
    occupation: "",
    monthlyIncome: "",
    createdBy: 1,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      nationalId: "",
      DOB: "",
      gender: "",
      address: "",
      county: "",
      occupation: "",
      monthlyIncome: "",
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
    } catch (err) {
      console.error("Error saving", err);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label htmlFor="first-name">First Name</Label>
            <Input
              type="text"
              placeholder="first name"
              name="firstName"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              type="text"
              placeholder="last name"
              name="lastName"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              type="text"
              placeholder="phone number"
              name="phone"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="ID">ID Number</Label>
            <Input
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
            <Input
              type="text"
              placeholder="gender"
              name="gender"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              placeholder="address"
              name="address"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="county">County</Label>
            <Input
              type="text"
              placeholder="county"
              name="county"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              type="text"
              placeholder="occupation"
              name="occupation"
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <Label htmlFor="income">Monthly Income</Label>
            <Input
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
