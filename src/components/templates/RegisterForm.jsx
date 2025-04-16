import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, checkUsername } from "../../services/auth";
import { UserCircle, Upload } from "../modules/Icons";
import { useAuth } from "../../context/AuthProvider";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
    setFocus,
  } = useForm({ mode: "onChange" });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Timeout for debounce username check
  const usernameCheckTimeout = useRef(null);

  // Set focus on the first field on load
  useEffect(() => {
    setFocus("first_name");
  }, [setFocus]);

  // Watch password for confirmation check
  const password = watch("password", "");
  const username = watch("username", "");

  // Effect for checking username availability
  useEffect(() => {
    if (!username || username.length < 3) return;

    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Set new timeout for debounce
    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        setCheckingUsername(true);
        const isAvailable = await checkUsername(username);

        if (!isAvailable) {
          setError("username", {
            type: "manual",
            message: "This username is already taken",
          });
        } else {
          clearErrors("username");
        }
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    // Cleanup on unmount
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, [username, setError, clearErrors]);

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setApiError("Please upload an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setApiError("Image size should not exceed 5MB");
        return;
      }

      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImageUrl(imageUrl);
      setApiError("");
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("confirm_password", data.confirm_password);

      if (profileImage) {
        formData.append("avatar", profileImage);
      }

      const response = await registerUser(formData);

      // Update auth context and navigate to dashboard
      await login({ token: response.token });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(error.message);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold text-gray-800">Sign Up</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your information to create an account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Profile Image Upload */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex justify-between w-full items-center">
            <div
              className="h-16 w-16 overflow-hidden rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={triggerFileInput}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div
              className="items-center justify-center rounded-full cursor-pointer"
              onClick={triggerFileInput}
            >
              <span className="mt-2 block text-center text-xs text-gray-500">
                Upload ➕
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              aria-label="Upload profile picture"
            />
          </div>
        </div>

        {/* First Name */}
        <div className="mb-4">
          <label
            htmlFor="first_name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            First name
          </label>
          <input
            id="first_name"
            type="text"
            {...register("first_name", {
              required: "First name is required",
              maxLength: {
                value: 150,
                message: "First name cannot exceed 150 characters",
              },
            })}
            className={`w-full rounded-md border ${
              errors.first_name ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.first_name ? "true" : "false"}
          />
          {errors.first_name && (
            <span className="mt-1 text-xs text-red-500" role="alert">
              {errors.first_name.message}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label
            htmlFor="last_name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Last name
          </label>
          <input
            id="last_name"
            type="text"
            {...register("last_name", {
              required: "Last name is required",
              maxLength: {
                value: 150,
                message: "Last name cannot exceed 150 characters",
              },
            })}
            className={`w-full rounded-md border ${
              errors.last_name ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.last_name ? "true" : "false"}
          />
          {errors.last_name && (
            <span className="mt-1 text-xs text-red-500" role="alert">
              {errors.last_name.message}
            </span>
          )}
        </div>

        {/* Username */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                maxLength: {
                  value: 150,
                  message: "Username cannot exceed 150 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Username can only contain letters, numbers, and underscores",
                },
              })}
              className={`w-full rounded-md border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
              aria-invalid={errors.username ? "true" : "false"}
            />
            {checkingUsername && (
              <div className="absolute right-3 top-2.5">
                <svg
                  className="animate-spin h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          {errors.username && (
            <span className="mt-1 text-xs text-red-500" role="alert">
              {errors.username.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
              },
            })}
            className={`w-full rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && (
            <span className="mt-1 text-xs text-red-500" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label
            htmlFor="confirm_password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirm_password"
            type="password"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            className={`w-full rounded-md border ${
              errors.confirm_password ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.confirm_password ? "true" : "false"}
          />
          {errors.confirm_password && (
            <span className="mt-1 text-xs text-red-500" role="alert">
              {errors.confirm_password.message}
            </span>
          )}
        </div>

        {apiError && (
          <div
            className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
