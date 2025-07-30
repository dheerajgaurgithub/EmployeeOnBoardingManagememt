import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Grid,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  Send,
  AttachFile,
  Schedule,
  CheckCircle,
  Warning,
  Person,
  CalendarToday,
  Flag,
  Category,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrHR } = useAuth();
  const [comment, setComment] = useState('');
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Mock task data - in real app, this would come from API
  const mockTask = {
    id: parseInt(id),
    title: 'Complete employee profile setup',
    description: 'Fill out all required personal and professional information in the employee portal. This includes uploading profile picture, emergency contacts, and completing all mandatory fields.',
    assignedTo: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@company.com',
      profilePicture: null,
      department: 'IT',
    },
    assignedBy: {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@company.com',
    },
    status: 'in-progress',
    priority: 'high',
    category: 'onboarding',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimatedHours: 4,
    actualHours: 2.5,
    tags: ['new-employee', 'urgent', 'profile'],
    comments: [
      {
        id: 1,
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          profilePicture: null,
        },
        text: 'Please make sure to complete this by the end of the week.',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: 2,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          profilePicture: null,
        },
        text: 'I have completed about 60% of the profile. Just need to add emergency contacts.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    attachments: [
      {
        id: 1,
        name: 'profile_requirements.pdf',
        size: '245 KB',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'in-progress':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'pending':
        return <Warning sx={{ color: 'grey.400' }} />;
      default:
        return <Warning sx={{ color: 'grey.400' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getProgressValue = () => {
    switch (mockTask.status) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 60;
      case 'pending':
        return 0;
      default:
        return 0;
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      // In real app, this would make an API call
      console.log('Adding comment:', comment);
      setComment('');
    }
  };

  const handleStatusChange = (status) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    // In real app, this would make an API call
    console.log('Changing status to:', newStatus);
    setStatusDialogOpen(false);
    setNewStatus('');
  };

  const canEditTask = isAdminOrHR() || mockTask.assignedTo.id === user?.id;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Task Details
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage task information and progress.
              </Typography>
            </Box>
          </Box>
          {canEditTask && (
            <Box>
              <IconButton onClick={(e) => setActionAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={actionAnchorEl}
                open={Boolean(actionAnchorEl)}
                onClose={() => setActionAnchorEl(null)}
              >
                <MenuItem onClick={() => setActionAnchorEl(null)}>
                  <Edit sx={{ mr: 1 }} />
                  Edit Task
                </MenuItem>
                {isAdminOrHR() && (
                  <MenuItem onClick={() => setActionAnchorEl(null)} sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1 }} />
                    Delete Task
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Task Information */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  {getStatusIcon(mockTask.status)}
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {mockTask.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={mockTask.status.replace('-', ' ')}
                        color={getStatusColor(mockTask.status)}
                        size="small"
                      />
                      <Chip
                        label={mockTask.priority}
                        color={getPriorityColor(mockTask.priority)}
                        size="small"
                      />
                      <Chip
                        label={mockTask.category}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {mockTask.description}
                    </Typography>
                    
                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {mockTask.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getProgressValue()}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      },
                    }}
                  />
                </Box>

                {/* Quick Actions */}
                {canEditTask && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {mockTask.status !== 'in-progress' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange('in-progress')}
                      >
                        Start Task
                      </Button>
                    )}
                    {mockTask.status !== 'completed' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChange('completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {mockTask.status === 'in-progress' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange('pending')}
                      >
                        Pause Task
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comments ({mockTask.comments.length})
                </Typography>
                
                {/* Add Comment */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    size="small"
                  >
                    Add Comment
                  </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Comments List */}
                <List>
                  {mockTask.comments.map((commentItem, index) => (
                    <ListItem key={commentItem.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={commentItem.user.profilePicture}>
                          {commentItem.user.firstName[0]}{commentItem.user.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {commentItem.user.firstName} {commentItem.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(commentItem.createdAt, 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {commentItem.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Task Sidebar */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Information
                </Typography>
                
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Assigned To"
                      secondary={`${mockTask.assignedTo.firstName} ${mockTask.assignedTo.lastName}`}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Assigned By"
                      secondary={`${mockTask.assignedBy.firstName} ${mockTask.assignedBy.lastName}`}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <CalendarToday sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Due Date"
                      secondary={format(mockTask.dueDate, 'MMM dd, yyyy')}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <Schedule sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Time Tracking"
                      secondary={`${mockTask.actualHours}h / ${mockTask.estimatedHours}h estimated`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attachments */}
          {mockTask.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attachments ({mockTask.attachments.length})
                  </Typography>
                  
                  <List dense>
                    {mockTask.attachments.map((attachment) => (
                      <ListItem key={attachment.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'grey.100', color: 'text.primary', width: 32, height: 32 }}>
                            <AttachFile sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={attachment.name}
                          secondary={`${attachment.size} • ${format(attachment.uploadedAt, 'MMM dd')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>
      </Grid>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Task Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to change the task status to "{newStatus.replace('-', ' ')}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetails;
