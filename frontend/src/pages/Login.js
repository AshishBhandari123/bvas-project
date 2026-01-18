import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FaUser, FaLock, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.js";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "vendor",
    district: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await login(loginData.username, loginData.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const userData = {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      role: registerData.role,
      district:
        registerData.role === "district_verifier"
          ? registerData.district
          : undefined,
    };

    const result = await register(userData);
    if (result.success) {
      setSuccess("Registration successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-primary">BVAS</h2>
                <p className="text-muted">
                  Bill Verification and Approval System
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="login" title="Login">
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2" />
                        Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                      <FaSignInAlt className="me-2" />
                      Login
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="register" title="Register">
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Choose username"
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirm password"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        value={registerData.role}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="vendor">Vendor</option>
                        <option value="district_verifier">
                          District Verifier
                        </option>
                      </Form.Select>
                    </Form.Group>

                    {registerData.role === "district_verifier" && (
                      <Form.Group className="mb-3">
                        <Form.Label>District</Form.Label>
                        <Form.Select
                          value={registerData.district}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              district: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select District</option>
                          <option value="Dehradun">Dehradun</option>
                          <option value="Hardwar">Hardwar</option>
                          <option value="Nainital">Nainital</option>
                          <option value="Udham Singh Nagar">
                            Udham Singh Nagar
                          </option>
                          <option value="Pauri Garhwal">Pauri Garhwal</option>
                          <option value="Tehri Garhwal">Tehri Garhwal</option>
                          <option value="Chamoli">Chamoli</option>
                          <option value="Almora">Almora</option>
                          <option value="Bageshwar">Bageshwar</option>
                          <option value="Champawat">Champawat</option>
                          <option value="Pithoragarh">Pithoragarh</option>
                          <option value="Rudraprayag">Rudraprayag</option>
                          <option value="Uttarkashi">Uttarkashi</option>
                        </Form.Select>
                      </Form.Group>
                    )}

                    <Button variant="success" type="submit" className="w-100">
                      <FaUserPlus className="me-2" />
                      Register
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center mt-3">
                <p className="text-muted mb-2">
                  <strong>Demo Credentials:</strong>
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <span className="badge bg-secondary">
                    superadmin / Admin@123
                  </span>
                  <span className="badge bg-secondary">
                    hqadmin / Admin@123
                  </span>
                  <span className="badge bg-secondary">
                    verifier_dehradun / Admin@123
                  </span>
                  <span className="badge bg-secondary">
                    vendor1 / Admin@123
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
