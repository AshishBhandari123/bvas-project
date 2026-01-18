import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  Pagination,
} from "react-bootstrap";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaFileInvoice,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import Header from "../../component/layout/Navbar";
import Sidebar from "../../component/layout/Sidebar";
import StatusBadge from "../../component/common/StatusBadge";
import { billAPI } from "../../services/api";
import { MONTHS, DISTRICTS } from "../../utils/constants";

const VendorDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    month: "January",
    year: new Date().getFullYear(),
    totalAmount: "",
    districtData: DISTRICTS.map((district) => ({
      district,
      quantity: "",
      amount: "",
    })),
    documents: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billAPI.getVendorBills();
      if (response.success) {
        setBills(response.bills);
      }
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Filter out empty district data
      const filteredDistrictData = formData.districtData.filter(
        (d) => d.quantity !== "" && d.amount !== "",
      );

      const billData = {
        month: formData.month,
        year: formData.year,
        totalAmount: formData.totalAmount,
        districtData: filteredDistrictData,
        documents: formData.documents,
      };

      const response = await billAPI.createBill(billData);
      if (response.success) {
        setSuccess("Bill created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchBills();
      }
    } catch (error) {
      setError(error.message || "Failed to create bill");
    }
  };

  const handleSubmitBill = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to submit this bill for verification?",
      )
    ) {
      try {
        const response = await billAPI.submitBill(id);
        if (response.success) {
          setSuccess("Bill submitted for verification!");
          fetchBills();
        }
      } catch (error) {
        setError(error.message || "Failed to submit bill");
      }
    }
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        const response = await billAPI.deleteBill(id);
        if (response.success) {
          setSuccess("Bill deleted successfully!");
          fetchBills();
        }
      } catch (error) {
        setError(error.message || "Failed to delete bill");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      month: "January",
      year: new Date().getFullYear(),
      totalAmount: "",
      districtData: DISTRICTS.map((district) => ({
        district,
        quantity: "",
        amount: "",
      })),
      documents: [],
    });
  };

  const stats = {
    total: bills.length,
    draft: bills.filter((b) => b.status === "draft").length,
    submitted: bills.filter((b) => b.status === "submitted").length,
    pending: bills.filter((b) => b.status === "pending").length,
    approved: bills.filter((b) => b.status === "approved").length,
    rejected: bills.filter((b) => b.status === "rejected").length,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleDistrictChange = (index, field, value) => {
    const newDistrictData = [...formData.districtData];
    newDistrictData[index][field] = value;
    setFormData({ ...formData, districtData: newDistrictData });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: Array.from(e.target.files) });
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <Container fluid className="p-4">
          <h2 className="mb-4">Vendor Dashboard</h2>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <Row className="mb-4">
            {Object.entries(stats).map(([key, value]) => (
              <Col md={2} sm={4} xs={6} key={key}>
                <Card className="text-center shadow-sm h-100">
                  <Card.Body className="p-3">
                    <h6 className="text-muted text-uppercase small">{key}</h6>
                    <h3 className="mb-0">{value}</h3>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Action Bar */}
          <Card className="mb-4 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Bill Management</h5>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="me-2" />
                Create New Bill
              </Button>
            </Card.Body>
          </Card>

          {/* Bills Table */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Bills</h5>
              <Button variant="outline-primary" size="sm" onClick={fetchBills}>
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center p-5">
                  <h5 className="text-muted">No bills found</h5>
                  <p className="text-muted">
                    Create your first bill to get started
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Bill #</th>
                        <th>Month/Year</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill._id}>
                          <td>
                            <strong>{bill.billNumber}</strong>
                            {bill.documents?.length > 0 && (
                              <Badge bg="info" className="ms-2">
                                <FaFilePdf className="me-1" />
                                {bill.documents.length}
                              </Badge>
                            )}
                          </td>
                          <td>
                            {bill.month} {bill.year}
                          </td>
                          <td>{formatCurrency(bill.totalAmount)}</td>
                          <td>
                            <StatusBadge status={bill.status} />
                            {bill.remarks && (
                              <small className="d-block text-muted">
                                {bill.remarks}
                              </small>
                            )}
                          </td>
                          <td>
                            {bill.submittedAt
                              ? formatDate(bill.submittedAt)
                              : "-"}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowViewModal(true);
                                }}
                              >
                                <FaEye />
                              </Button>
                              {bill.status === "draft" && (
                                <>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleSubmitBill(bill._id)}
                                  >
                                    <FaPaperPlane />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteBill(bill._id)}
                                  >
                                    <FaTrash />
                                  </Button>
                                </>
                              )}
                              {bill.status === "rejected" && (
                                <Button variant="outline-warning" size="sm">
                                  <FaEdit />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Create Bill Modal */}
          <Modal
            show={showCreateModal}
            onHide={() => setShowCreateModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Create New Bill</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateBill}>
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Month</Form.Label>
                      <Form.Select
                        value={formData.month}
                        onChange={(e) =>
                          setFormData({ ...formData, month: e.target.value })
                        }
                        required
                      >
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        min="2023"
                        max="2025"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Total Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="Enter total amount"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Supporting Documents (PDF/Excel)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.xlsx,.xls"
                  />
                  <Form.Text className="text-muted">
                    Upload supporting documents (max 5 files, 15MB each)
                  </Form.Text>
                </Form.Group>

                <h5 className="mt-4 mb-3">District-wise Distribution</h5>
                <Row>
                  {formData.districtData.map((district, index) => (
                    <Col md={4} key={district.district} className="mb-3">
                      <Card>
                        <Card.Body>
                          <h6 className="card-title">{district.district}</h6>
                          <Form.Group className="mb-2">
                            <Form.Label className="small">Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={district.quantity}
                              onChange={(e) =>
                                handleDistrictChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              placeholder="Quantity"
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="small">
                              Amount (₹)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              value={district.amount}
                              onChange={(e) =>
                                handleDistrictChange(
                                  index,
                                  "amount",
                                  e.target.value,
                                )
                              }
                              placeholder="Amount"
                            />
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Bill
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* View Bill Modal */}
          <Modal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Bill Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedBill && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Bill Number:</strong>
                      <p>{selectedBill.billNumber}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Status:</strong>
                      <p>
                        <StatusBadge status={selectedBill.status} />
                      </p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Month/Year:</strong>
                      <p>
                        {selectedBill.month} {selectedBill.year}
                      </p>
                    </Col>
                    <Col md={6}>
                      <strong>Total Amount:</strong>
                      <p>{formatCurrency(selectedBill.totalAmount)}</p>
                    </Col>
                  </Row>

                  {selectedBill.remarks && (
                    <div className="mb-3">
                      <strong>Remarks:</strong>
                      <p className="text-danger">{selectedBill.remarks}</p>
                    </div>
                  )}

                  {selectedBill.signature && (
                    <div className="mb-3">
                      <strong>Digital Signature:</strong>
                      <p>
                        Signed by {selectedBill.signature.signedBy} on{" "}
                        {formatDate(selectedBill.signature.signedAt)}
                      </p>
                    </div>
                  )}

                  <h6 className="mt-4">District-wise Distribution:</h6>
                  <Table striped size="sm">
                    <thead>
                      <tr>
                        <th>District</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.districtData?.map((district, idx) => (
                        <tr key={idx}>
                          <td>{district.district}</td>
                          <td>{district.quantity}</td>
                          <td>{formatCurrency(district.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {selectedBill.documents?.length > 0 && (
                    <>
                      <h6 className="mt-4">Documents:</h6>
                      <ul>
                        {selectedBill.documents.map((doc, idx) => (
                          <li key={idx}>
                            <a
                              href={`https://bvas-project.onrender.com/uploads/${doc.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {doc.originalname}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default VendorDashboard;
