import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Modal, Button } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/DeleteAccount.css';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching dashboard data...');
      const data = await userService.getDashboard();
      console.log('Dashboard data received:', data);
      
      if (data && data.success) {
        setDashboardData(data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setDeleteError('');
      
      const response = await userService.deleteAccount();
      
      if (response.success) {
        // Account deleted successfully, log the user out
        await logout();
        // Redirect to login with a message
        navigate('/login', { 
          state: { 
            message: 'Your account has been deleted successfully.', 
            type: 'success' 
          }
        });
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteError('Failed to delete account. Please try again later.');
      setDeletingAccount(false);
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
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Welcome, {currentUser?.full_name || currentUser?.username}!</h2>
          <p className="text-muted">Your user dashboard</p>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      
      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Account Summary</Card.Title>
              <hr />
              <p><strong>Username:</strong> {currentUser?.username}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Full Name:</strong> {currentUser?.full_name}</p>
              <p>
                <strong>Account Status:</strong> 
                <span className="badge bg-success ms-2">Active</span>
              </p>
              <p><strong>Member Since:</strong> {new Date(currentUser?.created_at).toLocaleDateString()}</p>
              <Link to="/user/profile" className="btn btn-outline-primary mt-3">
                View/Edit Profile
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Activity Overview</Card.Title>
              <hr />
              <p>This is where user activity data would be displayed:</p>
              <ul>
                <li>Recent logins</li>
                <li>Account updates</li>
                <li>System notifications</li>
              </ul>
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Your account is in good standing.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <hr />
              <div className="d-flex flex-wrap gap-2">
                <Link to="/user/profile" className="btn btn-primary">
                  <i className="bi bi-person me-2"></i>
                  Edit Profile
                </Link>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-shield-lock me-2"></i>
                  Change Password
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-bell me-2"></i>
                  Notification Settings
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-shield-exclamation me-2"></i>
                  Security Settings
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Account Section with Glow Effect */}
      <Row className="mt-4">
        <Col md={12}>
          <div className="delete-account-container">
            <div className="delete-account-content">
              <h4 className="text-danger mb-3">Danger Zone</h4>
              <p>
                Deleting your account is permanent. All your data will be permanently removed and cannot be recovered.
              </p>
              <button 
                className="btn btn-delete-account" 
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete My Account
              </button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Delete Account Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
        className="modal-delete-account"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you absolutely sure you want to delete your account? This action cannot be undone.</p>
          <p>All your data will be permanently removed. This action cannot be undone.</p>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Yes, Delete My Account"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
