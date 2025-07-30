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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Share,
  Delete,
  Edit,
  MoreVert,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  Description,
  Person,
  CalendarToday,
  Folder,
  Visibility,
  CloudDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrHR } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Mock document data - in real app, this would come from API
  useEffect(() => {
    const mockDocument = {
      id: parseInt(id),
      title: 'Employee Handbook 2024',
      description: 'Comprehensive guide covering company policies, procedures, benefits, and workplace guidelines for all employees.',
      fileName: 'employee-handbook-2024.pdf',
      fileSize: '2.4 MB',
      fileType: 'application/pdf',
      category: 'Policy',
      tags: ['handbook', 'policies', 'guidelines', 'HR'],
      uploadedBy: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        position: 'HR Specialist',
        profilePicture: null,
      },
      uploadedDate: new Date(2024, 0, 15),
      lastModified: new Date(2024, 0, 20),
      version: '1.2',
      status: 'active',
      downloadCount: 45,
      accessLevel: 'all_employees',
      departments: ['All Departments'],
      expiryDate: new Date(2024, 11, 31),
      approvedBy: 'HR Manager',
      approvalDate: new Date(2024, 0, 16),
      relatedDocuments: [
        { id: 2, title: 'Code of Conduct', type: 'Policy' },
        { id: 3, title: 'Benefits Guide', type: 'Benefits' },
        { id: 4, title: 'IT Security Policy', type: 'Policy' },
      ],
      downloadHistory: [
        { user: 'John Doe', date: new Date(2024, 0, 25), department: 'IT' },
        { user: 'Mike Johnson', date: new Date(2024, 0, 24), department: 'Sales' },
        { user: 'Sarah Wilson', date: new Date(2024, 0, 23), department: 'Marketing' },
      ],
    };
    
    setTimeout(() => {
      setDocument(mockDocument);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <PictureAsPdf sx={{ color: 'error.main' }} />;
    if (fileType.includes('image')) return <Image sx={{ color: 'success.main' }} />;
    if (fileType.includes('word') || fileType.includes('document')) return <Description sx={{ color: 'primary.main' }} />;
    return <InsertDriveFile sx={{ color: 'text.secondary' }} />;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Policy':
        return 'error';
      case 'Benefits':
        return 'success';
      case 'Training':
        return 'primary';
      case 'Legal':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'archived':
        return 'default';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleActionClick = (event) => {
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
  };

  const handleDownload = () => {
    // In real app, this would trigger file download
    console.log('Downloading document:', document.fileName);
    setDocument(prev => ({
      ...prev,
      downloadCount: prev.downloadCount + 1,
    }));
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleActionClose();
  };

  const confirmDelete = () => {
    // In real app, this would make API call to delete document
    console.log('Deleting document:', document.id);
    setDeleteDialogOpen(false);
    navigate('/documents');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading document details...</Typography>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Document not found</Typography>
        <Button onClick={() => navigate('/documents')} sx={{ mt: 2 }}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/documents')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Document Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => setShareDialogOpen(true)}
          >
            Share
          </Button>
          {(isAdminOrHR() || document.uploadedBy.id === user.id) && (
            <IconButton onClick={handleActionClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Document Details Card */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ mr: 2, mt: 1 }}>
                    {getFileIcon(document.fileType)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {document.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {document.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        label={document.status}
                        color={getStatusColor(document.status)}
                        size="small"
                      />
                      <Chip
                        label={document.category}
                        color={getCategoryColor(document.category)}
                        size="small"
                      />
                      <Chip
                        label={`v${document.version}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        File Name
                      </Typography>
                      <Typography variant="body1">
                        {document.fileName}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        File Size
                      </Typography>
                      <Typography variant="body1">
                        {document.fileSize}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Access Level
                      </Typography>
                      <Typography variant="body1">
                        {document.accessLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Download Count
                      </Typography>
                      <Typography variant="body1">
                        {document.downloadCount} downloads
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Expiry Date
                      </Typography>
                      <Typography variant="body1">
                        {format(document.expiryDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Approved By
                      </Typography>
                      <Typography variant="body1">
                        {document.approvedBy}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {document.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Related Documents
                </Typography>
                <List>
                  {document.relatedDocuments.map((relatedDoc) => (
                    <ListItem
                      key={relatedDoc.id}
                      button
                      onClick={() => navigate(`/documents/${relatedDoc.id}`)}
                      sx={{ borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <InsertDriveFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={relatedDoc.title}
                        secondary={relatedDoc.type}
                      />
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Upload Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {document.uploadedBy.firstName[0]}{document.uploadedBy.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.uploadedBy.position}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded Date
                  </Typography>
                  <Typography variant="body1">
                    {format(document.uploadedDate, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body1">
                    {format(document.lastModified, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Approval Date
                  </Typography>
                  <Typography variant="body1">
                    {format(document.approvalDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Downloads */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Downloads
                </Typography>
                <List dense>
                  {document.downloadHistory.slice(0, 5).map((download, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CloudDownload fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={download.user}
                        secondary={`${download.department} • ${format(download.date, 'MMM dd, HH:mm')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleActionClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Document
        </MenuItem>
        <MenuItem onClick={handleActionClose}>
          <Folder sx={{ mr: 1 }} />
          Move to Folder
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Document
        </MenuItem>
      </Menu>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share "{document.title}" with others
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share functionality would be implemented here, allowing users to share documents via email or generate shareable links.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this document?
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
            <Typography variant="subtitle2">
              {document.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.fileName} • {document.fileSize}
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. The document will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDetails;
