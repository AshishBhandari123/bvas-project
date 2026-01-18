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
  FaShieldAlt,
  FaCog,
  FaChartPie,
  FaDatabase,
  FaServer,
  FaUserCog,
  FaBell,
  FaKey,
} from "react-icons/fa";
import Header from "../../component/layout/Navbar";
import Sidebar from "../../component/layout/Sidebar";
import { authAPI, billAPI } from "../../services/api";
import { ROLE_DISPLAY_NAMES } from "../../utils/constants";

const SuperAdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalBills: 0,
    activeSessions: 0,
    storageUsed: "2.5 GB",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockSystemStats = {
    totalUsers: 15,
    totalBills: 48,
    activeSessions: 8,
    storageUsed: "2.5 GB",
  };

  const mockRecentActivity = [
    {
      id: 1,
      action: "User created",
      user: "hqadmin",
      timestamp: "2024-01-15T14:30:00Z",
    },
    {
      id: 2,
      action: "Bill approved",
      user: "verifier_dehradun",
      timestamp: "2024-01-15T13:45:00Z",
    },
    {
      id: 3,
      action: "System backup",
      user: "system",
      timestamp: "2024-01-15T12:00:00Z",
    },
    {
      id: 4,
      action: "Role updated",
      user: "superadmin",
      timestamp: "2024-01-15T11:15:00Z",
    },
    {
      id: 5,
      action: "Settings updated",
      user: "superadmin",
      timestamp: "2024-01-15T10:30:00Z",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system stats
        const usersResponse = await authAPI.getAllUsers();
        const billsResponse = await billAPI.getAllBills();

        setSystemStats({
          totalUsers: usersResponse.data.count || mockSystemStats.totalUsers,
          totalBills: billsResponse.data.count || mockSystemStats.totalBills,
          activeSessions: mockSystemStats.activeSessions,
          storageUsed: mockSystemStats.storageUsed,
        });

        setRecentActivity(mockRecentActivity);
      } catch (error) {
        // Use mock data for demo
        setSystemStats(mockSystemStats);
        setRecentActivity(mockRecentActivity);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <Container fluid className="p-4">
          <div className="d-flex align-items-center mb-4">
            <FaShieldAlt className="text-primary me-2" size={28} />
            <h2 className="mb-0">Super Administrator Dashboard</h2>
          </div>

          {/* System Overview */}
          <Row className="mb-4">
            <Col md={3} sm={6}>
              <Card className="text-center border-primary shadow-sm">
                <Card.Body>
                  <FaUserCog className="text-primary mb-2" size={24} />
                  <h5 className="text-muted">Total Users</h5>
                  <h2 className="text-primary">{systemStats.totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-info shadow-sm">
                <Card.Body>
                  <FaDatabase className="text-info mb-2" size={24} />
                  <h5 className="text-muted">Total Bills</h5>
                  <h2 className="text-info">{systemStats.totalBills}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-warning shadow-sm">
                <Card.Body>
                  <FaServer className="text-warning mb-2" size={24} />
                  <h5 className="text-muted">Active Sessions</h5>
                  <h2 className="text-warning">{systemStats.activeSessions}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center border-success shadow-sm">
                <Card.Body>
                  <FaChartPie className="text-success mb-2" size={24} />
                  <h5 className="text-muted">Storage Used</h5>
                  <h2 className="text-success">{systemStats.storageUsed}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* System Management */}
          <Row>
            <Col md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">System Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaBell className="me-2" />
                          Notification Settings
                        </Form.Label>
                        <Form.Check
                          type="switch"
                          label="Email Notifications"
                          defaultChecked
                        />
                        <Form.Check
                          type="switch"
                          label="SMS Alerts"
                          defaultChecked
                        />
                        <Form.Check type="switch" label="Push Notifications" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaKey className="me-2" />
                          Security Settings
                        </Form.Label>
                        <Form.Check type="switch" label="Require 2FA" />
                        <Form.Check
                          type="switch"
                          label="Session Timeout (30 min)"
                          defaultChecked
                        />
                        <Form.Check type="switch" label="IP Whitelisting" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaCog className="me-2" />
                      System Maintenance
                    </Form.Label>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
                        Clear Cache
                      </Button>
                      <Button variant="outline-warning" size="sm">
                        Run Backup
                      </Button>
                      <Button variant="outline-info" size="sm">
                        View Logs
                      </Button>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Recent System Activity</h5>
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
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Action</th>
                            <th>User</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.map((activity) => (
                            <tr key={activity.id}>
                              <td>
                                <strong>{activity.action}</strong>
                              </td>
                              <td>
                                <Badge bg="info">{activity.user}</Badge>
                              </td>
                              <td>{formatDate(activity.timestamp)}</td>
                              <td>
                                <Badge bg="success">Completed</Badge>
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

            {/* Quick Actions */}
            <Col md={4}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Button variant="primary" className="text-start">
                    <FaUserCog className="me-2" />
                    Manage All Users
                  </Button>
                  <Button variant="success" className="text-start">
                    <FaDatabase className="me-2" />
                    Database Administration
                  </Button>
                  <Button variant="warning" className="text-start">
                    <FaChartPie className="me-2" />
                    System Analytics
                  </Button>
                  <Button variant="info" className="text-start">
                    <FaServer className="me-2" />
                    Server Monitoring
                  </Button>
                  <Button variant="danger" className="text-start">
                    <FaShieldAlt className="me-2" />
                    Security Audit
                  </Button>
                </Card.Body>
              </Card>

              {/* System Status */}
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">System Status</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Database</span>
                      <Badge bg="success">Online</Badge>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: "95%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>API Server</span>
                      <Badge bg="success">Online</Badge>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: "98%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>File Storage</span>
                      <Badge bg="warning">65% Used</Badge>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Backup Status</span>
                      <Badge bg="success">Up to date</Badge>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
