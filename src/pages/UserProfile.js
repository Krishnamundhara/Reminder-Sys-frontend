import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { currentUser, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    username: '',
    bio: '',
    phone: ''
  });
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      
      setProfileData({
        full_name: data.user.full_name || '',
        email: data.user.email || '',
        username: data.user.username || '',
        bio: data.user.bio || '',
        phone: data.user.phone || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load your profile. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setSaving(true);
      
      // Submit updated profile
      const response = await userService.updateProfile(profileData);
      
      // Update auth context with new user data
      if (updateUserContext) {
        updateUserContext(response.user);
      }
      
      setSuccess('Profile updated successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update your profile. Please try again.');
      setSaving(false);
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
      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-4">
                <div 
                  className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center mx-auto"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                >
                  {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <h5>{profileData.full_name || profileData.username}</h5>
              <p className="text-muted">{profileData.email}</p>
              <div className="d-grid">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-image me-2"></i>
                  Change Photo
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9} md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Edit Profile</h4>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name" 
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="username"
                        value={profileData.username}
                        onChange={handleChange}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Username cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Contact admin to change email
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control 
                        type="tel" 
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number" 
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself" 
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
