import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Welcome to your Dashboard</h2>
        <p className="text-gray-600">You are successfully logged in.</p>

        {/* Display user data */}
        {user && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">User Information:</h3>
            <p className="text-gray-700"><strong>Username:</strong> {user.username}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
            {/* Add more user fields as needed */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;