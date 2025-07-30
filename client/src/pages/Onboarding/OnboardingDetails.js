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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  RadioButtonUnchecked,
  Assignment,
  Person,
  CalendarToday,
  Schedule,
  PlayArrow,
  Pause,
  Stop,
  Comment,
  AttachFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

const OnboardingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrHR } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');

  // Mock onboarding data - in real app, this would come from API
  useEffect(() => {
    const mockOnboarding = {
      id: parseInt(id),
      title: 'Software Developer Onboarding',
      description: 'Complete onboarding process for new software developers including technical setup, training, and team integration.',
      employee: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001',
        position: 'Software Developer',
        department: 'IT',
        startDate: new Date(2024, 1, 15),
        profilePicture: null,
      },
      assignedBy: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        position: 'HR Specialist',
      },
      status: 'in_progress',
      priority: 'high',
      startDate: new Date(2024, 1, 15),
      expectedCompletionDate: new Date(2024, 2, 15),
      actualCompletionDate: null,
      progress: 65,
      currentStep: 2,
      tasks: [
        {
          id: 1,
          title: 'Complete HR Documentation',
          description: 'Fill out all required HR forms and documentation',
          category: 'Documentation',
          status: 'completed',
          dueDate: new Date(2024, 1, 17),
          completedDate: new Date(2024, 1, 16),
          assignedTo: 'Employee',
          estimatedHours: 2,
          actualHours: 1.5,
          comments: 'All forms completed successfully',
          attachments: ['tax_forms.pdf', 'emergency_contact.pdf'],
        },
        {
          id: 2,
          title: 'IT Setup and Access',
          description: 'Set up laptop, email, and system access',
          category: 'Technical',
          status: 'completed',
          dueDate: new Date(2024, 1, 18),
          completedDate: new Date(2024, 1, 17),
          assignedTo: 'IT Team',
          estimatedHours: 4,
          actualHours: 3,
          comments: 'All systems configured and tested',
          attachments: ['system_access_guide.pdf'],
        },
        {
          id: 3,
          title: 'Security Training',
          description: 'Complete mandatory security awareness training',
          category: 'Training',
          status: 'in_progress',
          dueDate: new Date(2024, 1, 20),
          completedDate: null,
          assignedTo: 'Employee',
          estimatedHours: 3,
          actualHours: 1.5,
          comments: 'Training 50% complete',
          attachments: [],
        },
        {
          id: 4,
          title: 'Team Introduction Meeting',
          description: 'Meet with team members and understand project structure',
          category: 'Integration',
          status: 'pending',
          dueDate: new Date(2024, 1, 22),
          completedDate: null,
          assignedTo: 'Team Lead',
          estimatedHours: 2,
          actualHours: 0,
          comments: '',
          attachments: [],
        },
        {
          id: 5,
          title: 'Development Environment Setup',
          description: 'Configure development tools and environment',
          category: 'Technical',
          status: 'pending',
          dueDate: new Date(2024, 1, 25),
          completedDate: null,
          assignedTo: 'Senior Developer',
          estimatedHours: 4,
          actualHours: 0,
          comments: '',
          attachments: [],
        },
      ],
      milestones: [
        { id: 1, title: 'Documentation Complete', date: new Date(2024, 1, 17), completed: true },
        { id: 2, title: 'Technical Setup Complete', date: new Date(2024, 1, 20), completed: true },
        { id: 3, title: 'Training Complete', date: new Date(2024, 1, 25), completed: false },
        { id: 4, title: 'Team Integration Complete', date: new Date(2024, 2, 1), completed: false },
        { id: 5, title: 'Full Productivity', date: new Date(2024, 2, 15), completed: false },
      ],
    };
    
    setTimeout(() => {
      setOnboarding(mockOnboarding);
      setLoading(false);
    }, 1000);
  }, [id]);

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
      default:
        return 'default';
    }
  };

  const handleTaskStatusChange = (taskId, completed) => {
    setOnboarding(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: completed ? 'completed' : 'in_progress',
              completedDate: completed ? new Date() : null,
            }
          : task
      ),
    }));
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
        <Typography>Loading onboarding details...</Typography>
      </Box>
    );
  }

  if (!onboarding) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Onboarding process not found</Typography>
        <Button onClick={() => navigate('/onboarding')} sx={{ mt: 2 }}>
          Back to Onboarding
        </Button>
      </Box>
    );
  }

  const completedTasks = onboarding.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = onboarding.tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/onboarding')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Onboarding Details
        </Typography>
        {isAdminOrHR() && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/onboarding/${id}/edit`)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Onboarding Overview */}
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
                      {onboarding.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {onboarding.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={onboarding.status}
                        color={getStatusColor(onboarding.status)}
                        size="small"
                      />
                      <Chip
                        label={onboarding.priority}
                        color={getPriorityColor(onboarding.priority)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Progress Overview */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedTasks} of {totalTasks} tasks completed
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round(progressPercentage)}% complete
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1">
                          {format(onboarding.startDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Expected Completion
                        </Typography>
                        <Typography variant="body1">
                          {format(onboarding.expectedCompletionDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
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
                  Onboarding Tasks
                </Typography>
                <List>
                  {onboarding.tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        sx={{
                          border: 1,
                          borderColor: 'grey.200',
                          borderRadius: 1,
                          mb: 2,
                          bgcolor: task.status === 'completed' ? 'success.50' : 'background.paper',
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={task.status === 'completed'}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.checked)}
                            disabled={!isAdminOrHR() && task.assignedTo !== 'Employee'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Due: {format(task.dueDate, 'MMM dd, yyyy')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Assigned to: {task.assignedTo}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Est. {task.estimatedHours}h
                                </Typography>
                              </Box>
                              {task.comments && (
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  "{task.comments}"
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
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Employee Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {onboarding.employee.firstName[0]}{onboarding.employee.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {onboarding.employee.firstName} {onboarding.employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {onboarding.employee.position}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">
                    {onboarding.employee.employeeId}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {onboarding.employee.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {format(onboarding.employee.startDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Milestones
                </Typography>
                <Stepper orientation="vertical">
                  {onboarding.milestones.map((milestone) => (
                    <Step key={milestone.id} completed={milestone.completed}>
                      <StepLabel
                        StepIconComponent={milestone.completed ? CheckCircle : RadioButtonUnchecked}
                      >
                        <Typography variant="subtitle2">
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(milestone.date, 'MMM dd, yyyy')}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
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
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
            placeholder="Add your comment about this task..."
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

export default OnboardingDetails;
