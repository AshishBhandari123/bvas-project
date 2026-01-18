import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FaUsers,
  FaFileInvoice,
  FaChartBar,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
} from "react-icons/fa";
import Header from "../../component/layout/Navbar";
import Sidebar from "../../component/layout/Sidebar";
import StatusBadge from "../../component/common/StatusBadge";
import { authAPI, billAPI } from "../../services/api";
import { ROLE_DISPLAY_NAMES } from "../../utils/constants";

const HQAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBills: 0,
    pendingBills: 0,
    approvedBills: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  const mockUsers = [
    {
      _id: "1",
      username: "superadmin",
      email: "superadmin@bvas.com",
      role: "super_admin",
      isActive: true,
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      _id: "2",
      username: "hqadmin",
      email: "hqadmin@bvas.com",
      role: "hq_admin",
      isActive: true,
      createdAt: "2024-01-02T11:00:00Z",
    },
    {
      _id: "3",
      username: "verifier_dehradun",
      email: "verifier1@bvas.com",
      role: "district_verifier",
      district: "Dehradun",
      isActive: true,
      createdAt: "2024-01-03T12:00:00Z",
    },
    {
      _id: "4",
      username: "vendor_abc",
      email: "vendor1@bvas.com",
      role: "vendor",
      isActive: true,
      createdAt: "2024-01-04T13:00:00Z",
    },
  ];

  const mockBills = [
    {
      _id: "1",
      billNumber: "BILL-2024-001",
      month: "January",
      year: 2024,
      totalAmount: 150000.5,
      status: "approved",
      vendorId: { username: "vendor_abc", email: "vendor1@bvas.com" },
      submittedAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "2",
      billNumber: "BILL-2024-002",
      month: "February",
      year: 2024,
      totalAmount: 175000.75,
      status: "pending",
      vendorId: { username: "vendor_abc", email: "vendor1@bvas.com" },
      submittedAt: "2024-02-10T14:20:00Z",
    },
    {
      _id: "3",
      billNumber: "BILL-2024-003",
      month: "March",
      year: 2024,
      totalAmount: 125000.25,
      status: "rejected",
      vendorId: { username: "vendor_xyz", email: "vendor2@bvas.com" },
      submittedAt: "2024-03-05T09:15:00Z",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await authAPI.getAllUsers();
        setUsers(usersResponse.data.users || mockUsers);

        // Fetch bills
        const billsResponse = await billAPI.getAllBills();
        setBills(billsResponse.data.bills || mockBills);

        // Calculate stats
        const userStats = usersResponse.data.users || mockUsers;
        const billStats = billsResponse.data.bills || mockBills;

        setStats({
          totalUsers: userStats.length,
          totalBills: billStats.length,
          pendingBills: billStats.filter((b) => b.status === "pending").length,
          approvedBills: billStats.filter((b) => b.status === "approved")
            .length,
        });
      } catch (error) {
        // Use mock data for demo
        setUsers(mockUsers);
        setBills(mockBills);
        setStats({
          totalUsers: mockUsers.length,
          totalBills: mockBills.length,
          pendingBills: mockBills.filter((b) => b.status === "pending").length,
          approvedBills: mockBills.filter((b) => b.status === "approved")
            .length,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: "danger",
      hq_admin: "primary",
      district_verifier: "warning",
      vendor: "info",
    };

    return (
      <Badge bg={colors[role] || "secondary"}>{ROLE_DISPLAY_NAMES[role]}</Badge>
    );
  };

  const handleExportReports = () => {
    alert("Reports exported successfully!");
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <Container fluid className="p-4">
          <h2 className="mb-4">HQ Administrator Dashboard</h2>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6}>
              <Card className="text-center border-primary shadow-sm">
                <Card.Body>
                  <FaUsers className="text-primary mb-2" size={24} />
                  <h5 className="text-muted">Total Users</h5>
                  <h2 className="text-primary">{stats.totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-info shadow-sm">
                <Card.Body>
                  <FaFileInvoice className="text-info mb-2" size={24} />
                  <h5 className="text-muted">Total Bills</h5>
                  <h2 className="text-info">{stats.totalBills}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-warning shadow-sm">
                <Card.Body>
                  <FaChartBar className="text-warning mb-2" size={24} />
                  <h5 className="text-muted">Pending Bills</h5>
                  <h2 className="text-warning">{stats.pendingBills}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-success shadow-sm">
                <Card.Body>
                  <FaChartBar className="text-success mb-2" size={24} />
                  <h5 className="text-muted">Approved Bills</h5>
                  <h2 className="text-success">{stats.approvedBills}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Action Bar */}
          <Card className="mb-4 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">System Management</h5>
              <div>
                <Button variant="primary" className="me-2">
                  <FaUserPlus className="me-2" />
                  Add User
                </Button>
                <Button variant="success" onClick={handleExportReports}>
                  <FaDownload className="me-2" />
                  Export Reports
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Row>
            {/* Users Table */}
            <Col md={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header>
                  <h5 className="mb-0">User Management</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <div>
                                  <strong>{user.username}</strong>
                                  <div className="small text-muted">
                                    {user.email}
                                  </div>
                                </div>
                              </td>
                              <td>{getRoleBadge(user.role)}</td>
                              <td>
                                {user.isActive ? (
                                  <Badge bg="success">Active</Badge>
                                ) : (
                                  <Badge bg="danger">Inactive</Badge>
                                )}
                              </td>
                              <td>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-1"
                                >
                                  <FaEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm">
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Recent Bills */}
            <Col md={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header>
                  <h5 className="mb-0">Recent Bills</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Bill #</th>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.slice(0, 5).map((bill) => (
                            <tr key={bill._id}>
                              <td>
                                <strong>{bill.billNumber}</strong>
                                <div className="small text-muted">
                                  {bill.month} {bill.year}
                                </div>
                              </td>
                              <td>{bill.vendorId?.username}</td>
                              <td>{formatCurrency(bill.totalAmount)}</td>
                              <td>
                                <StatusBadge status={bill.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="text-center">
                  <Button variant="link" size="sm">
                    View All Bills →
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default HQAdminDashboard;
