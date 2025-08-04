import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Reminder Sys</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {currentUser ? (
              <>
                {currentUser.role === 'admin' ? (
                  <>
                    <Nav.Link as={Link} to="/admin/dashboard">Admin Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/admin/pending-users">Pending Users</Nav.Link>
                  </>
                ) : currentUser.is_approved ? (
                  <>
                    <Nav.Link as={Link} to="/user/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/user/profile">Profile</Nav.Link>
                  </>
                ) : (
                  <Nav.Link as={Link} to="/pending">Pending Approval</Nav.Link>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
          
          {currentUser && (
            <Nav>
              <Navbar.Text className="me-2">
                Signed in as: <span className="text-white">{currentUser.username}</span>
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
