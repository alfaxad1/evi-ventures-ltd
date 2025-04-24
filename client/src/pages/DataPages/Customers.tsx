import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import { useNavigate } from "react-router";
import withAuth from "../../utils/withAuth";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";

interface Customer {
  id: number;
  first_name: string;
  phone: string;
  national_id: string;
  address: string;
  occupation: string;
}

const Customers = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const role: string = JSON.parse(localStorage.getItem("role") || "''");
  const userId: string = localStorage.getItem("userId") || "";

  useEffect(() => {
    fetchData(role, userId);
  }, [role, userId]);

  console.log("Role:", role);
  console.log("User ID:", userId);

  const fetchData = async (
    role: string,
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/customers?role=${role}&userId=${userId}&page=${page}&limit=${limit}`
      );
      console.log("Data fetched successfully:", response.data);
      setCustomerData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer); // Set the selected customer
    openModal(); // Open the modal
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    if (selectedCustomer) {
      setSelectedCustomer({ ...selectedCustomer, [field]: value });
    }
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      try {
        const response = await axios.put(
          `http://localhost:8000/api/customers/${selectedCustomer.id}`,
          selectedCustomer
        );
        console.log("Customer updated successfully:", response.data);
        //fetchData(); // Refresh the data
        //closeModal(); // Close the modal
      } catch (error) {
        console.error("Error updating customer:", error);
      }
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/customers/${customer.id}`
        );
        console.log("Customer deleted successfully:", response.data);
        toast.success(response.data.message);
        fetchData(role, userId); // Refresh the data
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
    }
  };

  return (
    <div>
      <ToastContainer position="bottom-right" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-screen-lg mx-auto">
          <div className="w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    ID Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Address
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Occupation
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
                {customerData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {customer.first_name}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {customer.national_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {customer.address}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {customer.occupation}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => {
                          localStorage.setItem(
                            "customerId",
                            customer.id.toString()
                          );
                          navigate("/loan-application");
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Apply
                      </button>

                      <button
                        onClick={() => handleEditClick(customer)}
                        className="text-blue-500 hover:text-blue-700 ml-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-error-500 hover:text-error-700 ml-4"
                      >
                        Delete
                      </button>
                      <button className="ml-4">View</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Modal
              isOpen={isOpen}
              onClose={closeModal}
              className="max-w-[700px] m-4"
            >
              <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Information
                  </h4>
                </div>
                <form
                  className="flex flex-col"
                  onSubmit={(e) => handleSaveClick(e)}
                >
                  <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                    <div className="mt-7">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <div className="col-span-2 lg:col-span-1">
                          <Label>First Name</Label>
                          <Input
                            type="text"
                            value={selectedCustomer?.first_name || ""}
                            onChange={(e) =>
                              handleInputChange("first_name", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>Phone</Label>
                          <Input
                            type="text"
                            value={selectedCustomer?.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>ID Number</Label>
                          <Input
                            type="text"
                            value={selectedCustomer?.national_id || ""}
                            onChange={(e) =>
                              handleInputChange("national_id", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <Label>Address</Label>
                          <Input
                            type="text"
                            value={selectedCustomer?.address || ""}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Occupation</Label>
                          <Input
                            type="text"
                            value={selectedCustomer?.occupation || ""}
                            onChange={(e) =>
                              handleInputChange("occupation", e.target.value)
                            }
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
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedCustomers = withAuth(Customers);

export default AuthenticatedCustomers;
