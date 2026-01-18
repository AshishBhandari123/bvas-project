import React from "react";
import { Nav } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaFileInvoice,
  FaHistory,
  FaUsers,
  FaChartBar,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaListAlt,
  FaClipboardCheck,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.js";

const Sidebar = () => {
  const { user } = useAuth();

  // Vendor Menu
  if (user?.role === "vendor") {
    return (
      <div
        className="sidebar bg-light border-end"
        style={{ width: "250px", minHeight: "calc(100vh - 56px)" }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link
            href="/dashboard"
            className="mb-2 d-flex align-items-center"
          >
            <FaTachometerAlt className="me-3" />
            Dashboard
          </Nav.Link>
          <Nav.Link
            href="/dashboard/submit"
            className="mb-2 d-flex align-items-center"
          >
            <FaFileInvoice className="me-3" />
            Submit New Bill
          </Nav.Link>
          <Nav.Link
            href="/dashboard/bills"
            className="mb-2 d-flex align-items-center"
          >
            <FaListAlt className="me-3" />
            My Bills
          </Nav.Link>
          <Nav.Link
            href="/dashboard/history"
            className="mb-2 d-flex align-items-center"
          >
            <FaHistory className="me-3" />
            History
          </Nav.Link>
        </Nav>
      </div>
    );
  }

  // District Verifier Menu
  if (user?.role === "district_verifier") {
    return (
      <div
        className="sidebar bg-light border-end"
        style={{ width: "250px", minHeight: "calc(100vh - 56px)" }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link
            href="/dashboard"
            className="mb-2 d-flex align-items-center"
          >
            <FaTachometerAlt className="me-3" />
            Dashboard
          </Nav.Link>
          <Nav.Link
            href="/dashboard/pending"
            className="mb-2 d-flex align-items-center"
          >
            <FaClipboardCheck className="me-3" />
            Pending Bills
          </Nav.Link>
          <Nav.Link
            href="/dashboard/approved"
            className="mb-2 d-flex align-items-center"
          >
            <FaCheckCircle className="me-3" />
            Approved Bills
          </Nav.Link>
          <Nav.Link
            href="/dashboard/rejected"
            className="mb-2 d-flex align-items-center"
          >
            <FaTimesCircle className="me-3" />
            Rejected Bills
          </Nav.Link>
        </Nav>
      </div>
    );
  }

  // HQ Admin & Super Admin Menu
  if (user?.role === "hq_admin" || user?.role === "super_admin") {
    return (
      <div
        className="sidebar bg-light border-end"
        style={{ width: "250px", minHeight: "calc(100vh - 56px)" }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link
            href="/dashboard"
            className="mb-2 d-flex align-items-center"
          >
            <FaTachometerAlt className="me-3" />
            Analytics Dashboard
          </Nav.Link>
          <Nav.Link
            href="/dashboard/all-bills"
            className="mb-2 d-flex align-items-center"
          >
            <FaListAlt className="me-3" />
            All Bills
          </Nav.Link>
          <Nav.Link
            href="/dashboard/users"
            className="mb-2 d-flex align-items-center"
          >
            <FaUsers className="me-3" />
            User Management
          </Nav.Link>
          <Nav.Link
            href="/dashboard/reports"
            className="mb-2 d-flex align-items-center"
          >
            <FaChartBar className="me-3" />
            Reports
          </Nav.Link>
          {user?.role === "super_admin" && (
            <Nav.Link
              href="/dashboard/settings"
              className="mb-2 d-flex align-items-center"
            >
              <FaCog className="me-3" />
              System Settings
            </Nav.Link>
          )}
        </Nav>
      </div>
    );
  }

  return null;
};

export default Sidebar;
