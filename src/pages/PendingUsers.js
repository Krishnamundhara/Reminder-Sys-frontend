import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { adminService } from '../services/api';
import { useLocation } from 'react-router-dom';

/**
 * PendingUsers Component
 * 
 * This component displays a list of users waiting for admin approval.
 * It allows admins to review, approve, or reject user registration requests.
 * 
 * @component
 */
const PendingUsers = () => {
  // State for storing and managing pending users data
  const [pendingUsers, setPendingUsers] = useState([]); // List of users awaiting approval
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [error, setError] = useState(''); // Error messages
  const [success, setSuccess] = useState(''); // Success messages
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user for review
  const [showModal, setShowModal] = useState(false); // Modal visibility control
  const [rejectionReason, setRejectionReason] = useState(''); // Optional reason for rejecting a user
  const [actionLoading, setActionLoading] = useState(false); // Loading state during approve/reject actions
  const [actionType, setActionType] = useState(''); // Current action type ('approve' or 'reject')
  
  // Get query parameters to check if a specific user should be preselected for review
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedUserId = queryParams.get('userId'); // Extract userId from URL if present
  
  // Fetch all pending users on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, []);
  
  /**
   * Effect to automatically open the review modal if a specific userId is provided in URL
   * This enables direct linking to a specific user review from other parts of the app
   * (e.g., from the admin dashboard)
   */
  useEffect(() => {
    if (preselectedUserId && pendingUsers.length > 0) {
      // Find the user by ID (handle both string and integer ID formats)
      const user = pendingUsers.find(u => u.id === parseInt(preselectedUserId) || u.id === preselectedUserId);
      if (user) {
        handleReviewUser(user);
      }
    }
  }, [preselectedUserId, pendingUsers]);
  
  /**
   * Fetches the list of all pending users from the API
   * Sets loading states and handles potential errors
   */
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingUsers();
      setPendingUsers(data.users || []); // Use empty array as fallback if no users property
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError('Failed to load pending users. Please try again later.');
      setLoading(false);
    }
  };
  
  /**
   * Opens the review modal for a selected user
   * 
   * @param {Object} user - The user object to review
   */
  const handleReviewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  
  /**
   * Closes the review modal and resets all related state
   * This ensures a clean state when opening the modal for another user
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRejectionReason('');
    setActionType('');
  };
  
  /**
   * Approves the selected user
   * Sends approval request to API and updates the UI accordingly
   */
  const handleApproveUser = async () => {
    if (!selectedUser) return; // Guard clause for safety
    
    setActionLoading(true);
    setActionType('approve');
    
    try {
      // Call API to approve user
      await adminService.approveUser(selectedUser.id);
      
      // Remove approved user from the pending users list
      setPendingUsers(pendingUsers.filter(user => user.id !== selectedUser.id));
      
      // Show success message and close modal
      setSuccess(`User ${selectedUser.username} has been approved successfully.`);
      handleCloseModal();
    } catch (error) {
      console.error('Error approving user:', error);
      setError(error.response?.data?.message || 'Failed to approve user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  /**
   * Rejects the selected user
   * Sends rejection request to API with optional reason and updates the UI accordingly
   */
  const handleRejectUser = async () => {
    if (!selectedUser) return; // Guard clause for safety
    
    setActionLoading(true);
    setActionType('reject');
    
    try {
      // Call API to reject user, including optional rejection reason
      await adminService.rejectUser(selectedUser.id, { reason: rejectionReason });
      
      // Remove rejected user from the pending users list
      setPendingUsers(pendingUsers.filter(user => user.id !== selectedUser.id));
      
      // Show success message and close modal
      setSuccess(`User ${selectedUser.username} has been rejected.`);
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError(error.response?.data?.message || 'Failed to reject user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Show loading spinner while fetching initial data
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  
  // Main component render
  return (
    <Container className="py-4">
      {/* Page header */}
      <Row className="mb-4">
        <Col>
          <h2>Pending Users</h2>
          <p className="text-muted">Review and manage user registration requests</p>
        </Col>
      </Row>
      
      {/* Error alert - shown when API calls fail */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Success alert - shown after successful actions */}
      {success && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Main content - Pending users table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Conditional rendering based on whether there are pending users */}
              {pendingUsers && pendingUsers.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Registered Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map through pending users to create table rows */}
                    {pendingUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleReviewUser(user)}
                            aria-label={`Review ${user.username}`}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                // Display when there are no pending users
                <Alert variant="info">
                  No pending users to display. All user registrations have been processed.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* User Review Modal - Used to show user details and approval/rejection controls */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        backdrop="static" 
        keyboard={false} 
        aria-labelledby="user-review-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="user-review-modal">Review User Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              {/* Display selected user details */}
              <div className="mb-4">
                <h5>User Details</h5>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Full Name:</strong> {selectedUser.full_name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Registration Date:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
              
              {/* Primary action buttons for approval/rejection */}
              <div className="mb-4">
                <h5>Actions</h5>
                <div className="d-grid gap-2">
                  {/* Approve button with loading state */}
                  <Button 
                    variant="success"
                    onClick={handleApproveUser}
                    disabled={actionLoading}
                    aria-label="Approve user registration"
                  >
                    {actionLoading && actionType === 'approve' ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" className="me-2" />
                        Approving...
                      </>
                    ) : 'Approve User'}
                  </Button>
                  
                  {/* Reject button - shows rejection form when clicked */}
                  <Button 
                    variant="danger"
                    onClick={() => setActionType('reject')}
                    disabled={actionLoading}
                    aria-label="Reject user registration"
                  >
                    Reject User
                  </Button>
                </div>
              </div>
              
              {/* Conditional rejection form - shown when actionType is 'reject' */}
              {actionType === 'reject' && (
                <div className="mb-3">
                  <Form.Group>
                    <Form.Label>Rejection Reason (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection (will be sent to the user)"
                      aria-describedby="rejection-reason-help"
                    />
                    <Form.Text id="rejection-reason-help" muted>
                      This reason will be included in the email notification to the user.
                    </Form.Text>
                  </Form.Group>
                  
                  {/* Confirm/Cancel rejection buttons */}
                  <div className="d-grid gap-2 mt-3">
                    {/* Confirm rejection button with loading state */}
                    <Button 
                      variant="danger" 
                      onClick={handleRejectUser}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <Spinner as="span" size="sm" animation="border" className="me-2" />
                          Rejecting...
                        </>
                      ) : 'Confirm Rejection'}
                    </Button>
                    
                    {/* Cancel button - returns to main action buttons */}
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setActionType('')}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

/**
 * This component is responsible for the admin workflow of approving or rejecting
 * new user registrations. It's a critical part of the user onboarding process.
 * 
 * @module PendingUsers
 */
export default PendingUsers;
