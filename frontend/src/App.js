import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import ProtectedRoute from "./component/layout/ProtectedRoute.js";
import Login from "./pages/Login";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import DistrictDashboard from "./pages/dashboard/DistrictDashboard";
import DistrictDashboardEnhanced from "./pages/dashboard/DistrictDashboardEnhanced.js";
import HQAdminDashboard from "./pages/dashboard/HQAdminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Route based on user role
const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  switch (user.role) {
    case "vendor":
      return <VendorDashboard />;
    case "district_verifier":
      return <DistrictDashboardEnhanced />;
    case "hq_admin":
      return <HQAdminDashboard />;
    case "super_admin":
      return <SuperAdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;
