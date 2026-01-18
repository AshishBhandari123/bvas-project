import React from "react";
import { Badge } from "react-bootstrap";
import { BILL_STATUS_COLORS } from "../../utils/constants";

const StatusBadge = ({ status }) => {
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge bg={BILL_STATUS_COLORS[status] || "secondary"}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
