import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge, Button, Nav, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    inactiveUsers: 0
  });
  
  // Selected user for details
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data in parallel
      const [dashboardRes, pendingRes, approvedRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getPendingUsers(),
        adminService.getApprovedUsers()
      ]);
      
      const users = dashboardRes.users || [];
      setAllUsers(users);
      setPendingUsers(pendingRes.users || []);
      setApprovedUsers(approvedRes.users || []);
      
      // Calculate dashboard stats
      setDashboardStats({
        totalUsers: users.length,
        activeUsers: users.filter(user => user.is_approved && user.is_active).length,
        pendingUsers: users.filter(user => !user.is_approved).length,
        inactiveUsers: users.filter(user => user.is_approved && !user.is_active).length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve a user
  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      fetchUsers(); // Refresh data
    } catch (error) {
      setError('Failed to approve user.');
    }
  };

  // Reject a user
  const handleReject = async (userId) => {
    try {
      await adminService.rejectUser(userId);
      fetchUsers(); // Refresh data
    } catch (error) {
      setError('Failed to reject user.');
    }
  };

  // Activate/deactivate user
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await adminService.deactivateUser(userId);
      } else {
        await adminService.reactivateUser(userId);
      }
      fetchUsers(); // Refresh data
    } catch (error) {
      setError('Failed to update user status.');
    }
  };

  // Open user details modal
  const handleViewDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const response = await adminService.getUserDetails(userId);
      setSelectedUser(response.user);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Failed to load user details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Delete user permanently
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      fetchUsers(); // Refresh data
      setError(''); // Clear any existing errors
    } catch (error) {
      setError('Failed to delete user.');
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  // Current users based on active tab
  const currentUsers = activeTab === 'pending' 
    ? pendingUsers 
    : activeTab === 'approved' 
      ? approvedUsers 
      : allUsers;

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }
  
  return (
    <Container className="admin-dashboard my-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Control Panel</h2>
          <p className="text-muted">Full admin control over users and system settings</p>
          <Alert variant="info">
            <strong>Admin Privileges:</strong> As an administrator, you have full power to approve users, delete accounts, manage user status, and view all user details including sensitive information.
          </Alert>
        </Col>
      </Row>

      {/* User Statistics */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="display-4">{dashboardStats.totalUsers}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="display-4">{dashboardStats.activeUsers}</h2>
              <p className="text-muted mb-0">Active Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="display-4">{dashboardStats.pendingUsers}</h2>
              <p className="text-muted mb-0">Pending Approval</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="display-4">{dashboardStats.inactiveUsers}</h2>
              <p className="text-muted mb-0">Inactive Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* User Management Card */}
      <Card className="mb-4">
        <Card.Header className="bg-dark text-white">
          <h4 className="mb-0">User Management</h4>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
            <Nav.Item>
              <Nav.Link eventKey="all">
                All Users <Badge bg="secondary">{allUsers.length}</Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="pending">
                Pending Approval <Badge bg="warning" text="dark">{pendingUsers.length}</Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="approved">
                Approved Users <Badge bg="success">{approvedUsers.length}</Badge>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="bg-light">
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || 'Not provided'}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        {user.is_approved ? (
                          <Badge bg={user.is_active ? 'success' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        ) : (
                          <Badge bg="warning" text="dark">Pending</Badge>
                        )}
                      </td>
                      <td>{new Date(user.created_at).toLocaleString()}</td>
                      <td className="actions">
                        {/* Only show approval/reject buttons for pending users */}
                        {!user.is_approved && user.role !== 'admin' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="success" 
                              onClick={() => handleApprove(user.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              onClick={() => handleReject(user.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Only show activate/deactivate for approved non-admin users */}
                        {user.is_approved && user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant={user.is_active ? "secondary" : "primary"}
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                        
                        {/* Show view details for all users */}
                        <Button 
                          size="sm" 
                          variant="info" 
                          onClick={() => handleViewDetails(user.id)}
                        >
                          Details
                        </Button>
                        
                        {/* Only allow deletion of non-admin users */}
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => handleDeleteConfirmation(user)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      {/* System Status */}
      <Row>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Database</span>
                  <Badge bg="success">Connected</Badge>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '100%' }}
                    aria-valuenow="100" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>API Health</span>
                  <Badge bg="success">OK</Badge>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '95%' }}
                    aria-valuenow="95" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Server Load</span>
                  <Badge bg="warning">Moderate</Badge>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: '65%' }}
                    aria-valuenow="65" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <div className="mb-0">
                <div className="d-flex justify-content-between mb-1">
                  <span>Memory Usage</span>
                  <Badge bg="info">Low</Badge>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: '30%' }}
                    aria-valuenow="30" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center my-3">
              <Spinner animation="border" variant="primary" />
              <p>Loading user details...</p>
            </div>
          ) : selectedUser ? (
            <div className="user-details">
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Basic Information</h5>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>User ID:</strong> {selectedUser.id}</p>
                      <p><strong>Username:</strong> {selectedUser.username}</p>
                      <p><strong>Full Name:</strong> {selectedUser.full_name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Phone:</strong> {selectedUser.phone_number || 'Not provided'}</p>
                      <p><strong>Role:</strong> {selectedUser.role}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Account Status</h5>
                    </Card.Header>
                    <Card.Body>
                      <p>
                        <strong>Email Verified:</strong>{' '}
                        <Badge bg={selectedUser.email_verified ? 'success' : 'warning'}>
                          {selectedUser.email_verified ? 'Yes' : 'No'}
                        </Badge>
                      </p>
                      <p>
                        <strong>Approved:</strong>{' '}
                        <Badge bg={selectedUser.is_approved ? 'success' : 'warning'}>
                          {selectedUser.is_approved ? 'Yes' : 'No'}
                        </Badge>
                      </p>
                      <p>
                        <strong>Active:</strong>{' '}
                        <Badge bg={selectedUser.is_active ? 'success' : 'secondary'}>
                          {selectedUser.is_active ? 'Yes' : 'No'}
                        </Badge>
                      </p>
                      <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(selectedUser.updated_at).toLocaleString()}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              {selectedUser.password && (
                <Card className="mt-3">
                  <Card.Header className="bg-danger text-white">
                    <h5 className="mb-0">Sensitive Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group>
                      <Form.Label>Password Hash</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={selectedUser.password} 
                        readOnly 
                        className="password-hash"
                      />
                      <Form.Text className="text-muted">
                        This is the hashed password stored in the database. It cannot be reversed to plaintext.
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              )}
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p>Are you sure you want to <strong className="text-danger">permanently delete</strong> this user?</p>
              <p><strong>Username:</strong> {userToDelete.username}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
              <p><strong>Full Name:</strong> {userToDelete.full_name}</p>
              <Alert variant="warning">
                This action cannot be undone. All user data will be permanently removed.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                Deleting...
              </>
            ) : 'Delete Permanently'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
