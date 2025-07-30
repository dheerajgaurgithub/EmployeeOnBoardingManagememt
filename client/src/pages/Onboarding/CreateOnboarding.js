import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  Save,
  Preview,
  Assignment,
  Person,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CreateOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    position: '',
    priority: 'medium',
    expectedDuration: 30, // days
    assignedEmployee: '',
  });
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [errors, setErrors] = useState({});

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Documentation',
    assignedTo: 'Employee',
    estimatedHours: 1,
    dueOffset: 1, // days from start
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dayOffset: 7, // days from start
  });

  const departments = [
    'IT',
    'HR',
    'Sales',
    'Marketing',
    'Finance',
    'Operations',
    'Legal',
    'Customer Service',
  ];

  const positions = [
    'Software Developer',
    'Senior Developer',
    'Team Lead',
    'Project Manager',
    'HR Specialist',
    'Sales Representative',
    'Marketing Specialist',
    'Financial Analyst',
    'Operations Manager',
    'Legal Counsel',
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
  ];

  const taskCategories = [
    'Documentation',
    'Technical',
    'Training',
    'Integration',
    'Compliance',
    'Equipment',
    'Orientation',
  ];

  const assigneeOptions = [
    'Employee',
    'HR Team',
    'IT Team',
    'Direct Manager',
    'Team Lead',
    'Senior Developer',
    'Mentor',
  ];

  // Mock employees data
  const employees = [
    { id: 1, name: 'John Doe', position: 'Software Developer', department: 'IT' },
    { id: 2, name: 'Jane Smith', position: 'Marketing Specialist', department: 'Marketing' },
    { id: 3, name: 'Mike Johnson', position: 'Sales Representative', department: 'Sales' },
  ];

  const steps = [
    'Basic Information',
    'Tasks & Activities',
    'Milestones',
    'Review & Create',
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.position) newErrors.position = 'Position is required';
    } else if (activeStep === 1) {
      if (tasks.length === 0) newErrors.tasks = 'At least one task is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.description.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        dueDate: new Date(Date.now() + newTask.dueOffset * 24 * 60 * 60 * 1000),
      };
      
      if (editingTask) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? task : t));
        setEditingTask(null);
      } else {
        setTasks(prev => [...prev, task]);
      }
      
      setNewTask({
        title: '',
        description: '',
        category: 'Documentation',
        assignedTo: 'Employee',
        estimatedHours: 1,
        dueOffset: 1,
      });
      setTaskDialogOpen(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      category: task.category,
      assignedTo: task.assignedTo,
      estimatedHours: task.estimatedHours,
      dueOffset: task.dueOffset,
    });
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      const milestone = {
        id: Date.now(),
        ...newMilestone,
        date: new Date(Date.now() + newMilestone.dayOffset * 24 * 60 * 60 * 1000),
      };
      
      if (editingMilestone) {
        setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? milestone : m));
        setEditingMilestone(null);
      } else {
        setMilestones(prev => [...prev, milestone]);
      }
      
      setNewMilestone({
        title: '',
        description: '',
        dayOffset: 7,
      });
      setMilestoneDialogOpen(false);
    }
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      description: milestone.description,
      dayOffset: milestone.dayOffset,
    });
    setMilestoneDialogOpen(true);
  };

  const handleDeleteMilestone = (milestoneId) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      // In real app, this would make API call
      const onboardingData = {
        ...formData,
        tasks,
        milestones,
        createdBy: user.id,
        createdDate: new Date(),
        status: 'draft',
      };
      
      console.log('Creating onboarding process:', onboardingData);
      
      // Simulate API call
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Documentation': return 'primary';
      case 'Technical': return 'secondary';
      case 'Training': return 'success';
      case 'Integration': return 'warning';
      case 'Compliance': return 'error';
      default: return 'default';
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Onboarding Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  label="Department *"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.position}>
                <InputLabel>Position *</InputLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  label="Position *"
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
                {errors.position && (
                  <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.position}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Expected Duration (days)"
                value={formData.expectedDuration}
                onChange={(e) => handleInputChange('expectedDuration', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign to Employee (Optional)</InputLabel>
                <Select
                  value={formData.assignedEmployee}
                  onChange={(e) => handleInputChange('assignedEmployee', e.target.value)}
                  label="Assign to Employee (Optional)"
                >
                  <MenuItem value="">
                    <em>Select later</em>
                  </MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Onboarding Tasks ({tasks.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Add Task
              </Button>
            </Box>
            
            {errors.tasks && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.tasks}
              </Alert>
            )}
            
            <List>
              {tasks.map((task, index) => (
                <ListItem
                  key={task.id}
                  sx={{
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
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
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Due: Day {task.dueOffset}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Assigned to: {task.assignedTo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Est. {task.estimatedHours}h
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleEditTask(task)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTask(task.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assignment sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add tasks to define the onboarding process
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Milestones ({milestones.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setMilestoneDialogOpen(true)}
              >
                Add Milestone
              </Button>
            </Box>
            
            <List>
              {milestones.map((milestone) => (
                <ListItem
                  key={milestone.id}
                  sx={{
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <ListItemText
                    primary={milestone.title}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {milestone.description && (
                          <Typography variant="body2" color="text.secondary">
                            {milestone.description}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Target: Day {milestone.dayOffset}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleEditMilestone(milestone)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            {milestones.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No milestones added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add milestones to track progress
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Onboarding Process
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formData.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {formData.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={formData.department} size="small" />
                  <Chip label={formData.position} size="small" />
                  <Chip 
                    label={formData.priority} 
                    color={priorities.find(p => p.value === formData.priority)?.color}
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Expected Duration: {formData.expectedDuration} days
                </Typography>
              </CardContent>
            </Card>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Tasks ({tasks.length})
                </Typography>
                {tasks.slice(0, 3).map((task) => (
                  <Typography key={task.id} variant="body2" color="text.secondary">
                    • {task.title}
                  </Typography>
                ))}
                {tasks.length > 3 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {tasks.length - 3} more
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Milestones ({milestones.length})
                </Typography>
                {milestones.slice(0, 3).map((milestone) => (
                  <Typography key={milestone.id} variant="body2" color="text.secondary">
                    • {milestone.title} (Day {milestone.dayOffset})
                  </Typography>
                ))}
                {milestones.length > 3 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {milestones.length - 3} more
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/onboarding')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Create Onboarding Process
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                  >
                    Create Onboarding
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {taskCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                  label="Assigned To"
                >
                  {assigneeOptions.map((assignee) => (
                    <MenuItem key={assignee} value={assignee}>
                      {assignee}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Hours"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                inputProps={{ min: 0.5, step: 0.5 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Due Day (from start)"
                value={newTask.dueOffset}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueOffset: parseInt(e.target.value) }))}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTask} variant="contained">
            {editingTask ? 'Update' : 'Add'} Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog
        open={milestoneDialogOpen}
        onClose={() => setMilestoneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Milestone Title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description (Optional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Target Day (from start)"
                value={newMilestone.dayOffset}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dayOffset: parseInt(e.target.value) }))}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMilestoneDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMilestone} variant="contained">
            {editingMilestone ? 'Update' : 'Add'} Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateOnboarding;
