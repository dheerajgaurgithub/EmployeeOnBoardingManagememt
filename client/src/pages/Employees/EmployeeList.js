import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
  Block,
  CheckCircle,
  Email,
  Phone,
  Work,
  Group,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const EmployeeList = () => {
  const { user, isAdminOrHR } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const mockEmployees = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      employeeId: 'EMP001',
      department: 'IT',
      position: 'Software Developer',
      role: 'employee',
      status: 'active',
      startDate: new Date(2023, 5, 15),
      profilePicture: null,
      manager: 'Mike Johnson',
      onboardingStatus: 'completed',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 234-5678',
      employeeId: 'EMP002',
      department: 'HR',
      position: 'HR Specialist',
      role: 'hr',
      status: 'active',
      startDate: new Date(2023, 3, 10),
      profilePicture: null,
      manager: 'Sarah Wilson',
      onboardingStatus: 'completed',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 345-6789',
      employeeId: 'EMP003',
      department: 'Sales',
      position: 'Sales Manager',
      role: 'employee',
      status: 'active',
      startDate: new Date(2022, 8, 20),
      profilePicture: null,
      manager: 'CEO',
      onboardingStatus: 'completed',
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1 (555) 456-7890',
      employeeId: 'EMP004',
      department: 'Marketing',
      position: 'Marketing Specialist',
      role: 'employee',
      status: 'inactive',
      startDate: new Date(2023, 1, 5),
      profilePicture: null,
      manager: 'Mike Johnson',
      onboardingStatus: 'in_progress',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'hr':
        return 'warning';
      case 'employee':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getOnboardingStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'not_started':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (event, employee) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleDeactivate = () => {
    setDeactivateDialogOpen(true);
    handleActionClose();
  };

  const confirmDeactivate = () => {
    // In real app, this would make an API call
    console.log('Deactivating employee:', selectedEmployee);
    setDeactivateDialogOpen(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = mockEmployees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.employeeId.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower)
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!isAdminOrHR()) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to view this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Employee Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee accounts and information.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/employees/create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Add Employee
          </Button>
        </Box>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  fullWidth
                >
                  Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employee Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {mockEmployees.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockEmployees.filter(e => e.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Work sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {new Set(mockEmployees.map(e => e.department)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonAdd sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {mockEmployees.filter(e => e.onboardingStatus === 'in_progress').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Onboarding
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Onboarding</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={employee.profilePicture}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {employee.firstName[0]}{employee.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.employeeId} • {employee.position}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {employee.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {employee.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Manager: {employee.manager}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        color={getRoleColor(employee.role)}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        color={getStatusColor(employee.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.onboardingStatus.replace('_', ' ')}
                        color={getOnboardingStatusColor(employee.onboardingStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(employee.startDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleActionClick(e, employee)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => {
          navigate(`/employees/${selectedEmployee?.id}`);
          handleActionClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleActionClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Employee
        </MenuItem>
        {selectedEmployee?.status === 'active' ? (
          <MenuItem onClick={handleDeactivate} sx={{ color: 'error.main' }}>
            <Block sx={{ mr: 1 }} />
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActionClose} sx={{ color: 'success.main' }}>
            <CheckCircle sx={{ mr: 1 }} />
            Activate
          </MenuItem>
        )}
        <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Employees</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Active Only</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Inactive Only</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>IT Department</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>HR Department</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Sales Department</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Marketing Department</MenuItem>
      </Menu>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deactivate Employee</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to deactivate this employee?
          </Typography>
          {selectedEmployee && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee.position} • {selectedEmployee.department}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee ID: {selectedEmployee.employeeId}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will prevent the employee from accessing the system. You can reactivate them later if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeactivate}
            variant="contained"
            color="error"
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
