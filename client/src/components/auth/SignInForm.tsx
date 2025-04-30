import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        formData
      );
      console.log("Form submitted successfully:", response);
      if (response.data.token) {
        navigate("/");
        const accessTokenExpiry: number = new Date().getTime() + 3600 * 1000;
        localStorage.setItem(
          "access_token_expiry",
          accessTokenExpiry.toString()
        );
        localStorage.setItem("userName", JSON.stringify(response.data.name));
        localStorage.setItem("userEmail", JSON.stringify(response.data.email));
        localStorage.setItem("role", JSON.stringify(response.data.role));
        localStorage.setItem("userId", JSON.stringify(response.data.id));

        localStorage.setItem("token", response.data.token);
      } else {
        console.error("Error: No token received in response");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        console.error("Error submitting form:", err.response.data);
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
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and password to sign in!
              </p>
            </div>
            <div>
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      onChange={(e) => handleChange(e)}
                      name="email"
                    />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        onChange={(e) => handleChange(e)}
                        name="password"
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
                  {/* <div className="flex items-center justify-between">
                    <Link
                      to="/reset-password"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Forgot password?
                    </Link>
                  </div> */}
                  <div>
                    <Button className="w-full" size="sm" type="submit">
                      Sign in
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
