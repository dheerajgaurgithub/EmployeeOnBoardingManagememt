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
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  InsertDriveFile,
  Delete,
  CheckCircle,
  Error,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UploadDocument = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    accessLevel: 'all_employees',
    departments: [],
    tags: [],
    expiryDate: '',
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const categories = [
    'Policy',
    'Benefits',
    'Training',
    'Legal',
    'HR',
    'IT',
    'Safety',
    'Compliance',
    'Other',
  ];

  const accessLevels = [
    { value: 'all_employees', label: 'All Employees' },
    { value: 'department_only', label: 'Department Only' },
    { value: 'management_only', label: 'Management Only' },
    { value: 'hr_only', label: 'HR Only' },
    { value: 'admin_only', label: 'Admin Only' },
  ];

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

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const newFiles = droppedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (files.length === 0) {
      newErrors.files = 'At least one file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    return '📁';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update file statuses
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'uploaded',
      })));

      // In real app, this would make API call to save document
      console.log('Uploading document:', {
        ...formData,
        files: files.map(f => f.file),
        uploadedBy: user.id,
        uploadedDate: new Date(),
      });

      // Show success and redirect
      setTimeout(() => {
        navigate('/documents');
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
      })));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/documents')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Upload Document
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* File Upload Area */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Files
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px dashed',
                      borderColor: errors.files ? 'error.main' : 'grey.300',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'grey.50',
                      },
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Drop files here or click to browse
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images
                    </Typography>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      hidden
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                  </Paper>
                  {errors.files && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {errors.files}
                    </Typography>
                  )}
                </Grid>

                {/* File List */}
                {files.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Selected Files ({files.length})
                    </Typography>
                    <Paper variant="outlined">
                      <List>
                        {files.map((file, index) => (
                          <React.Fragment key={file.id}>
                            <ListItem>
                              <ListItemIcon>
                                <Box sx={{ fontSize: '1.5rem' }}>
                                  {getFileIcon(file.type)}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={file.name}
                                secondary={`${formatFileSize(file.size)} • ${file.type}`}
                              />
                              <ListItemSecondaryAction>
                                {file.status === 'uploaded' && (
                                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                                )}
                                {file.status === 'error' && (
                                  <Error sx={{ color: 'error.main', mr: 1 }} />
                                )}
                                <IconButton
                                  edge="end"
                                  onClick={() => handleFileRemove(file.id)}
                                  disabled={uploading}
                                >
                                  <Delete />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < files.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                )}

                {/* Document Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Document Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Document Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Category *"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.category}
                      </Typography>
                    )}
                  </FormControl>
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
                  <FormControl fullWidth>
                    <InputLabel>Access Level</InputLabel>
                    <Select
                      value={formData.accessLevel}
                      onChange={(e) => handleInputChange('accessLevel', e.target.value)}
                      label="Access Level"
                    >
                      {accessLevels.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiry Date (Optional)"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Departments (Optional)</InputLabel>
                    <Select
                      multiple
                      value={formData.departments}
                      onChange={(e) => handleInputChange('departments', e.target.value)}
                      label="Departments (Optional)"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Tags */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>

                {/* Upload Progress */}
                {uploading && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Uploading documents... Please don't close this page.
                    </Alert>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {uploadProgress}% complete
                    </Typography>
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/documents')}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<CloudUpload />}
                      disabled={uploading || files.length === 0}
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default UploadDocument;
