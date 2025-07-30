import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,

} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Assignment,
  Comment,
  AttachFile,
  CalendarToday,
  TrendingUp,
  School,
  Group,
  Computer,
  Description,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays, addDays } from 'date-fns';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';

const MyOnboarding = () => {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock onboarding data - in real app, this would come from API
  useEffect(() => {
    const mockOnboarding = {
      id: 1,
      title: 'Software Developer Onboarding',
      description: 'Welcome to the team! This onboarding process will help you get up to speed with our company culture, tools, and processes.',
      status: 'in_progress',
      startDate: new Date(2024, 1, 15),
      expectedCompletionDate: new Date(2024, 2, 15),
      progress: 65,
      currentStep: 2,
      assignedBy: {
        firstName: 'Jane',
        lastName: 'Smith',
        position: 'HR Specialist',
      },
      tasks: [
        {
          id: 1,
          title: 'Complete HR Documentation',
          description: 'Fill out all required HR forms including tax documents, emergency contacts, and benefits enrollment.',
          category: 'Documentation',
          status: 'completed',
          dueDate: new Date(2024, 1, 17),
          completedDate: new Date(2024, 1, 16),
          assignedTo: 'Employee',
          estimatedHours: 2,
          actualHours: 1.5,
          comments: 'All forms completed successfully',
          priority: 'high',
        },
        {
          id: 2,
          title: 'IT Setup and Access',
          description: 'Receive laptop, set up email account, and get access to necessary systems and tools.',
          category: 'Technical',
          status: 'completed',
          dueDate: new Date(2024, 1, 18),
          completedDate: new Date(2024, 1, 17),
          assignedTo: 'IT Team',
          estimatedHours: 4,
          actualHours: 3,
          comments: 'All systems configured and working properly',
          priority: 'high',
        },
        {
          id: 3,
          title: 'Security Training',
          description: 'Complete mandatory security awareness training and cybersecurity best practices course.',
          category: 'Training',
          status: 'in_progress',
          dueDate: new Date(2024, 1, 20),
          completedDate: null,
          assignedTo: 'Employee',
          estimatedHours: 3,
          actualHours: 1.5,
          comments: 'Training module 2 of 4 completed',
          priority: 'high',
        },
        {
          id: 4,
          title: 'Team Introduction Meeting',
          description: 'Meet with team members, understand project structure, and learn about ongoing initiatives.',
          category: 'Integration',
          status: 'pending',
          dueDate: new Date(2024, 1, 22),
          completedDate: null,
          assignedTo: 'Team Lead',
          estimatedHours: 2,
          actualHours: 0,
          comments: '',
          priority: 'medium',
        },
        {
          id: 5,
          title: 'Development Environment Setup',
          description: 'Configure development tools, IDE, version control, and local development environment.',
          category: 'Technical',
          status: 'pending',
          dueDate: new Date(2024, 1, 25),
          completedDate: null,
          assignedTo: 'Senior Developer',
          estimatedHours: 4,
          actualHours: 0,
          comments: '',
          priority: 'medium',
        },
        {
          id: 6,
          title: 'Company Culture Workshop',
          description: 'Attend workshop on company values, culture, and communication practices.',
          category: 'Orientation',
          status: 'pending',
          dueDate: new Date(2024, 1, 28),
          completedDate: null,
          assignedTo: 'HR Team',
          estimatedHours: 3,
          actualHours: 0,
          comments: '',
          priority: 'low',
        },
      ],
      milestones: [
        { id: 1, title: 'Documentation Complete', date: new Date(2024, 1, 17), completed: true },
        { id: 2, title: 'Technical Setup Complete', date: new Date(2024, 1, 20), completed: true },
        { id: 3, title: 'Training Complete', date: new Date(2024, 1, 25), completed: false },
        { id: 4, title: 'Team Integration Complete', date: new Date(2024, 2, 1), completed: false },
        { id: 5, title: 'Full Productivity', date: new Date(2024, 2, 15), completed: false },
      ],
      upcomingEvents: [
        { id: 1, title: 'Team Standup Meeting', date: new Date(2024, 1, 21), type: 'meeting' },
        { id: 2, title: 'Security Training Deadline', date: new Date(2024, 1, 20), type: 'deadline' },
        { id: 3, title: 'Welcome Lunch', date: new Date(2024, 1, 23), type: 'social' },
      ],
    };
    
    setTimeout(() => {
      setOnboarding(mockOnboarding);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Documentation':
        return 'primary';
      case 'Technical':
        return 'secondary';
      case 'Training':
        return 'success';
      case 'Integration':
        return 'warning';
      case 'Orientation':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Documentation':
        return <Description />;
      case 'Technical':
        return <Computer />;
      case 'Training':
        return <School />;
      case 'Integration':
        return <Group />;
      case 'Orientation':
        return <TrendingUp />;
      default:
        return <Assignment />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleTaskComplete = (taskId) => {
    setOnboarding(prev => {
      const updatedTasks = prev.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed',
              completedDate: new Date(),
              actualHours: task.estimatedHours, // Default to estimated
            }
          : task
      );
      
      const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
      const newProgress = (completedTasks / updatedTasks.length) * 100;
      
      // Show celebration if task completion brings progress to a milestone
      if (newProgress >= 75 && prev.progress < 75) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      return {
        ...prev,
        tasks: updatedTasks,
        progress: newProgress,
      };
    });
  };

  const handleAddComment = (task) => {
    setSelectedTask(task);
    setComment(task.comments || '');
    setCommentDialogOpen(true);
  };

  const saveComment = () => {
    if (selectedTask) {
      setOnboarding(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, comments: comment }
            : task
        ),
      }));
    }
    setCommentDialogOpen(false);
    setComment('');
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading your onboarding progress...</Typography>
      </Box>
    );
  }

  if (!onboarding) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">No onboarding process assigned</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Contact HR if you believe this is an error.
        </Typography>
      </Box>
    );
  }

  const completedTasks = onboarding.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = onboarding.tasks.length;
  const pendingTasks = onboarding.tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
  const daysRemaining = differenceInDays(onboarding.expectedCompletionDate, new Date());

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.firstName}! 👋
            </Typography>
            <Typography variant="h6" gutterBottom>
              {onboarding.title}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {onboarding.description}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Celebration Alert */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Alert severity="success" sx={{ mb: 3 }}>
            🎉 Great progress! You're doing amazing on your onboarding journey!
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Progress
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main" gutterBottom>
                        {Math.round(onboarding.progress)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main" gutterBottom>
                        {completedTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasks Done
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color={daysRemaining > 0 ? 'warning.main' : 'error.main'} gutterBottom>
                        {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Left
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedTasks} of {totalTasks} tasks
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={onboarding.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Tasks
                </Typography>
                
                <List>
                  {onboarding.tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      sx={{
                        border: 1,
                        borderColor: task.status === 'completed' ? 'success.light' : 'grey.200',
                        borderRadius: 1,
                        mb: 2,
                        bgcolor: task.status === 'completed' ? 'success.50' : 'background.paper',
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={task.status === 'completed'}
                          onChange={() => task.status !== 'completed' && handleTaskComplete(task.id)}
                          disabled={task.status === 'completed' || task.assignedTo !== 'Employee'}
                        />
                      </ListItemIcon>
                      
                      <ListItemIcon>
                        {getCategoryIcon(task.category)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1">
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.category}
                              color={getCategoryColor(task.category)}
                              size="small"
                            />
                            <Chip
                              label={task.status}
                              color={getStatusColor(task.status)}
                              size="small"
                            />
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="text.secondary">
                                📅 Due: {format(task.dueDate, 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                👤 {task.assignedTo}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ⏱️ {task.estimatedHours}h estimated
                              </Typography>
                            </Box>
                            {task.comments && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'primary.main' }}>
                                💬 "{task.comments}"
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleAddComment(task)}
                          size="small"
                        >
                          <Comment />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Milestones
                </Typography>
                <Timeline>
                  {onboarding.milestones.map((milestone, index) => (
                    <TimelineItem key={milestone.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={milestone.completed ? 'success' : 'grey'}
                        >
                          {milestone.completed ? <CheckCircle /> : <RadioButtonUnchecked />}
                        </TimelineDot>
                        {index < onboarding.milestones.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2" color={milestone.completed ? 'success.main' : 'text.primary'}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(milestone.date, 'MMM dd, yyyy')}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                <List dense>
                  {onboarding.upcomingEvents.map((event) => (
                    <ListItem key={event.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={format(event.date, 'MMM dd, yyyy')}
                      />
                      <Chip
                        label={event.type}
                        size="small"
                        color={event.type === 'deadline' ? 'error' : 'primary'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {format(onboarding.startDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expected Completion
                  </Typography>
                  <Typography variant="body1">
                    {format(onboarding.expectedCompletionDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Assigned By
                  </Typography>
                  <Typography variant="body1">
                    {onboarding.assignedBy.firstName} {onboarding.assignedBy.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {onboarding.assignedBy.position}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
                  </Typography>
                  <Typography variant="body1" color="warning.main">
                    {pendingTasks.length} remaining
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Comment - {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
            placeholder="Share your progress, ask questions, or provide updates..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveComment} variant="contained">
            Save Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyOnboarding;
