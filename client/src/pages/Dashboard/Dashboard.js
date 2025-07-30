import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  EventNote,
  Description,
  School,
  CheckCircle,
  Schedule,
  Warning,
  Notifications,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}30`,
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" color="success.main">
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const RecentActivity = ({ activities }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Notifications sx={{ mr: 1, color: 'primary.main' }} />
        Recent Activity
      </Typography>
      <List>
        {activities?.slice(0, 5).map((activity, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                {activity.type === 'task' && <Assignment sx={{ fontSize: 16 }} />}
                {activity.type === 'leave' && <EventNote sx={{ fontSize: 16 }} />}
                {activity.type === 'document' && <Description sx={{ fontSize: 16 }} />}
                {activity.type === 'onboarding' && <School sx={{ fontSize: 16 }} />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.title}
              secondary={activity.time}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const QuickActions = ({ user }) => {
  const actions = [
    {
      title: 'Create Task',
      description: 'Assign a new task',
      path: '/tasks/create',
      color: 'primary.main',
      roles: ['admin', 'hr'],
    },
    {
      title: 'Request Leave',
      description: 'Submit leave request',
      path: '/leaves/create',
      color: 'success.main',
      roles: ['employee', 'admin', 'hr'],
    },
    {
      title: 'Upload Document',
      description: 'Add new document',
      path: '/documents/upload',
      color: 'info.main',
      roles: ['employee', 'admin', 'hr'],
    },
    {
      title: 'View Onboarding',
      description: 'Check onboarding progress',
      path: user?.role === 'employee' ? '/my-onboarding' : '/onboarding',
      color: 'warning.main',
      roles: ['employee', 'admin', 'hr'],
    },
  ];

  const filteredActions = actions.filter(action =>
    action.roles.includes(user?.role)
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {filteredActions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: `1px solid ${action.color}20`,
                    '&:hover': {
                      bgcolor: `${action.color}05`,
                      borderColor: `${action.color}40`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => window.location.href = action.path}
                >
                  <Typography variant="subtitle2" color={action.color} gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, isAdminOrHR } = useAuth();

  // Mock data - in real app, these would come from API calls
  const mockStats = {
    totalEmployees: 156,
    activeTasks: 24,
    pendingLeaves: 8,
    documentsUploaded: 342,
  };

  const mockActivities = [
    {
      type: 'task',
      title: 'New task assigned: Complete onboarding documentation',
      time: '2 hours ago',
    },
    {
      type: 'leave',
      title: 'Leave request approved for John Doe',
      time: '4 hours ago',
    },
    {
      type: 'document',
      title: 'Employee handbook updated',
      time: '1 day ago',
    },
    {
      type: 'onboarding',
      title: 'Sarah Johnson completed IT setup',
      time: '2 days ago',
    },
  ];

  const mockTasks = [
    {
      id: 1,
      title: 'Complete employee profile',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'high',
    },
    {
      id: 2,
      title: 'Attend orientation meeting',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Submit required documents',
      status: 'completed',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: 'high',
    },
  ];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your team today.
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      {isAdminOrHR() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={mockStats.totalEmployees}
              icon={<People />}
              color="#667eea"
              trend="+12% from last month"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Tasks"
              value={mockStats.activeTasks}
              icon={<Assignment />}
              color="#48bb78"
              trend="+5% from last week"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Leaves"
              value={mockStats.pendingLeaves}
              icon={<EventNote />}
              color="#ed8936"
              trend="-3% from last month"
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Documents"
              value={mockStats.documentsUploaded}
              icon={<Description />}
              color="#4299e1"
              trend="+18% from last month"
              delay={0.4}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* My Tasks */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                  My Tasks
                </Typography>
                <List>
                  {mockTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                task.status === 'completed'
                                  ? 'success.main'
                                  : task.status === 'in-progress'
                                  ? 'warning.main'
                                  : 'grey.400',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle sx={{ fontSize: 16 }} />
                            ) : task.status === 'in-progress' ? (
                              <Schedule sx={{ fontSize: 16 }} />
                            ) : (
                              <Warning sx={{ fontSize: 16 }} />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{task.title}</Typography>
                              <Chip
                                label={task.priority}
                                size="small"
                                color={
                                  task.priority === 'high'
                                    ? 'error'
                                    : task.priority === 'medium'
                                    ? 'warning'
                                    : 'default'
                                }
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={`Due: ${format(task.dueDate, 'MMM dd, yyyy')}`}
                        />
                        <Chip
                          label={task.status}
                          size="small"
                          color={
                            task.status === 'completed'
                              ? 'success'
                              : task.status === 'in-progress'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </ListItem>
                      {index < mockTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" size="small" href="/tasks">
                    View All Tasks
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <RecentActivity activities={mockActivities} />
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <QuickActions user={user} />
          </motion.div>
        </Grid>

        {/* Onboarding Progress (for employees) */}
        {user?.role === 'employee' && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1, color: 'primary.main' }} />
                    My Onboarding Progress
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Overall Progress</Typography>
                      <Typography variant="body2" color="text.secondary">
                        75%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={75}
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    You're doing great! Complete the remaining steps to finish your onboarding.
                  </Typography>
                  <Button variant="contained" size="small" href="/my-onboarding">
                    Continue Onboarding
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
