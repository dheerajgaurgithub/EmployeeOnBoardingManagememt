import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Save, Cancel, Assignment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      category: 'other',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedHours: '',
      tags: [],
    },
  });

  // Mock employees data - in real app, this would come from API
  const mockEmployees = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'IT' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'HR' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Finance' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'Marketing' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'info' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'urgent', label: 'Urgent', color: 'error' },
  ];

  const categories = [
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'training', label: 'Training' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'setup', label: 'Setup' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
  ];

  const suggestedTags = [
    'urgent',
    'new-employee',
    'training',
    'documentation',
    'setup',
    'meeting',
    'review',
    'approval',
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating task:', data);
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Assignment sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Create New Task
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Assign a new task to team members with detailed instructions.
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Task Title */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      placeholder="Enter a clear and descriptive task title"
                      {...register('title', {
                        required: 'Task title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters',
                        },
                      })}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  </Grid>

                  {/* Task Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Provide detailed instructions and requirements for this task"
                      multiline
                      rows={4}
                      {...register('description', {
                        required: 'Task description is required',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters',
                        },
                      })}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  </Grid>

                  {/* Assigned To */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.assignedTo}>
                      <InputLabel>Assign To</InputLabel>
                      <Controller
                        name="assignedTo"
                        control={control}
                        rules={{ required: 'Please select an employee' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Assign To"
                          >
                            {mockEmployees.map((employee) => (
                              <MenuItem key={employee.id} value={employee.id}>
                                <Box>
                                  <Typography variant="body2">
                                    {employee.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {employee.email} • {employee.department}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.assignedTo && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.assignedTo.message}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Priority"
                          >
                            {priorities.map((priority) => (
                              <MenuItem key={priority.value} value={priority.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip
                                    label={priority.label}
                                    color={priority.color}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                  {priority.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  {/* Category */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Category"
                          >
                            {categories.map((category) => (
                              <MenuItem key={category.value} value={category.value}>
                                {category.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  {/* Due Date */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dueDate"
                      control={control}
                      rules={{ required: 'Due date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          label="Due Date"
                          value={field.value}
                          onChange={field.onChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.dueDate}
                              helperText={errors.dueDate?.message}
                            />
                          )}
                          minDate={new Date()}
                        />
                      )}
                    />
                  </Grid>

                  {/* Estimated Hours */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Estimated Hours"
                      type="number"
                      placeholder="How many hours will this task take?"
                      {...register('estimatedHours', {
                        min: {
                          value: 0.5,
                          message: 'Minimum 0.5 hours',
                        },
                        max: {
                          value: 40,
                          message: 'Maximum 40 hours',
                        },
                      })}
                      error={!!errors.estimatedHours}
                      helperText={errors.estimatedHours?.message}
                      inputProps={{
                        step: 0.5,
                        min: 0.5,
                        max: 40,
                      }}
                    />
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          multiple
                          options={suggestedTags}
                          freeSolo
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                                key={index}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Tags"
                              placeholder="Add tags to categorize this task"
                            />
                          )}
                          onChange={(_, value) => field.onChange(value)}
                        />
                      )}
                    />
                  </Grid>

                  {/* Task Preview */}
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Task Preview
                      </Typography>
                      <Typography variant="body2">
                        <strong>Title:</strong> {watch('title') || 'Enter task title'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Assigned to:</strong> {
                          mockEmployees.find(emp => emp.id === watch('assignedTo'))?.name || 'Select employee'
                        }
                      </Typography>
                      <Typography variant="body2">
                        <strong>Priority:</strong> {watch('priority')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Due:</strong> {watch('dueDate') ? watch('dueDate').toLocaleDateString() : 'Select date'}
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        loading={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                        }}
                      >
                        {loading ? 'Creating...' : 'Create Task'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateTask;
