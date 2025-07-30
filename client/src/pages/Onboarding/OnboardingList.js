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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  PlayArrow,
  CheckCircle,
  Schedule,
  Person,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const OnboardingList = () => {
  const { user, isAdminOrHR } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [startOnboardingOpen, setStartOnboardingOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const mockOnboardings = [
    {
      id: 1,
      employee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
        department: 'IT',
        position: 'Software Developer',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      status: 'in_progress',
      progress: 65,
      currentStep: 'IT Setup',
      totalSteps: 8,
      completedSteps: 5,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assignedTo: {
        firstName: 'HR',
        lastName: 'Manager',
      },
    },
    {
      id: 2,
      employee: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        profilePicture: null,
        department: 'Marketing',
        position: 'Marketing Specialist',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      status: 'completed',
      progress: 100,
      currentStep: 'Completed',
      totalSteps: 6,
      completedSteps: 6,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      assignedTo: {
        firstName: 'HR',
        lastName: 'Manager',
      },
    },
    {
      id: 3,
      employee: {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        profilePicture: null,
        department: 'Sales',
        position: 'Sales Representative',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      status: 'not_started',
      progress: 0,
      currentStep: 'Not Started',
      totalSteps: 7,
      completedSteps: 0,
      startedAt: null,
      expectedCompletion: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      assignedTo: {
        firstName: 'HR',
        lastName: 'Manager',
      },
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'in_progress':
        return <PlayArrow sx={{ color: 'primary.main' }} />;
      case 'not_started':
        return <Schedule sx={{ color: 'grey.400' }} />;
      default:
        return <Assignment sx={{ color: 'grey.400' }} />;
    }
  };

  const getStatusColor = (status) => {
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

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (event, onboarding) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedOnboarding(onboarding);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedOnboarding(null);
  };

  const handleStartOnboarding = () => {
    setStartOnboardingOpen(true);
    handleActionClose();
  };

  const confirmStartOnboarding = () => {
    // In real app, this would make an API call
    console.log('Starting onboarding for:', selectedOnboarding);
    setStartOnboardingOpen(false);
    setSelectedOnboarding(null);
  };

  const filteredOnboardings = mockOnboardings.filter(onboarding => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${onboarding.employee.firstName} ${onboarding.employee.lastName}`.toLowerCase().includes(searchLower) ||
      onboarding.employee.department.toLowerCase().includes(searchLower) ||
      onboarding.employee.position.toLowerCase().includes(searchLower) ||
      onboarding.currentStep.toLowerCase().includes(searchLower)
    );
  });

  const paginatedOnboardings = filteredOnboardings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              Employee Onboarding
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage employee onboarding processes.
            </Typography>
          </Box>
          {isAdminOrHR() && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/onboarding/create')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Create Onboarding
            </Button>
          )}
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
                  placeholder="Search onboarding processes..."
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

      {/* Onboarding Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {mockOnboardings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Onboardings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PlayArrow sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {mockOnboardings.filter(o => o.status === 'in_progress').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockOnboardings.filter(o => o.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {Math.round(mockOnboardings.reduce((sum, o) => sum + o.progress, 0) / mockOnboardings.length)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Onboarding Table */}
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
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Current Step</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOnboardings.map((onboarding, index) => (
                  <motion.tr
                    key={onboarding.id}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={onboarding.employee.profilePicture}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {onboarding.employee.firstName[0]}{onboarding.employee.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {onboarding.employee.firstName} {onboarding.employee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {onboarding.employee.position} • {onboarding.employee.department}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(onboarding.status)}
                        <Chip
                          label={onboarding.status.replace('_', ' ')}
                          color={getStatusColor(onboarding.status)}
                          size="small"
                          sx={{ ml: 1, textTransform: 'capitalize' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', maxWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {onboarding.completedSteps}/{onboarding.totalSteps}
                          </Typography>
                          <Typography variant="caption">
                            {onboarding.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={onboarding.progress}
                          color={getProgressColor(onboarding.progress)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {onboarding.currentStep}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(onboarding.employee.startDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {onboarding.assignedTo.firstName} {onboarding.assignedTo.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleActionClick(e, onboarding)}
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
            count={filteredOnboardings.length}
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
          navigate(`/onboarding/${selectedOnboarding?.id}`);
          handleActionClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedOnboarding?.status === 'not_started' && isAdminOrHR() && (
          <MenuItem onClick={handleStartOnboarding} sx={{ color: 'primary.main' }}>
            <PlayArrow sx={{ mr: 1 }} />
            Start Onboarding
          </MenuItem>
        )}
        {isAdminOrHR() && (
          <MenuItem onClick={handleActionClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Process
          </MenuItem>
        )}
        {isAdminOrHR() && (
          <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Process
          </MenuItem>
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Processes</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Not Started</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>In Progress</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Completed</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>This Week</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>This Month</MenuItem>
      </Menu>

      {/* Start Onboarding Dialog */}
      <Dialog
        open={startOnboardingOpen}
        onClose={() => setStartOnboardingOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start Onboarding Process</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to start the onboarding process for this employee?
          </Typography>
          {selectedOnboarding && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {selectedOnboarding.employee.firstName} {selectedOnboarding.employee.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedOnboarding.employee.position} • {selectedOnboarding.employee.department}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start Date: {format(selectedOnboarding.employee.startDate, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Steps: {selectedOnboarding.totalSteps}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will initiate the onboarding workflow and notify the employee.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartOnboardingOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmStartOnboarding}
            variant="contained"
            color="primary"
          >
            Start Onboarding
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingList;
