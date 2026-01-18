import React from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaUser, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.js";
import { ROLE_DISPLAY_NAMES } from "../../utils/constants";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container fluid>
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
          <FaTachometerAlt className="me-2" />
          <span>BVAS</span>
        </Navbar.Brand>

        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="dark"
                className="d-flex align-items-center"
              >
                <FaUser className="me-2" />
                <span>{user?.username}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText>
                  <small className="text-muted">
                    {ROLE_DISPLAY_NAMES[user?.role]}
                  </small>
                </Dropdown.ItemText>
                <Dropdown.ItemText>
                  <small className="text-muted">{user?.email}</small>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
