import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requireApproved = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Role check
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  // Approval check
  if (requireApproved && !currentUser.is_approved && currentUser.role !== 'admin') {
    return <Navigate to="/pending" />;
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;
