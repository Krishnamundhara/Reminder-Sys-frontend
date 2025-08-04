import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout, updateUserContext, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    checkStatus();
    
    // Poll for status updates more frequently (every 5 seconds)
    // This ensures quicker detection when admin approves the account
    const intervalId = setInterval(checkStatus, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const checkStatus = async () => {
    try {
      console.log('Checking approval status...');
      
      // First, refresh the user data from the server to get latest approval status
      const refreshedUser = await refreshUserData();
      console.log('Refreshed user data:', refreshedUser);
      
      // If user is already approved based on refreshed data, navigate to dashboard
      if (refreshedUser && refreshedUser.is_approved) {
        console.log('User is now approved (from refreshed data)! Redirecting to dashboard...');
        navigate('/user/dashboard');
        return;
      }
      
      // As a fallback, also check the specific pending status endpoint
      const response = await authService.getPendingStatus();
      console.log('Status response:', response);
      
      // Update user context with latest data from server
      if (response.user) {
        updateUserContext(response.user);
      }
      
      // If approved, redirect to dashboard
      if (response.status === 'approved') {
        console.log('User is now approved! Redirecting to dashboard...');
        navigate('/user/dashboard');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking approval status', error);
      setError('Could not check your approval status. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4 text-center">
              <h2 className="mb-4">Account Pending Approval</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Alert variant="info">
                <p>
                  <i className="bi bi-info-circle me-2"></i>
                  Your account is currently awaiting administrator approval.
                </p>
                <p>
                  Once your account is approved, you will be able to access all features.
                  You'll be automatically redirected to your dashboard once your account is approved.
                </p>
              </Alert>
              
              {currentUser && (
                <div className="mt-3">
                  <p>
                    <strong>Username:</strong> {currentUser.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline-secondary"
                >
                  Logout
                </button>
              </div>
              
              <div className="mt-3 small text-muted">
                <p>
                  If you believe there's an issue with your account, please contact the administrator.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PendingApproval;
