import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../../services/auth";
import { useAuth } from "../../context/AuthProvider";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  
  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  const onSubmit = async (data) => {
    console.log(data)
    setIsLoading(true);
    setApiError("");

    try {
      const result = await loginUser(data.username, data.password);
      await login(result);
      
      
      navigate(from, { replace: true });
    } catch (error) {
      setApiError(error.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold text-gray-800">Login</h1>
      <p className="mb-6 text-sm text-gray-600">Enter your username and password to login to your account.</p>

      {location.state?.message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Please enter your username"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 1, message: "Username must be at least 1 character" },
            })}
            className={`w-full rounded-md border ${
              errors.username ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.username ? "true" : "false"}
          />
          {errors.username && <span className="mt-1 text-xs text-red-500" role="alert">{errors.username.message}</span>}
        </div>

        <div className="mb-6">
          <div className="flex justify-between">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Please enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 1, message: "Password must be at least 1 character" },
            })}
            className={`w-full rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && <span className="mt-1 text-xs text-red-500" role="alert">{errors.password.message}</span>}
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm" role="alert">
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
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-gray-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;