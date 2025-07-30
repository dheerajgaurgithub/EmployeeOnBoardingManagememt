import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedAccess = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      p: 3,
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You don't have permission to access this page.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.history.back()}
        sx={{ mr: 2 }}
      >
        Go Back
      </Button>
      <Button
        variant="outlined"
        onClick={() => window.location.href = '/dashboard'}
      >
        Go to Dashboard
      </Button>
    </motion.div>
  </Box>
);

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // Loading is handled by App component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check user role
  if (requiredRoles) {
    const hasRequiredRole = Array.isArray(requiredRoles)
      ? requiredRoles.includes(user?.role)
      : user?.role === requiredRoles;

    if (!hasRequiredRole) {
      return <UnauthorizedAccess />;
    }
  }

  return children;
};

export default ProtectedRoute;
