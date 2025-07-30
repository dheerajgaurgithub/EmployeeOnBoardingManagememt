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
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  EventNote,
  CheckCircle,
  Schedule,
  Cancel,
  Block,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const LeaveList = () => {
  const { user, isAdminOrHR } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');

  // Mock data - in real app, this would come from API
  const mockLeaves = [
    {
      id: 1,
      employee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
        department: 'IT',
      },
      leaveType: 'vacation',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      totalDays: 5,
      reason: 'Family vacation to Europe',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      employee: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        profilePicture: null,
        department: 'HR',
      },
      leaveType: 'sick',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      reason: 'Medical treatment and recovery',
      status: 'approved',
      approvedBy: {
        firstName: 'Mike',
        lastName: 'Johnson',
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      employee: {
        id: 3,
        firstName: 'Sarah',
        lastName: 'Wilson',
        profilePicture: null,
        department: 'Marketing',
      },
      leaveType: 'personal',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      reason: 'Personal matters',
      status: 'rejected',
      rejectionReason: 'Insufficient notice period',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'rejected':
        return <Block sx={{ color: 'error.main' }} />;
      case 'cancelled':
        return <Cancel sx={{ color: 'grey.400' }} />;
      default:
        return <EventNote sx={{ color: 'grey.400' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'vacation':
        return 'primary';
      case 'sick':
        return 'error';
      case 'personal':
        return 'info';
      case 'maternity':
      case 'paternity':
        return 'secondary';
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

  const handleActionClick = (event, leave) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedLeave(null);
  };

  const handleApprovalAction = (action) => {
    setApprovalAction(action);
    setApprovalDialogOpen(true);
    handleActionClose();
  };

  const confirmApprovalAction = () => {
    // In real app, this would make an API call
    console.log(`${approvalAction} leave request:`, selectedLeave);
    setApprovalDialogOpen(false);
    setApprovalAction('');
    setSelectedLeave(null);
  };

  const filteredLeaves = mockLeaves.filter(leave => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${leave.employee.firstName} ${leave.employee.lastName}`.toLowerCase().includes(searchLower) ||
      leave.leaveType.toLowerCase().includes(searchLower) ||
      leave.reason.toLowerCase().includes(searchLower)
    );
  });

  const paginatedLeaves = filteredLeaves.slice(
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
              Leave Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee leave requests and approvals.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/leaves/create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Request Leave
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
                  placeholder="Search leave requests..."
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

      {/* Leave Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {mockLeaves.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {mockLeaves.filter(l => l.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockLeaves.filter(l => l.status === 'approved').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {mockLeaves.filter(l => l.status === 'rejected').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Leaves Table */}
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
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLeaves.map((leave, index) => (
                  <motion.tr
                    key={leave.id}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={leave.employee.profilePicture}
                          sx={{ width: 32, height: 32, mr: 2 }}
                        >
                          {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {leave.employee.firstName} {leave.employee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.employee.department}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.leaveType}
                        color={getLeaveTypeColor(leave.leaveType)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(leave.startDate, 'MMM dd')} - {format(leave.endDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(leave.status)}
                        <Chip
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {leave.reason.length > 30
                          ? `${leave.reason.substring(0, 30)}...`
                          : leave.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleActionClick(e, leave)}
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
            count={filteredLeaves.length}
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
          navigate(`/leaves/${selectedLeave?.id}`);
          handleActionClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {(selectedLeave?.employee.id === user?.id || isAdminOrHR()) && (
          <MenuItem onClick={handleActionClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Request
          </MenuItem>
        )}
        {isAdminOrHR() && selectedLeave?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleApprovalAction('approve')} sx={{ color: 'success.main' }}>
              <CheckCircle sx={{ mr: 1 }} />
              Approve
            </MenuItem>
            <MenuItem onClick={() => handleApprovalAction('reject')} sx={{ color: 'error.main' }}>
              <Block sx={{ mr: 1 }} />
              Reject
            </MenuItem>
          </>
        )}
        {selectedLeave?.employee.id === user?.id && selectedLeave?.status === 'pending' && (
          <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Cancel Request
          </MenuItem>
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Requests</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>My Requests</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Pending</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Approved</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Rejected</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>This Month</MenuItem>
      </Menu>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {approvalAction} this leave request?
          </Typography>
          {selectedLeave && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {selectedLeave.employee.firstName} {selectedLeave.employee.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLeave.leaveType} • {selectedLeave.totalDays} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(selectedLeave.startDate, 'MMM dd')} - {format(selectedLeave.endDate, 'MMM dd, yyyy')}
              </Typography>
            </Box>
          )}
          {approvalAction === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              multiline
              rows={3}
              placeholder="Please provide a reason for rejection..."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmApprovalAction}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveList;
