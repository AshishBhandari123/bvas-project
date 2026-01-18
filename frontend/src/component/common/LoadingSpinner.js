import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <Spinner animation="border" variant="primary" size={size} />
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
