import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

/**
 * Signup Component
 * 
 * Handles user registration with email verification via OTP
 * Implements checks to prevent duplicate email accounts
 */
const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email verification states
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle email change and reset verification status
  const handleEmailChange = (e) => {
    setFormData({
      ...formData,
      email: e.target.value
    });
    
    // Reset verification status when email changes
    setEmailVerified(false);
    setShowOtpInput(false);
    setOtpSent(false);
  };
  
  // Handle OTP input change with validation
  const handleOtpChange = (e) => {
    const value = e.target.value;
    
    // Only allow digits, and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      
      // Auto-verify if user enters all 6 digits
      if (value.length === 6 && otpSent) {
        // Slight delay before auto-verification to allow user to see what they typed
        setTimeout(() => {
          console.log('Auto-verifying OTP after 6 digits entered');
          handleVerifyOtp();
        }, 500);
      }
    }
  };
  
  // Send OTP to provided email
  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter an email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setSendingOtp(true);
    setSuccess('');
    
    try {
      console.log('Requesting OTP for email:', formData.email);
      
      // First check if the email already exists
      const checkResponse = await authService.checkEmailExists(formData.email);
      console.log('Email check response:', checkResponse);
      
      if (checkResponse.exists) {
        setError('This email is already registered. Please use a different email or login.');
        setSendingOtp(false);
        return;
      }
      
      // If email doesn't exist, send OTP
      const response = await authService.sendOtp(formData.email);
      console.log('OTP sent response:', response);
      
      setOtpSent(true);
      setShowOtpInput(true);
      setOtp(''); // Clear any previous OTP
      setSuccess('OTP sent to your email. Please check your inbox (and spam folder) and enter the 6-digit code below.');
    } catch (error) {
      console.error('Send OTP error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };
  
  // Verify the entered OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }
    
    // Check that OTP is the right format (6 digit number)
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be a 6-digit number');
      return;
    }
    
    setError('');
    setVerifyingOtp(true);
    
    try {
      console.log(`Verifying OTP: ${otp} for email: ${formData.email}`);
      const response = await authService.verifyOtp(formData.email, otp);
      console.log('OTP verification response:', response);
      
      setEmailVerified(true);
      setShowOtpInput(false);
      setSuccess('Email verified successfully! You can now complete your registration.');
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Improved error handling
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Final form submission after email verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Make sure email is verified
    if (!emailVerified) {
      setError('Please verify your email before registering');
      return;
    }
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if phone number already exists
      const phoneCheckResult = await authService.checkPhoneExists(formData.phone_number);
      
      if (phoneCheckResult.exists) {
        setError('Phone number is already registered');
        setLoading(false);
        return;
      }
      
      const { confirmPassword, ...userData } = formData;
      
      // Add verified flag to user data
      const verifiedUserData = {
        ...userData,
        emailVerified: true
      };
      
      const response = await authService.signup(verifiedUserData);
      
      setSuccess('Registration successful! Your account is pending approval by an administrator.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Sign Up</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required 
                    placeholder="Enter your full name" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required 
                    placeholder="Enter your phone number" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required 
                    placeholder="Choose a username" 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      required 
                      placeholder="Enter your email"
                      disabled={emailVerified || otpSent}
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={handleSendOtp} 
                      disabled={emailVerified || sendingOtp || !formData.email}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {sendingOtp ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-1" />
                          Sending...
                        </>
                      ) : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Button>
                  </div>
                  {emailVerified && (
                    <Form.Text className="text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Email verified
                    </Form.Text>
                  )}
                </Form.Group>
                
                {showOtpInput && (
                  <Form.Group className="mb-4">
                    <Form.Label>Verification Code</Form.Label>
                    <Card className="p-3 border-primary">
                      <div className="d-flex gap-2">
                        <Form.Control 
                          type="text" 
                          value={otp}
                          onChange={handleOtpChange}
                          required 
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="form-control-lg text-center"
                          autoFocus
                          autoComplete="one-time-code"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <Button 
                          variant="success" 
                          onClick={handleVerifyOtp} 
                          disabled={verifyingOtp || !otp || otp.length !== 6}
                          size="lg"
                        >
                          {verifyingOtp ? (
                            <>
                              <Spinner size="sm" animation="border" className="me-1" />
                              Verifying...
                            </>
                          ) : 'Verify OTP'}
                        </Button>
                      </div>
                      <div className="mt-3">
                        <Form.Text className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Enter the 6-digit code sent to your email address. Please check your spam/junk folder if you don't see it.
                        </Form.Text>
                      </div>
                    </Card>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    placeholder="Create a password" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                    placeholder="Confirm your password" 
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading || !emailVerified}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
                
                {!emailVerified && (
                  <Form.Text className="text-danger d-block text-center mt-2">
                    Please verify your email before signing up
                  </Form.Text>
                )}
              </Form>
              
              <div className="text-center mt-3">
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
