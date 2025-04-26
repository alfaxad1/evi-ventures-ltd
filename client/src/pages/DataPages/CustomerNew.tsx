import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";

// Type definitions
type Collateral = {
  item_name: string;
  item_count: number;
  additional_details: string;
};

type Referee = {
  name: string;
  id_number: string;
  phone_number: string;
  relationship: string;
};

type GuarantorCollateral = {
  item_name: string;
  item_count: number;
  additional_details: string;
};

type Guarantor = {
  name: string;
  id_number: string;
  phone_number: string;
  relationship: string;
  business_location: string;
  residence_details: string;
  id_photo: File | null;
  pass_photo: File | null;
  collaterals: GuarantorCollateral[];
};

type CustomerFormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  address: string;
  county: string;
  occupation: string;
  business_name: string;
  business_location: string;
  residence_details: string;
  monthly_income: string;
  credit_score: string;
  created_by: number;
  national_id_photo: File | null;
  passport_photo: File | null;
  collaterals: Collateral[];
  referees: Referee[];
  guarantors: Guarantor[];
};

const CustomerNew: React.FC = () => {
  const initialFormData: CustomerFormData = {
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    national_id: "",
    date_of_birth: "",
    gender: "",
    address: "",
    county: "",
    occupation: "",
    business_name: "",
    business_location: "",
    residence_details: "",
    monthly_income: "",
    credit_score: "",
    created_by: 1,
    national_id_photo: null,
    passport_photo: null,
    collaterals: [{ item_name: "", item_count: 1, additional_details: "" }],
    referees: [{ name: "", id_number: "", phone_number: "", relationship: "" }],
    guarantors: [
      {
        name: "",
        id_number: "",
        phone_number: "",
        relationship: "",
        business_location: "",
        residence_details: "",
        id_photo: null,
        pass_photo: null,
        collaterals: [{ item_name: "", item_count: 1, additional_details: "" }],
      },
    ],
  };
  const resetForm = () => {
    setFormData(initialFormData);
  };

  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    national_id: "",
    date_of_birth: "",
    gender: "",
    address: "",
    county: "",
    occupation: "",
    business_name: "",
    business_location: "",
    residence_details: "",
    monthly_income: "",
    credit_score: "",
    created_by: 1,
    national_id_photo: null,
    passport_photo: null,
    collaterals: [{ item_name: "", item_count: 1, additional_details: "" }],
    referees: [{ name: "", id_number: "", phone_number: "", relationship: "" }],
    guarantors: [
      {
        name: "",
        id_number: "",
        phone_number: "",
        relationship: "",
        business_location: "",
        residence_details: "",
        id_photo: null,
        pass_photo: null,
        collaterals: [{ item_name: "", item_count: 1, additional_details: "" }],
      },
    ],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCollateralChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedCollaterals = [...formData.collaterals];
    updatedCollaterals[index] = {
      ...updatedCollaterals[index],
      [name]: name === "item_count" ? parseInt(value) || 1 : value,
    };
    setFormData((prev) => ({ ...prev, collaterals: updatedCollaterals }));
  };

  const handleRefereeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedReferees = [...formData.referees];
    updatedReferees[index] = {
      ...updatedReferees[index],
      [name]: value,
    };
    setFormData((prev) => ({ ...prev, referees: updatedReferees }));
  };

  const handleGuarantorChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedGuarantors = [...formData.guarantors];
    updatedGuarantors[index] = {
      ...updatedGuarantors[index],
      [name]: value,
    };
    setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
  };

  const handleGuarantorFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, files } = e.target;
    const updatedGuarantors = [...formData.guarantors];
    if (files && files.length > 0) {
      updatedGuarantors[index] = {
        ...updatedGuarantors[index],
        [name]: files[0],
      };
      setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
    }
  };

  const handleGuarantorCollateralChange = (
    guarantorIndex: number,
    collateralIndex: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedGuarantors = [...formData.guarantors];
    updatedGuarantors[guarantorIndex].collaterals[collateralIndex] = {
      ...updatedGuarantors[guarantorIndex].collaterals[collateralIndex],
      [name]: name === "item_count" ? parseInt(value) || 1 : value,
    };
    setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
  };

  const addCollateral = () => {
    setFormData((prev) => ({
      ...prev,
      collaterals: [
        ...prev.collaterals,
        { item_name: "", item_count: 1, additional_details: "" },
      ],
    }));
  };

  const removeCollateral = (index: number) => {
    const updatedCollaterals = formData.collaterals.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, collaterals: updatedCollaterals }));
  };

  const addReferee = () => {
    setFormData((prev) => ({
      ...prev,
      referees: [
        ...prev.referees,
        { name: "", id_number: "", phone_number: "", relationship: "" },
      ],
    }));
  };

  const removeReferee = (index: number) => {
    const updatedReferees = formData.referees.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, referees: updatedReferees }));
  };

  const addGuarantor = () => {
    setFormData((prev) => ({
      ...prev,
      guarantors: [
        ...prev.guarantors,
        {
          name: "",
          id_number: "",
          phone_number: "",
          relationship: "",
          business_location: "",
          residence_details: "",
          id_photo: null,
          pass_photo: null,
          collaterals: [
            { item_name: "", item_count: 1, additional_details: "" },
          ],
        },
      ],
    }));
  };

  const removeGuarantor = (index: number) => {
    const updatedGuarantors = formData.guarantors.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
  };

  const addGuarantorCollateral = (guarantorIndex: number) => {
    const updatedGuarantors = [...formData.guarantors];
    updatedGuarantors[guarantorIndex].collaterals.push({
      item_name: "",
      item_count: 1,
      additional_details: "",
    });
    setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
  };

  const removeGuarantorCollateral = (
    guarantorIndex: number,
    collateralIndex: number
  ) => {
    const updatedGuarantors = [...formData.guarantors];
    updatedGuarantors[guarantorIndex].collaterals = updatedGuarantors[
      guarantorIndex
    ].collaterals.filter((_, i) => i !== collateralIndex);
    setFormData((prev) => ({ ...prev, guarantors: updatedGuarantors }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append customer data
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "collaterals" &&
          key !== "referees" &&
          key !== "guarantors" &&
          key !== "national_id_photo" &&
          key !== "passport_photo" &&
          value !== null
        ) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append customer photos
      if (formData.national_id_photo) {
        formDataToSend.append("national_id_photo", formData.national_id_photo);
      }
      if (formData.passport_photo) {
        formDataToSend.append("passport_photo", formData.passport_photo);
      }

      // Append collaterals
      formData.collaterals.forEach((collateral, index) => {
        Object.entries(collateral).forEach(([key, value]) => {
          formDataToSend.append(
            `collaterals[${index}][${key}]`,
            value.toString()
          );
        });
      });

      // Append referees
      formData.referees.forEach((referee, index) => {
        Object.entries(referee).forEach(([key, value]) => {
          formDataToSend.append(`referees[${index}][${key}]`, value);
        });
      });

      // Append guarantors and their photos/collaterals
      formData.guarantors.forEach((guarantor, gIndex) => {
        Object.entries(guarantor).forEach(([key, value]) => {
          if (
            key !== "collaterals" &&
            key !== "national_id_photo" &&
            key !== "passport_photo" &&
            value !== null
          ) {
            formDataToSend.append(
              `guarantors[${gIndex}][${key}]`,
              value.toString()
            );
          }
        });

        if (guarantor.id_photo) {
          formDataToSend.append(
            `guarantor_id_photo_${gIndex}`,
            guarantor.id_photo
          );
        }
        if (guarantor.pass_photo) {
          formDataToSend.append(
            `guarantor_pass_photo_${gIndex}`,
            guarantor.pass_photo
          );
        }

        guarantor.collaterals.forEach((collateral, cIndex) => {
          Object.entries(collateral).forEach(([key, value]) => {
            formDataToSend.append(
              `guarantors[${gIndex}][collaterals][${cIndex}][${key}]`,
              value.toString()
            );
          });
        });
      });

      const response = await axios.post(
        "http://localhost:8000/api/customerNew",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      console.log("Response:", response.data);
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError;
      const errmsg = axiosError.response?.data || axiosError.message;
      console.log(errmsg);
      toast.error("Error registering");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">New Customer Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  First Name*
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  National ID*
                </label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Gender*
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Address*
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  County*
                </label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Occupation*
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Business Location
                </label>
                <input
                  type="text"
                  name="business_location"
                  value={formData.business_location}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Residence Details
                </label>
                <textarea
                  name="residence_details"
                  value={formData.residence_details}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Income*
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Credit Score
                </label>
                <input
                  type="number"
                  name="credit_score"
                  value={formData.credit_score}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  National ID Photo*
                </label>
                <input
                  type="file"
                  name="national_id_photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  //required
                  className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">
                  Passport Photo
                </label>
                <input
                  type="file"
                  name="passport_photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Collaterals Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Customer Collaterals</h2>
            {formData.collaterals.map((collateral, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      value={collateral.item_name}
                      onChange={(e) => handleCollateralChange(index, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Count
                    </label>
                    <input
                      type="number"
                      name="item_count"
                      value={collateral.item_count}
                      onChange={(e) => handleCollateralChange(index, e)}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Details
                  </label>
                  <textarea
                    name="additional_details"
                    value={collateral.additional_details}
                    onChange={(e) => handleCollateralChange(index, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCollateral(index)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove Collateral
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCollateral}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Collateral
            </button>
          </section>

          {/* Referees Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Referees</h2>
            {formData.referees.map((referee, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={referee.name}
                      onChange={(e) => handleRefereeChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      ID Number*
                    </label>
                    <input
                      type="text"
                      name="id_number"
                      value={referee.id_number}
                      onChange={(e) => handleRefereeChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={referee.phone_number}
                      onChange={(e) => handleRefereeChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship*
                    </label>
                    <input
                      type="text"
                      name="relationship"
                      value={referee.relationship}
                      onChange={(e) => handleRefereeChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeReferee(index)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove Referee
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReferee}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Referee
            </button>
          </section>

          {/* Guarantors Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Guarantors</h2>
            {formData.guarantors.map((guarantor, gIndex) => (
              <div key={gIndex} className="mb-6 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={guarantor.name}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      ID Number*
                    </label>
                    <input
                      type="text"
                      name="id_number"
                      value={guarantor.id_number}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={guarantor.phone_number}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship*
                    </label>
                    <input
                      type="text"
                      name="relationship"
                      value={guarantor.relationship}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Business Location
                    </label>
                    <input
                      type="text"
                      name="business_location"
                      value={guarantor.business_location}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Residence Details
                    </label>
                    <textarea
                      name="residence_details"
                      value={guarantor.residence_details}
                      onChange={(e) => handleGuarantorChange(gIndex, e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      National ID Photo*
                    </label>
                    <input
                      type="file"
                      name="id_photo"
                      onChange={(e) => handleGuarantorFileChange(gIndex, e)}
                      accept="image/*"
                      required
                      className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">
                      Passport Photo
                    </label>
                    <input
                      type="file"
                      name="pass_photo"
                      onChange={(e) => handleGuarantorFileChange(gIndex, e)}
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                {/* Guarantor Collaterals */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">
                    Guarantor Collaterals
                  </h3>
                  {guarantor.collaterals.map((collateral, cIndex) => (
                    <div
                      key={cIndex}
                      className="mb-4 p-4 border rounded bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700">
                            Item Name
                          </label>
                          <input
                            type="text"
                            name="item_name"
                            value={collateral.item_name}
                            onChange={(e) =>
                              handleGuarantorCollateralChange(gIndex, cIndex, e)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700">
                            Item Count
                          </label>
                          <input
                            type="number"
                            name="item_count"
                            value={collateral.item_count}
                            onChange={(e) =>
                              handleGuarantorCollateralChange(gIndex, cIndex, e)
                            }
                            min="1"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Additional Details
                        </label>
                        <textarea
                          name="additional_details"
                          value={collateral.additional_details}
                          onChange={(e) =>
                            handleGuarantorCollateralChange(gIndex, cIndex, e)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeGuarantorCollateral(gIndex, cIndex)
                        }
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove Collateral
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addGuarantorCollateral(gIndex)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Guarantor Collateral
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeGuarantor(gIndex)}
                  className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove Guarantor
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGuarantor}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Guarantor
            </button>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CustomerNew;
