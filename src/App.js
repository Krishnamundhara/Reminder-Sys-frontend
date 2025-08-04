import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SessionHeartbeat from './components/SessionHeartbeat';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PendingApproval from './pages/PendingApproval';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import PendingUsers from './pages/PendingUsers';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
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

  return (
    <div className="page-container">
      <NavBar />
      {/* Session heartbeat component - invisible but keeps sessions alive */}
      {currentUser && <SessionHeartbeat />}
      <div className="content-wrap">
        <Container className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <Signup />} />
            <Route path="/pending" element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            } />
            <Route path="/user/dashboard" element={
              <ProtectedRoute requiredRole="user" requireApproved={true}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/profile" element={
              <ProtectedRoute requiredRole="user" requireApproved={true}>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/pending-users" element={
              <ProtectedRoute requiredRole="admin">
                <PendingUsers />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default App;
