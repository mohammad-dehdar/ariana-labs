import axios from "axios";
import Cookies from "js-cookie"; 

const API_URL = "https://mock.arianalabs.io/api";

// Create an axios instance with default settings
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token"); // Get token from cookies
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("token"); // Remove token from cookies
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

const formatErrorMessage = (error) => {
    if (!error.response) {
        return "Error connecting to the server. Please check your internet connection.";
    }

    const { status, data } = error.response;

    if (status === 400) {
        if (data.username) return `Username error: ${data.username[0]}`;
        if (data.password) return `Password error: ${data.password[0]}`;
        if (data.non_field_errors) return data.non_field_errors[0];
        if (data.detail) return data.detail;
    }

    if (status === 401) {
        return "Invalid credentials or session has expired.";
    }

    if (status === 403) {
        return "You do not have access to this resource.";
    }

    if (status === 404) {
        return "The requested resource was not found.";
    }

    if (status === 500) {
        return "Internal server error. Please try again later.";
    }

    return "An error occurred while processing the request.";
};

export const loginUser = async (username, password) => {
    try {
        const response = await api.post("/auth/", { username, password });
        const { token } = response.data;

        // Save the token in a cookie
        Cookies.set("token", token, { expires: 7 }); // Expires in 7 days

        return response.data;
    } catch (error) {
        throw new Error(formatErrorMessage(error));
    }
};

// User registration
export const registerUser = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/register/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // If the API returns a token upon registration, save it in a cookie
        if (response.data.token) {
            Cookies.set("token", response.data.token, { expires: 7 });
        }

        return response.data;
    } catch (error) {
        throw new Error(formatErrorMessage(error));
    }
};

// Get current user data
export const getCurrentUser = async () => {
    try {
        const response = await api.get("/current-user/");
        return response.data;
    } catch (error) {
        throw new Error(formatErrorMessage(error));
    }
};

// Check username availability
export const checkUsername = async (username) => {
    try {
        const response = await api.get(`/check-username/?username=${username}`);
        return response.data.available;
    } catch (error) {
        console.error("Error checking username availability:", error);
        // Allow registration by default
        return true;
    }
};

// Check authentication status
export const isAuthenticated = () => {
    return Cookies.get("token") !== undefined; // Check if token exists in cookies
};

// User logout
export const logoutUser = () => {
    Cookies.remove("token"); // Remove token from cookies
    // Clear all session-related data
    sessionStorage.clear();
};

// Get token
export const getToken = () => {
    return Cookies.get("token"); // Get token from cookies
};
