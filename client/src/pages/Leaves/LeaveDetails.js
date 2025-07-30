import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,

  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Check,
  Close,
  CalendarToday,
  Person,
  Description,
  AccessTime,
  Comment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrHR } = useAuth();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');

  // Mock leave data - in real app, this would come from API
  useEffect(() => {
    const mockLeave = {
      id: parseInt(id),
      employee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001',
        department: 'IT',
        position: 'Software Developer',
        profilePicture: null,
      },
      type: 'Vacation',
      startDate: new Date(2024, 1, 15),
      endDate: new Date(2024, 1, 20),
      totalDays: 6,
      reason: 'Family vacation to Hawaii. Need to spend quality time with family and recharge.',
      status: 'pending',
      appliedDate: new Date(2024, 0, 10),
      approvedBy: null,
      approvedDate: null,
      comments: '',
      attachments: [],
      timeline: [
        {
          id: 1,
          action: 'Applied',
          date: new Date(2024, 0, 10),
          user: 'John Doe',
          comments: 'Leave application submitted',
        },
        {
          id: 2,
          action: 'Under Review',
          date: new Date(2024, 0, 11),
          user: 'HR System',
          comments: 'Application forwarded to manager for review',
        },
      ],
    };
    
    setTimeout(() => {
      setLeave(mockLeave);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Vacation':
        return 'primary';
      case 'Sick Leave':
        return 'error';
      case 'Personal':
        return 'secondary';
      case 'Maternity':
      case 'Paternity':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleAction = (type) => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    // In real app, this would make API call
    console.log(`${actionType} leave with comments:`, comments);
    setActionDialogOpen(false);
    setComments('');
    
    // Update leave status
    setLeave(prev => ({
      ...prev,
      status: actionType === 'approve' ? 'approved' : 'rejected',
      approvedBy: user.firstName + ' ' + user.lastName,
      approvedDate: new Date(),
      comments: comments,
      timeline: [
        ...prev.timeline,
        {
          id: prev.timeline.length + 1,
          action: actionType === 'approve' ? 'Approved' : 'Rejected',
          date: new Date(),
          user: user.firstName + ' ' + user.lastName,
          comments: comments || `Leave ${actionType}d`,
        },
      ],
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading leave details...</Typography>
      </Box>
    );
  }

  if (!leave) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Leave request not found</Typography>
        <Button onClick={() => navigate('/leaves')} sx={{ mt: 2 }}>
          Back to Leaves
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/leaves')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Leave Request Details
        </Typography>
        {isAdminOrHR() && leave.status === 'pending' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Close />}
              onClick={() => handleAction('reject')}
            >
              Reject
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Leave Details Card */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {leave.type} Request
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={leave.status}
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                      <Chip
                        label={leave.type}
                        color={getTypeColor(leave.type)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Applied on {format(leave.appliedDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1">
                          {format(leave.startDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          End Date
                        </Typography>
                        <Typography variant="body1">
                          {format(leave.endDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Days
                        </Typography>
                        <Typography variant="body1">
                          {leave.totalDays} days
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {leave.approvedBy && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {leave.status === 'approved' ? 'Approved By' : 'Reviewed By'}
                          </Typography>
                          <Typography variant="body1">
                            {leave.approvedBy}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Description sx={{ mr: 1 }} />
                    Reason
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {leave.reason}
                  </Typography>
                </Box>

                {leave.comments && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Comment sx={{ mr: 1 }} />
                      Comments
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1">
                        {leave.comments}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Employee Info & Timeline */}
        <Grid item xs={12} md={4}>
          {/* Employee Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {leave.employee.position}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">
                    {leave.employee.employeeId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {leave.employee.department}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                <Timeline>
                  {leave.timeline.map((item, index) => (
                    <TimelineItem key={item.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={
                            item.action === 'Approved' ? 'success' :
                            item.action === 'Rejected' ? 'error' : 'primary'
                          }
                        />
                        {index < leave.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          {item.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(item.date, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {item.user}
                        </Typography>
                        {item.comments && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {item.comments}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {actionType} this leave request?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2">
              {leave.employee.firstName} {leave.employee.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {leave.type} • {format(leave.startDate, 'MMM dd')} - {format(leave.endDate, 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {leave.totalDays} days
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
            placeholder={`Add comments for ${actionType}ing this leave request...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveDetails;
