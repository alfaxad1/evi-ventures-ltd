import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";

interface userData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  avatar?: File;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<userData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);

  const navigate = useNavigate();

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]); // Set the selected file
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("password", formData.password);
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }

      const resetForm = () => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          role: "",
          password: "",
        });
      };

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not authorized ");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/users/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      resetForm();
      console.log("Form submitted successfully:", response);
      toast.success("User created successfully");
      navigate("/all-users");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          toast.error("You are not authorized");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
        console.error("Error approving loan:", error);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8"></div>
            <div>
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        First Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="fname"
                        name="firstName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {/* Last Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        Last Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      onChange={(e) => handleChange(e)}
                      name="email"
                      placeholder="Enter your email"
                    />
                  </div>
                  {/* Role */}
                  <div>
                    <Label>
                      Role<span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={[
                        { value: "admin", label: "Admin" },
                        { value: "officer", label: "Officer" },
                      ]}
                      onChange={handleSelectChange}
                      placeholder="Select your role"
                    />
                  </div>
                  {/* Password */}
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        placeholder="Enter your password"
                        onChange={(e) => handleChange(e)}
                        type={showPassword ? "text" : "password"}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Avatar */}
                  <div>
                    <Label>Avatar</Label>
                    <Input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e)}
                    />
                  </div>
                  {/* Submit Button */}
                  <div>
                    <Button className="w-full" size="sm" type="submit">
                      Submit
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
