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
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const TaskList = () => {
  const { user, isAdminOrHR } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Mock data - in real app, this would come from API
  const mockTasks = [
    {
      id: 1,
      title: 'Complete employee profile setup',
      description: 'Fill out all required personal and professional information',
      assignedTo: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
      },
      assignedBy: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
      },
      status: 'pending',
      priority: 'high',
      category: 'onboarding',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: 'Attend orientation meeting',
      description: 'Join the company orientation session for new employees',
      assignedTo: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
      },
      assignedBy: {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
      },
      status: 'in-progress',
      priority: 'medium',
      category: 'meeting',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: 'Submit required documents',
      description: 'Upload all necessary documents for HR processing',
      assignedTo: {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Wilson',
        profilePicture: null,
      },
      assignedBy: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
      },
      status: 'completed',
      priority: 'high',
      category: 'documentation',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'in-progress':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'pending':
        return <Warning sx={{ color: 'grey.400' }} />;
      default:
        return <Assignment sx={{ color: 'grey.400' }} />;
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
        return 'error';
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (event, task) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedTask(null);
  };

  const filteredTasks = mockTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice(
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
              Tasks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track task assignments and progress.
            </Typography>
          </Box>
          {isAdminOrHR() && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/tasks/create')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Create Task
            </Button>
          )}
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
                  placeholder="Search tasks..."
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

      {/* Task Statistics */}
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
                  {mockTasks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {mockTasks.filter(t => t.status === 'in-progress').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockTasks.filter(t => t.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {mockTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Tasks Table */}
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
                  <TableCell>Task</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(task.status)}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.description.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={task.assignedTo.profilePicture}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        >
                          {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.replace('-', ' ')}
                        color={getStatusColor(task.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(task.dueDate, 'MMM dd, yyyy')}
                      </Typography>
                      {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                        <Typography variant="caption" color="error">
                          Overdue
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            task.status === 'completed' ? 100 :
                            task.status === 'in-progress' ? 50 :
                            0
                          }
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {task.status === 'completed' ? '100%' :
                           task.status === 'in-progress' ? '50%' :
                           '0%'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleActionClick(e, task)}
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
            count={filteredTasks.length}
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
          navigate(`/tasks/${selectedTask?.id}`);
          handleActionClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {(isAdminOrHR() || selectedTask?.assignedTo.id === user?.id) && (
          <MenuItem onClick={handleActionClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Task
          </MenuItem>
        )}
        {isAdminOrHR() && (
          <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Task
          </MenuItem>
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Tasks</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>My Tasks</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Pending</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>In Progress</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Completed</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Overdue</MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;
