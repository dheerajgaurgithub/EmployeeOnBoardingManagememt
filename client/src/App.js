import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard Components
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';

// Employee Management
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeDetails from './pages/Employees/EmployeeDetails';

// Task Management
import TaskList from './pages/Tasks/TaskList';
import TaskDetails from './pages/Tasks/TaskDetails';
import CreateTask from './pages/Tasks/CreateTask';

// Leave Management
import LeaveList from './pages/Leaves/LeaveList';
import LeaveDetails from './pages/Leaves/LeaveDetails';
import CreateLeave from './pages/Leaves/CreateLeave';

// Document Management
import DocumentList from './pages/Documents/DocumentList';
import DocumentDetails from './pages/Documents/DocumentDetails';
import UploadDocument from './pages/Documents/UploadDocument';

// Onboarding Management
import OnboardingList from './pages/Onboarding/OnboardingList';
import OnboardingDetails from './pages/Onboarding/OnboardingDetails';
import CreateOnboarding from './pages/Onboarding/CreateOnboarding';
import MyOnboarding from './pages/Onboarding/MyOnboarding';

// Settings
import Settings from './pages/Settings/Settings';

// 404 Page
import NotFound from './pages/NotFound/NotFound';

const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CircularProgress size={60} sx={{ color: 'white' }} />
    </motion.div>
  </Box>
);

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Login />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Register />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Profile */}
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Employee Management - Admin/HR only */}
                  <Route
                    path="/employees"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'hr']}>
                        <EmployeeList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employees/:id"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'hr']}>
                        <EmployeeDetails />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Task Management */}
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/tasks/:id" element={<TaskDetails />} />
                  <Route
                    path="/tasks/create"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'hr']}>
                        <CreateTask />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Leave Management */}
                  <Route path="/leaves" element={<LeaveList />} />
                  <Route path="/leaves/:id" element={<LeaveDetails />} />
                  <Route path="/leaves/create" element={<CreateLeave />} />
                  
                  {/* Document Management */}
                  <Route path="/documents" element={<DocumentList />} />
                  <Route path="/documents/:id" element={<DocumentDetails />} />
                  <Route path="/documents/upload" element={<UploadDocument />} />
                  
                  {/* Onboarding Management */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'hr']}>
                        <OnboardingList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/:id"
                    element={<OnboardingDetails />}
                  />
                  <Route
                    path="/onboarding/create"
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'hr']}>
                        <CreateOnboarding />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/my-onboarding" element={<MyOnboarding />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
