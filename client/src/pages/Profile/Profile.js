import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Edit,
  Email,
  Phone,
  LocationOn,
  Business,
  Work,
  CalendarToday,
  Person,
  Lock,
  Save,
  Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        phone: user?.emergencyContact?.phone || '',
        email: user?.emergencyContact?.email || '',
      },
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setEditMode(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await updatePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      setPasswordDialogOpen(false);
      resetPassword();
    }
  };

  const handleEditCancel = () => {
    reset();
    setEditMode(false);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your personal information and account settings.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={user?.profilePicture}
                    sx={{
                      width: 100,
                      height: 100,
                      mr: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {user?.position} • {user?.department}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={user?.role?.toUpperCase()}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={user?.employeeId}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={user?.onboardingStatus?.replace('-', ' ').toUpperCase()}
                        color={
                          user?.onboardingStatus === 'completed'
                            ? 'success'
                            : user?.onboardingStatus === 'in-progress'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                        disabled={editMode}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Lock />}
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile Tabs */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Personal Information" />
                <Tab label="Contact Details" />
                <Tab label="Emergency Contact" />
                <Tab label="Work Information" />
              </Tabs>

              {/* Personal Information Tab */}
              <TabPanel value={tabValue} index={0}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        {...register('firstName', {
                          required: 'First name is required',
                        })}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        {...register('lastName', {
                          required: 'Last name is required',
                        })}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        {...register('dateOfBirth')}
                        InputLabelProps={{ shrink: true }}
                        disabled={!editMode}
                      />
                    </Grid>
                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Save />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </TabPanel>

              {/* Contact Details Tab */}
              <TabPanel value={tabValue} index={1}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        {...register('phone')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Address
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        {...register('address.street')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        {...register('address.city')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State"
                        {...register('address.state')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP Code"
                        {...register('address.zipCode')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        {...register('address.country')}
                        disabled={!editMode}
                      />
                    </Grid>
                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Save />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </TabPanel>

              {/* Emergency Contact Tab */}
              <TabPanel value={tabValue} index={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Name"
                        {...register('emergencyContact.name')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Relationship"
                        {...register('emergencyContact.relationship')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        {...register('emergencyContact.phone')}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...register('emergencyContact.email')}
                        disabled={!editMode}
                      />
                    </Grid>
                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Save />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </TabPanel>

              {/* Work Information Tab */}
              <TabPanel value={tabValue} index={3}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Employee ID"
                      secondary={user?.employeeId}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={user?.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary="Position"
                      secondary={user?.position}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Start Date"
                      secondary={user?.startDate ? format(new Date(user.startDate), 'MMM dd, yyyy') : 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={user?.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    />
                  </ListItem>
                </List>
              </TabPanel>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              margin="normal"
              {...registerPassword('currentPassword', {
                required: 'Current password is required',
              })}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value, { newPassword }) =>
                  value === newPassword || 'Passwords do not match',
              })}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Update Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile;
