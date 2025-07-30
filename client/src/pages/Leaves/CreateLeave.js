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
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Save, Cancel, EventNote } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { differenceInDays } from 'date-fns';

const CreateLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      leaveType: 'vacation',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'morning',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
      workHandover: {
        handedOverTo: '',
        instructions: '',
      },
    },
  });

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'bereavement', label: 'Bereavement Leave' },
    { value: 'other', label: 'Other' },
  ];

  const halfDayPeriods = [
    { value: 'morning', label: 'Morning (AM)' },
    { value: 'afternoon', label: 'Afternoon (PM)' },
  ];

  // Mock employees for handover
  const mockEmployees = [
    { id: 1, name: 'John Doe', email: 'john@company.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com' },
  ];

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDays = () => {
    if (startDate && endDate) {
      if (isHalfDay) return 0.5;
      const days = differenceInDays(endDate, startDate) + 1;
      return Math.max(0, days);
    }
    return 0;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const leaveData = {
        ...data,
        totalDays: calculateDays(),
        isHalfDay,
      };
      
      console.log('Creating leave request:', leaveData);
      toast.success('Leave request submitted successfully!');
      navigate('/leaves');
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/leaves');
  };

  const handleHalfDayChange = (checked) => {
    setIsHalfDay(checked);
    if (checked) {
      setValue('endDate', startDate);
    }
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
            <EventNote sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Request Leave
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Submit a new leave request for approval.
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
                  {/* Leave Type */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.leaveType}>
                      <InputLabel>Leave Type</InputLabel>
                      <Controller
                        name="leaveType"
                        control={control}
                        rules={{ required: 'Leave type is required' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Leave Type"
                          >
                            {leaveTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.leaveType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.leaveType.message}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Half Day Checkbox */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isHalfDay}
                            onChange={(e) => handleHalfDayChange(e.target.checked)}
                          />
                        }
                        label="Half Day Leave"
                      />
                    </Box>
                  </Grid>

                  {/* Start Date */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="startDate"
                      control={control}
                      rules={{ required: 'Start date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date"
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date);
                            if (isHalfDay) {
                              setValue('endDate', date);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.startDate}
                              helperText={errors.startDate?.message}
                            />
                          )}
                          minDate={new Date()}
                        />
                      )}
                    />
                  </Grid>

                  {/* End Date */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="endDate"
                      control={control}
                      rules={{ required: 'End date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          label="End Date"
                          value={field.value}
                          onChange={field.onChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.endDate}
                              helperText={errors.endDate?.message}
                            />
                          )}
                          minDate={startDate}
                          disabled={isHalfDay}
                        />
                      )}
                    />
                  </Grid>

                  {/* Half Day Period */}
                  {isHalfDay && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Half Day Period</InputLabel>
                        <Controller
                          name="halfDayPeriod"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="Half Day Period"
                            >
                              {halfDayPeriods.map((period) => (
                                <MenuItem key={period.value} value={period.value}>
                                  {period.label}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>
                  )}

                  {/* Total Days Display */}
                  <Grid item xs={12} md={6}>
                    <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
                      <Typography variant="body2">
                        <strong>Total Days:</strong> {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Reason */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason for Leave"
                      placeholder="Please provide a detailed reason for your leave request"
                      multiline
                      rows={4}
                      {...register('reason', {
                        required: 'Reason is required',
                        minLength: {
                          value: 10,
                          message: 'Reason must be at least 10 characters',
                        },
                      })}
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Emergency Contact (Optional)
                      </Typography>
                    </Divider>
                  </Grid>

                  {/* Emergency Contact */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      {...register('emergencyContact.name')}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Relationship"
                      {...register('emergencyContact.relationship')}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('emergencyContact.phone')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Work Handover (Optional)
                      </Typography>
                    </Divider>
                  </Grid>

                  {/* Work Handover */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Hand Over To</InputLabel>
                      <Controller
                        name="workHandover.handedOverTo"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Hand Over To"
                          >
                            {mockEmployees.map((employee) => (
                              <MenuItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {/* Placeholder for spacing */}
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Handover Instructions"
                      placeholder="Provide instructions for work handover during your absence"
                      multiline
                      rows={3}
                      {...register('workHandover.instructions')}
                    />
                  </Grid>

                  {/* Leave Request Preview */}
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Leave Request Summary
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {leaveTypes.find(t => t.value === watch('leaveType'))?.label}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                        {isHalfDay && ` (${watch('halfDayPeriod')})`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Dates:</strong> {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
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
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                        }}
                      >
                        {loading ? 'Submitting...' : 'Submit Request'}
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

export default CreateLeave;
