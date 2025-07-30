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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Download,
  Visibility,
  Edit,
  Delete,
  CloudUpload,
  Description,
  PictureAsPdf,
  Image,
  VideoFile,
  InsertDriveFile,
  CheckCircle,
  Schedule,
  Block,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const DocumentList = () => {
  const { user, isAdminOrHR } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data - in real app, this would come from API
  const mockDocuments = [
    {
      id: 1,
      title: 'Employee Handbook 2024',
      description: 'Updated company policies and procedures',
      fileName: 'employee-handbook-2024.pdf',
      fileSize: 2048576, // 2MB
      fileType: 'application/pdf',
      category: 'policy',
      uploadedBy: {
        id: 1,
        firstName: 'HR',
        lastName: 'Admin',
        profilePicture: null,
      },
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'approved',
      isPublic: true,
      downloadCount: 45,
      tags: ['handbook', 'policies', '2024'],
    },
    {
      id: 2,
      title: 'Tax Form W-4',
      description: 'Employee withholding certificate',
      fileName: 'w4-form-john-doe.pdf',
      fileSize: 524288, // 512KB
      fileType: 'application/pdf',
      category: 'personal',
      uploadedBy: {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
      },
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      isPublic: false,
      downloadCount: 2,
      tags: ['tax', 'w4', 'personal'],
    },
    {
      id: 3,
      title: 'Project Proposal - Q1 2024',
      description: 'Marketing campaign proposal for first quarter',
      fileName: 'q1-marketing-proposal.docx',
      fileSize: 1048576, // 1MB
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      category: 'project',
      uploadedBy: {
        id: 3,
        firstName: 'Sarah',
        lastName: 'Wilson',
        profilePicture: null,
      },
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'approved',
      isPublic: true,
      downloadCount: 12,
      tags: ['proposal', 'marketing', 'q1'],
    },
  ];

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <PictureAsPdf sx={{ color: 'error.main' }} />;
    if (fileType.includes('image')) return <Image sx={{ color: 'info.main' }} />;
    if (fileType.includes('video')) return <VideoFile sx={{ color: 'warning.main' }} />;
    if (fileType.includes('word') || fileType.includes('document')) return <Description sx={{ color: 'primary.main' }} />;
    return <InsertDriveFile sx={{ color: 'grey.600' }} />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'rejected':
        return <Block sx={{ color: 'error.main' }} />;
      default:
        return <InsertDriveFile sx={{ color: 'grey.400' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'policy':
        return 'primary';
      case 'personal':
        return 'secondary';
      case 'project':
        return 'info';
      case 'training':
        return 'success';
      case 'legal':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (event, document) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDownload = (document) => {
    // In real app, this would trigger file download
    console.log('Downloading document:', document);
    handleActionClose();
  };

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadDialogOpen(false);
            setUploadProgress(0);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.description.toLowerCase().includes(searchLower) ||
      doc.fileName.toLowerCase().includes(searchLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const paginatedDocuments = filteredDocuments.slice(
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
              Document Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload, manage, and share documents securely.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleUpload}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Upload Document
          </Button>
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
                  placeholder="Search documents..."
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

      {/* Document Statistics */}
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
                  {mockDocuments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {mockDocuments.filter(d => d.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {mockDocuments.filter(d => d.isPublic).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Public Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {mockDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Downloads
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Documents Table */}
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
                  <TableCell>Document</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Downloads</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDocuments.map((document, index) => (
                  <motion.tr
                    key={document.id}
                    component={TableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(document.fileType)}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {document.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {document.fileName} • {formatFileSize(document.fileSize)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={document.category}
                        color={getCategoryColor(document.category)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={document.uploadedBy.profilePicture}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {document.uploadedBy.firstName[0]}{document.uploadedBy.lastName[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(document.uploadedAt, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(document.status)}
                        <Chip
                          label={document.status}
                          color={getStatusColor(document.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.downloadCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleActionClick(e, document)}
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
            count={filteredDocuments.length}
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
        <MenuItem onClick={() => handleDownload(selectedDocument)}>
          <Download sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/documents/${selectedDocument?.id}`);
          handleActionClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {(selectedDocument?.uploadedBy.id === user?.id || isAdminOrHR()) && (
          <MenuItem onClick={handleActionClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Document
          </MenuItem>
        )}
        {(selectedDocument?.uploadedBy.id === user?.id || isAdminOrHR()) && (
          <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Document
          </MenuItem>
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>My Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Public Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Pending Approval</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Policy Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Personal Documents</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Project Documents</MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploadProgress && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Document Title"
              placeholder="Enter document title"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="Enter document description"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2, py: 2 }}
            >
              <CloudUpload sx={{ mr: 1 }} />
              Choose File
              <input type="file" hidden />
            </Button>
            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialogOpen(false)}
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            Cancel
          </Button>
          <Button
            onClick={simulateUpload}
            variant="contained"
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
