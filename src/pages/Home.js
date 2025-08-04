import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col md={8} className="text-center">
          <h1 className="display-4 mb-3">Welcome to Reminder Sys</h1>
          <p className="lead">
            A secure reminder system with user approval workflow
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {currentUser ? (
                <>
                  <h2>Hello, {currentUser.full_name || currentUser.username}!</h2>
                  <p>
                    You are logged in as{" "}
                    <strong>{currentUser.role}</strong>.
                  </p>
                  {currentUser.role === 'admin' ? (
                    <Button as={Link} to="/admin/dashboard" variant="primary">
                      Go to Admin Dashboard
                    </Button>
                  ) : currentUser.is_approved ? (
                    <Button as={Link} to="/user/dashboard" variant="primary">
                      Go to User Dashboard
                    </Button>
                  ) : (
                    <Button as={Link} to="/pending" variant="warning">
                      Check Approval Status
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h2>Get Started</h2>
                  <p>Please login or create a new account to continue.</p>
                  <div className="d-flex gap-2">
                    <Button as={Link} to="/login" variant="primary">
                      Login
                    </Button>
                    <Button as={Link} to="/signup" variant="outline-primary">
                      Sign Up
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h3>Secure Authentication</h3>
              <p>
                Industry standard authentication with session management and
                password hashing.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h3>Admin Approval</h3>
              <p>
                New users need admin approval before accessing their accounts.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h3>User Management</h3>
              <p>
                Admins can manage users, approve or reject registrations, and
                activate/deactivate accounts.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
