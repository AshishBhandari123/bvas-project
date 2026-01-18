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
  Tabs,
  Tab,
  ProgressBar,
} from "react-bootstrap";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaFileSignature,
  FaClipboardCheck,
  FaHistory,
  FaChartBar,
  FaFileAlt,
  FaDownload,
  FaUserCheck,
  FaSignature,
} from "react-icons/fa";
import Header from "../../component/layout/Navbar";
import Sidebar from "../../component/layout/Sidebar";
import StatusBadge from "../../component/common/StatusBadge";
import { billAPI } from "../../services/api";

const DistrictDashboardEnhanced = () => {
  const [pendingBills, setPendingBills] = useState([]);
  const [approvedBills, setApprovedBills] = useState([]);
  const [rejectedBills, setRejectedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [signatureData, setSignatureData] = useState({
    password: "",
    otp: "123456", // Mock OTP for demo
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState({
    pending: true,
    approved: true,
    rejected: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingBills(),
      fetchApprovedBills(),
      fetchRejectedBills(),
    ]);
  };

  const fetchPendingBills = async () => {
    try {
      setLoading((prev) => ({ ...prev, pending: true }));
      const response = await billAPI.getPendingBills();
      if (response.success) {
        setPendingBills(response.bills);
      }
    } catch (error) {
      console.error("Failed to fetch pending bills:", error);
      setError("Failed to load pending bills");
    } finally {
      setLoading((prev) => ({ ...prev, pending: false }));
    }
  };

  const fetchApprovedBills = async () => {
    try {
      setLoading((prev) => ({ ...prev, approved: true }));
      const response = await billAPI.getApprovedBills({
        status: "approved",
        district: user.district,
      });
      if (response.success) {
        setApprovedBills(response.bills);
      }
    } catch (error) {
      console.error("Failed to fetch approved bills:", error);
    } finally {
      setLoading((prev) => ({ ...prev, approved: false }));
    }
  };

  const fetchRejectedBills = async () => {
    try {
      setLoading((prev) => ({ ...prev, rejected: true }));
      const response = await billAPI.getRejectedBills({
        status: "rejected",
        district: user.district,
      });
      if (response.success) {
        setRejectedBills(response.bills);
      }
    } catch (error) {
      console.error("Failed to fetch rejected bills:", error);
    } finally {
      setLoading((prev) => ({ ...prev, rejected: false }));
    }
  };

  const handleApprove = async () => {
    if (!selectedBill) return;

    try {
      const response = await billAPI.approveBill(selectedBill._id, remarks);
      if (response.success) {
        setSuccess("Bill approved successfully with digital signature!");
        setShowApproveModal(false);
        setShowSignatureModal(false);
        setRemarks("");
        setSignatureData({ password: "", otp: "123456" });
        setSelectedBill(null);
        fetchAllData();
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
        fetchAllData();
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

  const handleDigitalSignature = () => {
    // Mock digital signature process
    setShowApproveModal(false);
    setShowSignatureModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStats = () => {
    return {
      pending: pendingBills.length,
      approved: approvedBills.length,
      rejected: rejectedBills.length,
      total: pendingBills.length + approvedBills.length + rejectedBills.length,
    };
  };

  const stats = getStats();

  const renderBillTable = (bills, type) => {
    const isLoading = loading[type];

    if (isLoading) {
      return (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (bills.length === 0) {
      return (
        <div className="text-center p-5">
          <h5 className="text-muted">No {type} bills found</h5>
          <p className="text-muted">
            {type === "pending"
              ? "All bills have been processed"
              : `No ${type} bills in your district`}
          </p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Vendor</th>
              <th>Month/Year</th>
              <th>Amount</th>
              <th>
                {type === "pending"
                  ? "Submitted On"
                  : type === "approved"
                    ? "Approved On"
                    : "Rejected On"}
              </th>
              <th>Districts</th>
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
                      <FaFileAlt className="me-1" />
                      {bill.documents.length}
                    </Badge>
                  )}
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
                <td>
                  {type === "pending" && formatDate(bill.submittedAt)}
                  {type === "approved" && formatDate(bill.approvedAt)}
                  {type === "rejected" && formatDate(bill.rejectedAt)}
                </td>
                <td>
                  {bill.districtData?.map((district, idx) => (
                    <Badge key={idx} bg="info" className="me-1 mb-1">
                      {district.district}
                    </Badge>
                  ))}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => viewBillDetails(bill._id)}
                    >
                      <FaEye />
                    </Button>

                    {type === "pending" && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowApproveModal(true);
                          }}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowRejectModal(true);
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </>
                    )}

                    {type === "approved" && bill.signature && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowViewModal(true);
                        }}
                      >
                        <FaSignature />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <Sidebar />
        <Container fluid className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-0">District Verifier Dashboard</h2>
              <p className="text-muted mb-0">
                Assigned District:{" "}
                <Badge bg="primary">{user.district || "Not assigned"}</Badge>
              </p>
            </div>
            <Button variant="outline-primary" onClick={fetchAllData}>
              <FaFilter className="me-2" />
              Refresh Data
            </Button>
          </div>

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
            <Col md={3}>
              <Card className="text-center border-primary shadow-sm">
                <Card.Body>
                  <FaClipboardCheck className="text-primary mb-2" size={24} />
                  <h5 className="text-muted">Total Bills</h5>
                  <h2 className="text-primary">{stats.total}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-warning shadow-sm">
                <Card.Body>
                  <FaHistory className="text-warning mb-2" size={24} />
                  <h5 className="text-muted">Pending</h5>
                  <h2 className="text-warning">{stats.pending}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-success shadow-sm">
                <Card.Body>
                  <FaCheck className="text-success mb-2" size={24} />
                  <h5 className="text-muted">Approved</h5>
                  <h2 className="text-success">{stats.approved}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-danger shadow-sm">
                <Card.Body>
                  <FaTimes className="text-danger mb-2" size={24} />
                  <h5 className="text-muted">Rejected</h5>
                  <h2 className="text-danger">{stats.rejected}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Progress Bar */}
          {stats.total > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Verification Progress</h6>
                <ProgressBar className="mb-2">
                  <ProgressBar
                    variant="success"
                    now={(stats.approved / stats.total) * 100}
                    label={`${stats.approved} Approved`}
                  />
                  <ProgressBar
                    variant="danger"
                    now={(stats.rejected / stats.total) * 100}
                    label={`${stats.rejected} Rejected`}
                  />
                  <ProgressBar
                    variant="warning"
                    now={(stats.pending / stats.total) * 100}
                    label={`${stats.pending} Pending`}
                  />
                </ProgressBar>
                <div className="d-flex justify-content-between small text-muted">
                  <span>
                    Completion Rate:{" "}
                    {(
                      ((stats.approved + stats.rejected) / stats.total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span>
                    Pending Rate:{" "}
                    {((stats.pending / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Bills Tabs */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0"
              >
                <Tab
                  eventKey="pending"
                  title={
                    <>
                      <FaClipboardCheck className="me-2" />
                      Pending Bills ({stats.pending})
                    </>
                  }
                />
                <Tab
                  eventKey="approved"
                  title={
                    <>
                      <FaCheck className="me-2" />
                      Approved Bills ({stats.approved})
                    </>
                  }
                />
                <Tab
                  eventKey="rejected"
                  title={
                    <>
                      <FaTimes className="me-2" />
                      Rejected Bills ({stats.rejected})
                    </>
                  }
                />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {activeTab === "pending" &&
                renderBillTable(pendingBills, "pending")}
              {activeTab === "approved" &&
                renderBillTable(approvedBills, "approved")}
              {activeTab === "rejected" &&
                renderBillTable(rejectedBills, "rejected")}
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
                      <p className="fs-5">{selectedBill.billNumber}</p>
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
                      <strong>Vendor:</strong>
                      <p>
                        {selectedBill.vendorId?.username}
                        <br />
                        <small className="text-muted">
                          {selectedBill.vendorId?.email}
                        </small>
                      </p>
                    </Col>
                    <Col md={6}>
                      <strong>Month/Year:</strong>
                      <p>
                        {selectedBill.month} {selectedBill.year}
                      </p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Total Amount:</strong>
                      <p className="fs-4">
                        {formatCurrency(selectedBill.totalAmount)}
                      </p>
                    </Col>
                    <Col md={6}>
                      <strong>Submitted On:</strong>
                      <p>{formatDate(selectedBill.submittedAt)}</p>
                    </Col>
                  </Row>

                  {selectedBill.remarks && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <strong>Remarks:</strong>
                      <p className="mb-0">{selectedBill.remarks}</p>
                    </div>
                  )}

                  {selectedBill.signature && (
                    <div className="mb-3 p-3 bg-success bg-opacity-10 rounded border border-success">
                      <div className="d-flex align-items-center mb-2">
                        <FaSignature className="text-success me-2" />
                        <strong>Digital Signature Applied</strong>
                      </div>
                      <Row>
                        <Col md={6}>
                          <small className="text-muted">Signed By:</small>
                          <p className="mb-1">
                            {selectedBill.signature.signedBy}
                          </p>
                        </Col>
                        <Col md={6}>
                          <small className="text-muted">Signed At:</small>
                          <p className="mb-1">
                            {formatDate(selectedBill.signature.signedAt)}
                          </p>
                        </Col>
                      </Row>
                      <div className="mt-2">
                        <small className="text-muted">Signature Hash:</small>
                        <p className="mb-0 font-monospace small">
                          {selectedBill.signature.signatureData}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedBill.approvedBy && (
                    <div className="mb-3 p-3 bg-info bg-opacity-10 rounded">
                      <strong>Approved By:</strong>
                      <p className="mb-0">
                        {selectedBill.approvedBy?.username}
                      </p>
                    </div>
                  )}

                  <h6 className="mt-4 mb-3">District-wise Distribution:</h6>
                  <Table striped bordered hover size="sm">
                    <thead className="table-dark">
                      <tr>
                        <th>District</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.districtData?.map((district, idx) => (
                        <tr key={idx}>
                          <td>
                            {district.district === user.district ? (
                              <Badge bg="primary">
                                {district.district} (Your District)
                              </Badge>
                            ) : (
                              district.district
                            )}
                          </td>
                          <td>{district.quantity}</td>
                          <td>{formatCurrency(district.amount)}</td>
                          <td>
                            {selectedBill.totalAmount > 0
                              ? (
                                  (district.amount / selectedBill.totalAmount) *
                                  100
                                ).toFixed(1) + "%"
                              : "0%"}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-secondary fw-bold">
                        <td>Total</td>
                        <td>
                          {selectedBill.districtData?.reduce(
                            (sum, d) => sum + (parseInt(d.quantity) || 0),
                            0,
                          )}
                        </td>
                        <td>{formatCurrency(selectedBill.totalAmount)}</td>
                        <td>100%</td>
                      </tr>
                    </tbody>
                  </Table>

                  {selectedBill.documents?.length > 0 && (
                    <>
                      <h6 className="mt-4 mb-3">Supporting Documents:</h6>
                      <Row>
                        {selectedBill.documents.map((doc, idx) => (
                          <Col md={6} key={idx} className="mb-2">
                            <Card>
                              <Card.Body className="py-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <FaFileAlt className="me-2" />
                                    <span>{doc.originalname}</span>
                                  </div>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    href={`http://localhost:5000/uploads/${doc.filename}`}
                                    target="_blank"
                                  >
                                    <FaDownload />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}

                  {selectedBill.auditLogs &&
                    selectedBill.auditLogs.length > 0 && (
                      <>
                        <h6 className="mt-4 mb-3">Audit Trail:</h6>
                        <div className="timeline">
                          {selectedBill.auditLogs
                            .sort(
                              (a, b) =>
                                new Date(b.performedAt) -
                                new Date(a.performedAt),
                            )
                            .map((log, idx) => (
                              <div
                                key={idx}
                                className="mb-3 ps-3 border-start border-primary"
                              >
                                <div className="d-flex justify-content-between">
                                  <strong>{log.action}</strong>
                                  <small className="text-muted">
                                    {formatDate(log.performedAt)}
                                  </small>
                                </div>
                                <p className="mb-1 small">{log.details}</p>
                              </div>
                            ))}
                        </div>
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
            onHide={() => {
              setShowApproveModal(false);
              setRemarks("");
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="text-success">
                <FaCheck className="me-2" />
                Approve Bill
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="alert alert-success mb-3">
                <FaFileSignature className="me-2" />
                <strong>Digital Signature Required:</strong> This action will
                apply a legally valid digital signature.
              </div>

              <p className="mb-3">
                You are about to approve bill{" "}
                <strong>{selectedBill?.billNumber}</strong> from vendor{" "}
                <strong>{selectedBill?.vendorId?.username}</strong>.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Add Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any comments or remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </Form.Group>

              <div className="p-3 bg-light rounded">
                <h6>Bill Summary:</h6>
                <ul className="mb-0">
                  <li>
                    Total Amount: {formatCurrency(selectedBill?.totalAmount)}
                  </li>
                  <li>
                    Month: {selectedBill?.month} {selectedBill?.year}
                  </li>
                  <li>
                    Districts:{" "}
                    {selectedBill?.districtData
                      ?.map((d) => d.district)
                      .join(", ")}
                  </li>
                </ul>
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
              <Button variant="success" onClick={handleDigitalSignature}>
                <FaSignature className="me-2" />
                Proceed to Digital Signature
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Digital Signature Modal */}
          <Modal
            show={showSignatureModal}
            onHide={() => {
              setShowSignatureModal(false);
              setSignatureData({ password: "", otp: "123456" });
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="text-primary">
                <FaSignature className="me-2" />
                Apply Digital Signature
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                  <FaUserCheck size={32} />
                </div>
                <h5>Digital Signature Authentication</h5>
                <p className="text-muted">
                  For demo purposes, use password "Admin@123" and OTP "123456"
                </p>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={signatureData.password}
                    onChange={(e) =>
                      setSignatureData({
                        ...signatureData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>OTP Verification *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    value={signatureData.otp}
                    onChange={(e) =>
                      setSignatureData({
                        ...signatureData,
                        otp: e.target.value,
                      })
                    }
                    required
                  />
                  <Form.Text className="text-muted">
                    Demo OTP: 123456 (simulated SMS/Email)
                  </Form.Text>
                </Form.Group>

                <div className="alert alert-info">
                  <h6>Signature Details:</h6>
                  <ul className="mb-0">
                    <li>Certificate: Class 3 Digital Signature</li>
                    <li>Standard: PAdES B-LT Level</li>
                    <li>Validity: 2 years</li>
                    <li>Issued By: Government of India CCA</li>
                  </ul>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSignatureModal(false);
                  setSignatureData({ password: "", otp: "123456" });
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApprove}>
                <FaSignature className="me-2" />
                Apply Digital Signature
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Reject Modal */}
          <Modal
            show={showRejectModal}
            onHide={() => {
              setShowRejectModal(false);
              setRemarks("");
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="text-danger">
                <FaTimes className="me-2" />
                Reject Bill
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="alert alert-danger mb-3">
                <strong>Important:</strong> Rejection requires detailed remarks
                for transparency.
              </div>

              <p className="mb-3">
                You are rejecting bill{" "}
                <strong>{selectedBill?.billNumber}</strong> from vendor{" "}
                <strong>{selectedBill?.vendorId?.username}</strong>.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Rejection Reason *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Provide detailed reason for rejection..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
                <Form.Text className="text-danger">
                  Detailed remarks are mandatory for audit trail
                </Form.Text>
              </Form.Group>

              <div className="p-3 bg-light rounded">
                <h6>Common Rejection Reasons:</h6>
                <ul className="mb-0">
                  <li>Quantity mismatch with ePOS data</li>
                  <li>Incorrect amount calculations</li>
                  <li>Missing supporting documents</li>
                  <li>Data entry errors</li>
                  <li>Policy violations</li>
                </ul>
              </div>
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
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!remarks.trim()}
              >
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

export default DistrictDashboardEnhanced;
