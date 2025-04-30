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

import Button from "../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import { Search } from "lucide-react";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  address: string;
  occupation: string;
  passport_photo: string;
  national_id_photo: string;
  created_by_name: string;
}

// Define the structure of a referee
interface Referee {
  name: string;
  relationship: string;
  phone_number: string;
}

// Define the structure of a guarantor
interface Guarantor {
  name: string;
  relationship: string;
  phone_number: string;
  collaterals: Collateral[];
}

// Define the structure of a collateral
interface Collateral {
  item_name: string;
  item_count: number;
  additional_details: string;
}

// Define the structure of viewCustomerDetails
interface ViewCustomerDetails {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    national_id: string;
    address: string;
    occupation: string;
    monthly_income: number;
    passport_photo: string;
    national_id_photo: string;
  };
  collaterals: Collateral[];
  referees: Referee[];
  guarantors: Guarantor[];
}

const Customers = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<Customer[]>([]);
  // const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
  //   null
  // );
  const [viewCustomerDetails, setViewCustomerDetails] =
    useState<ViewCustomerDetails | null>(null);
  const role: string = JSON.parse(localStorage.getItem("role") || "''");
  const userId: string = localStorage.getItem("userId") || "";

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchString, setSearchString] = useState<string>("");

  useEffect(() => {
    fetchData(role, userId, page);
  }, [role, userId, page]);
  const fetchData = async (
    role: string,
    userId: string,
    page: number
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/customers?role=${role}&userId=${userId}&page=${page}`
      );
      console.log("Data fetched successfully:", response.data);
      setCustomerData(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // const handleEditClick = (customer: Customer) => {
  //   setSelectedCustomer(customer); // Set the selected customer
  //   openModal(); // Open the modal
  // };

  // const handleInputChange = (field: keyof Customer, value: string) => {
  //   if (selectedCustomer) {
  //     setSelectedCustomer({ ...selectedCustomer, [field]: value });
  //   }
  // };

  // const handleSaveClick = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedCustomer) {
  //     try {
  //       const response = await axios.put(
  //         `http://localhost:8000/api/customers/${selectedCustomer.id}`,
  //         selectedCustomer
  //       );
  //       console.log("Customer updated successfully:", response.data);
  //       //fetchData(); // Refresh the data
  //       //closeModal(); // Close the modal
  //     } catch (error) {
  //       console.error("Error updating customer:", error);
  //     }
  //   }
  // };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/customers/${customer.id}`
        );
        console.log("Customer deleted successfully:", response.data);
        toast.success(response.data.message);
        fetchData(role, userId, page); // Refresh the data
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

  const handleViewClick = async (customerId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/customerNew/${customerId}`
      );
      setViewCustomerDetails(response.data);
      openModal(); // Open the modal
      console.log("Customer details fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const filteredCustomers = customerData.filter((customer) => {
    return (
      customer.first_name.toLowerCase().includes(searchString.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchString.toLowerCase())
    );
  });

  return (
    <div>
      <ToastContainer position="bottom-right" />
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search />
        </span>
        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search ..."
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900  dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div></div>
        <div className="max-w-screen-lg mx-auto">
          <div className="w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    ID Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Address
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created By
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-blue-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <img
                            width={40}
                            height={40}
                            src={customer.passport_photo}
                            alt={customer.first_name}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {customer.first_name} {customer.last_name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {customer.occupation}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {customer.national_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {customer.address}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {customer.created_by_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
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

                      {/* <button
                        onClick={() => handleEditClick(customer)}
                        className="text-blue-500 hover:text-blue-700 ml-4"
                      >
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-error-500 hover:text-error-700 ml-4"
                      >
                        Delete
                      </button>
                      <button
                        className="ml-4"
                        onClick={() => handleViewClick(customer.id)}
                      >
                        View
                      </button>
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
                    Customer Details
                  </h4>
                </div>
                {viewCustomerDetails ? (
                  <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                    <div className="mt-7">
                      <h5 className="font-bold">Personal Information</h5>

                      <p>
                        Name: {viewCustomerDetails.customer.first_name}{" "}
                        {viewCustomerDetails.customer.last_name}
                      </p>
                      <p>Phone: {viewCustomerDetails.customer.phone}</p>
                      <p>
                        National ID: {viewCustomerDetails.customer.national_id}
                      </p>
                      <p>Address: {viewCustomerDetails.customer.address}</p>
                      <p>
                        Occupation: {viewCustomerDetails.customer.occupation}
                      </p>
                      <p>
                        Monthly Income:{" "}
                        {viewCustomerDetails.customer.monthly_income}
                      </p>

                      <div className="flex gap-4 m-4">
                        <div className="w-36 h-40 overflow-hidden">
                          <img
                            width={128}
                            height={128}
                            src={viewCustomerDetails.customer.passport_photo}
                            alt="Customer passport photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-64 h-40 overflow-hidden">
                          <img
                            width={128}
                            height={128}
                            src={viewCustomerDetails.customer.national_id_photo}
                            alt="Customer national ID photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <h5 className="font-bold mt-4">Collaterals</h5>
                      {viewCustomerDetails.collaterals.length > 0 ? (
                        viewCustomerDetails.collaterals.map(
                          (collateral: Collateral, index: number) => (
                            <p key={index}>
                              {collateral.item_name} - {collateral.item_count} (
                              {collateral.additional_details})
                            </p>
                          )
                        )
                      ) : (
                        <p>No collaterals available.</p>
                      )}
                      <h5 className="font-bold mt-4">Referees</h5>
                      {viewCustomerDetails?.referees.length > 0 ? (
                        viewCustomerDetails.referees.map((referee, index) => (
                          <p key={index}>
                            {referee.name} - {referee.relationship} (
                            {referee.phone_number})
                          </p>
                        ))
                      ) : (
                        <p>No referees available.</p>
                      )}

                      <h5 className="font-bold mt-4">Guarantors</h5>
                      {viewCustomerDetails?.guarantors.length > 0 ? (
                        viewCustomerDetails.guarantors.map(
                          (guarantor, index) => (
                            <div key={index}>
                              <p>
                                {guarantor.name} - {guarantor.relationship} (
                                {guarantor.phone_number})
                              </p>
                              <h6 className="font-bold">
                                Guarantor Collaterals
                              </h6>
                              {guarantor.collaterals.length > 0 ? (
                                guarantor.collaterals.map(
                                  (collateral, cIndex) => (
                                    <p key={cIndex}>
                                      {collateral.item_name} -{" "}
                                      {collateral.item_count} (
                                      {collateral.additional_details})
                                    </p>
                                  )
                                )
                              ) : (
                                <p>No collaterals available.</p>
                              )}
                            </div>
                          )
                        )
                      ) : (
                        <p>No guarantors available.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              </div>
            </Modal>
            {/* <Modal
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
            </Modal> */}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            size="sm"
            className="hover:bg-gray-200 m-4"
            variant="outline"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            className="hover:bg-gray-200 m-4"
            variant="outline"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedCustomers = withAuth(Customers);

export default AuthenticatedCustomers;
