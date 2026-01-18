import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaFileSignature,
  FaClipboardCheck,
  FaHistory,
} from "react-icons/fa";
import Header from "../../component/layout/Navbar";
import Sidebar from "../../component/layout/Sidebar";
import StatusBadge from "../../component/common/StatusBadge";
import { billAPI } from "../../services/api";

const DistrictDashboard = () => {
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPendingBills();
  }, []);

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      const response = await billAPI.getPendingBills();
      if (response.success) {
        setPendingBills(response.bills);
      }
    } catch (error) {
      console.error("Failed to fetch pending bills:", error);
      setError("Failed to load pending bills");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBill) return;

    try {
      const response = await billAPI.approveBill(selectedBill._id, remarks);
      if (response.success) {
        setSuccess("Bill approved successfully!");
        setShowApproveModal(false);
        setRemarks("");
        setSelectedBill(null);
        fetchPendingBills();
      }
    } catch (error) {
      setError(error.message || "Failed to approve bill");
    }
  };

  const handleReject = async () => {
    if (!selectedBill || !remarks.trim()) {
      setError("Please provide remarks for rejection");
      return;
    }

    try {
      const response = await billAPI.rejectBill(selectedBill._id, remarks);
      if (response.success) {
        setSuccess("Bill rejected successfully!");
        setShowRejectModal(false);
        setRemarks("");
        setSelectedBill(null);
        fetchPendingBills();
      }
    } catch (error) {
      setError(error.message || "Failed to reject bill");
    }
  };

  const viewBillDetails = async (billId) => {
    try {
      const response = await billAPI.getBillById(billId);
      if (response.success) {
        setSelectedBill(response.bill);
        setShowViewModal(true);
      }
    } catch (error) {
      setError("Failed to load bill details");
    }
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

  const stats = {
    pending: pendingBills.length,
    approvedToday: 0, // Would need to fetch from API
    totalReviewed: 0,
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <Container fluid className="p-4">
          <h2 className="mb-4">District Verifier Dashboard</h2>

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
            <Col md={4}>
              <Card className="text-center border-warning shadow-sm">
                <Card.Body>
                  <FaClipboardCheck className="text-warning mb-2" size={24} />
                  <h5 className="text-muted">Pending Bills</h5>
                  <h2 className="text-warning">{stats.pending}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-success shadow-sm">
                <Card.Body>
                  <FaCheck className="text-success mb-2" size={24} />
                  <h5 className="text-muted">Approved Today</h5>
                  <h2 className="text-success">{stats.approvedToday}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-info shadow-sm">
                <Card.Body>
                  <FaHistory className="text-info mb-2" size={24} />
                  <h5 className="text-muted">Total Reviewed</h5>
                  <h2 className="text-info">{stats.totalReviewed}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Pending Bills Table */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Bills for Verification</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={fetchPendingBills}
              >
                <FaFilter className="me-2" />
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
              ) : pendingBills.length === 0 ? (
                <div className="text-center p-5">
                  <h5 className="text-muted">No pending bills</h5>
                  <p className="text-muted">All bills have been processed</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Bill #</th>
                        <th>Vendor</th>
                        <th>Month/Year</th>
                        <th>Amount</th>
                        <th>Submitted On</th>
                        <th>Districts</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBills.map((bill) => (
                        <tr key={bill._id}>
                          <td>
                            <strong>{bill.billNumber}</strong>
                          </td>
                          <td>
                            <div>
                              <strong>{bill.vendorId?.username}</strong>
                              <div className="small text-muted">
                                {bill.vendorId?.email}
                              </div>
                            </div>
                          </td>
                          <td>
                            {bill.month} {bill.year}
                          </td>
                          <td>{formatCurrency(bill.totalAmount)}</td>
                          <td>{formatDate(bill.submittedAt)}</td>
                          <td>
                            {bill.districtData?.map((district, idx) => (
                              <Badge key={idx} bg="info" className="me-1">
                                {district.district}
                              </Badge>
                            ))}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowApproveModal(true);
                                }}
                              >
                                <FaCheck className="me-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowRejectModal(true);
                                }}
                              >
                                <FaTimes className="me-1" />
                                Reject
                              </Button>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => viewBillDetails(bill._id)}
                              >
                                <FaEye />
                              </Button>
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
                      <strong>Vendor:</strong>
                      <p>
                        {selectedBill.vendorId?.username} (
                        {selectedBill.vendorId?.email})
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

                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Status:</strong>
                      <p>
                        <StatusBadge status={selectedBill.status} />
                      </p>
                    </Col>
                    <Col md={6}>
                      <strong>Submitted On:</strong>
                      <p>{formatDate(selectedBill.submittedAt)}</p>
                    </Col>
                  </Row>

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
                      <h6 className="mt-4">Supporting Documents:</h6>
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

          {/* Approve Modal */}
          <Modal
            show={showApproveModal}
            onHide={() => setShowApproveModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <FaCheck className="me-2 text-success" />
                Approve Bill
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to approve bill{" "}
                <strong>{selectedBill?.billNumber}</strong>? This action will
                apply a digital signature.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </Form.Group>
              <div className="alert alert-info">
                <FaFileSignature className="me-2" />
                <strong>Digital Signature Note:</strong> This will apply a mock
                digital signature for demo purposes.
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setRemarks("");
                }}
              >
                Cancel
              </Button>
              <Button variant="success" onClick={handleApprove}>
                <FaCheck className="me-2" />
                Approve with Digital Signature
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Reject Modal */}
          <Modal
            show={showRejectModal}
            onHide={() => setShowRejectModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <FaTimes className="me-2 text-danger" />
                Reject Bill
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                You are about to reject bill{" "}
                <strong>{selectedBill?.billNumber}</strong>.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Remarks (Required)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Provide reason for rejection..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
                <Form.Text className="text-danger">
                  Remarks are mandatory for bill rejection
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRemarks("");
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                <FaTimes className="me-2" />
                Reject Bill
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default DistrictDashboard;
