import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL, authenticatedFetch } from '../services/api';

// Memoized components to reduce re-renders
const UserRow = React.memo(({ user, currentUser, onEdit, onDelete, onDeviceAccess, onGroupAccess }) => (
  <TableRow key={user.id}>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ mr: 2 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle2">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Chip
        label={user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : user.role === 'operator' ? 'Operator' : 'Viewer'}
        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : user.role === 'operator' ? 'info' : 'default'}
        size="small"
      />
    </TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>
      <Chip
        label={user.isActive ? 'Active' : 'Inactive'}
        color={user.isActive ? 'success' : 'default'}
        size="small"
      />
    </TableCell>
    <TableCell>
      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Edit User">
          <IconButton size="small" onClick={() => onEdit(user)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Grant Device Group Access">
          <IconButton size="small" onClick={() => onGroupAccess(user)}>
            <GroupIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Grant Individual Device Access">
          <IconButton size="small" onClick={() => onDeviceAccess(user)}>
            <DevicesIcon />
          </IconButton>
        </Tooltip>
        {user.id !== currentUser?.id && (
          <Tooltip title="Delete User">
            <IconButton size="small" onClick={() => onDelete(user.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));

const GroupCard = React.memo(({ group, onEdit, onDelete, onManageDevices }) => (
  <Grid item xs={12} md={6} lg={4} key={group.id}>
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: group.color,
                mr: 1
              }}
            />
            <Typography variant="h6">{group.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => onEdit(group)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(group.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {group.description || 'No description'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Created by {group.creator?.firstName} {group.creator?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.devices?.length || 0} devices
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DevicesIcon />}
          onClick={() => onManageDevices(group)}
          fullWidth
        >
          Manage Devices
        </Button>
      </CardContent>
    </Card>
  </Grid>
));

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({ users: [], deviceGroups: [], devices: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states - consolidated to reduce memory
  const [dialogs, setDialogs] = useState({
    user: false,
    group: false,
    deviceAccess: false,
    groupAccess: false,
    groupManagement: false
  });

  const [selectedItems, setSelectedItems] = useState({
    user: null,
    group: null,
    userForGroupAccess: null
  });

  const [forms, setForms] = useState({
    user: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'viewer',
      permissions: { menus: ['dashboard'], devices: [], deviceGroups: [] }
    },
    group: { name: '', description: '', color: '#1976d2' },
    deviceAccess: { deviceId: '', accessLevel: 'read', expiresAt: '' },
    groupAccess: { groupId: '', accessLevel: 'read', expiresAt: '' },
    groupDevice: { deviceId: '' }
  });

  // Memoized constants
  const availableMenus = useMemo(() => [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'devices', label: 'Devices' },
    { value: 'mapping', label: 'Mapping' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'data', label: 'Data Table' },
    { value: 'alerts', label: 'Alerts' },
    { value: 'settings', label: 'Settings' },
    { value: 'export', label: 'Data Export' },
    { value: 'demo', label: 'Offline Demo' },
    { value: 'user-management', label: 'User Management' }
  ], []);

  const roles = useMemo(() => [
    { value: 'admin', label: 'Administrator', color: 'error' },
    { value: 'manager', label: 'Manager', color: 'warning' },
    { value: 'operator', label: 'Operator', color: 'info' },
    { value: 'viewer', label: 'Viewer', color: 'default' }
  ], []);

  const accessLevels = useMemo(() => [
    { value: 'read', label: 'Read Only', color: 'default' },
    { value: 'write', label: 'Read & Write', color: 'info' },
    { value: 'admin', label: 'Full Access', color: 'error' }
  ], []);

  // Helper functions
  // const getAuthHeaders = () => {
  //   return {
  //     'Content-Type': 'application/json'
  //   };
  // };

  // Define fetchUsers before loadData
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        credentials: 'include' // Include cookies in the request
      });
      
      if (response.ok) {
        const users = await response.json();
        return { ok: true, data: users };
      } else {
        console.error('Failed to fetch users:', response.status);
        return { ok: false, data: [] };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return { ok: false, data: [] };
    }
  }, []);

  // Data loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersRes, groupsRes, devicesRes] = await Promise.all([
        fetchUsers(),
        authenticatedFetch(`/api/device-groups`).catch(err => ({ ok: false, error: err })),
        authenticatedFetch(`/api/devices`).catch(err => ({ ok: false, error: err }))
      ]);

      const newData = { users: [], deviceGroups: [], devices: [] };

      if (usersRes.ok) {
        newData.users = usersRes.data;
      }
      
      if (groupsRes.ok) {
        newData.deviceGroups = await groupsRes.json();
      }
      
      if (devicesRes.ok) {
        newData.devices = await devicesRes.json();
      }

      setData(newData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form handlers - Define these before useEffect hooks that use them
  const resetForm = useCallback((formType) => {
    const defaultForms = {
      user: {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'viewer',
        permissions: { menus: ['dashboard'], devices: [], deviceGroups: [] }
      },
      group: { name: '', description: '', color: '#1976d2' },
      deviceAccess: { deviceId: '', accessLevel: 'read', expiresAt: '' },
      groupAccess: { groupId: '', accessLevel: 'read', expiresAt: '' },
      groupDevice: { deviceId: '' }
    };
    setForms(prev => ({ ...prev, [formType]: defaultForms[formType] }));
  }, []);

  // Populate form when editing a user
  useEffect(() => {
    if (selectedItems.user) {
      // Populate form with existing user data
      setForms(prev => ({
        ...prev,
        user: {
          username: selectedItems.user.username || '',
          email: selectedItems.user.email || '',
          password: '', // Don't populate password for security
          firstName: selectedItems.user.firstName || '',
          lastName: selectedItems.user.lastName || '',
          role: selectedItems.user.role || 'viewer',
          permissions: selectedItems.user.permissions || { menus: ['dashboard'], devices: [], deviceGroups: [] }
        }
      }));
    } else {
      // Reset form when not editing
      resetForm('user');
    }
  }, [selectedItems.user, resetForm]);

  // Populate form when editing a device group
  useEffect(() => {
    if (selectedItems.group) {
      // Populate form with existing group data
      setForms(prev => ({
        ...prev,
        group: {
          name: selectedItems.group.name || '',
          description: selectedItems.group.description || '',
          color: selectedItems.group.color || '#1976d2'
        }
      }));
    } else {
      // Reset form when not editing
      resetForm('group');
    }
  }, [selectedItems.group, resetForm]);

  // Dialog handlers
  const openDialog = useCallback((dialogType, item = null) => {
    setDialogs(prev => ({ ...prev, [dialogType]: true }));
    
    // Map dialog types to selectedItems keys
    let selectedItemKey = dialogType;
    if (dialogType === 'userForGroupAccess') {
      selectedItemKey = 'userForGroupAccess';
    } else if (dialogType === 'groupManagement') {
      selectedItemKey = 'group';
    }
    
    setSelectedItems(prev => ({ ...prev, [selectedItemKey]: item }));
  }, []);

  const closeDialog = useCallback((dialogType) => {
    setDialogs(prev => ({ ...prev, [dialogType]: false }));
    setSelectedItems(prev => ({ ...prev, [dialogType === 'userForGroupAccess' ? 'userForGroupAccess' : dialogType]: null }));
  }, []);

  // Form handlers
  const updateForm = useCallback((formType, updates) => {
    setForms(prev => ({
      ...prev,
      [formType]: { ...prev[formType], ...updates }
    }));
  }, []);

  // Action handlers
  const handleUserSubmit = useCallback(async () => {
    try {
      const url = selectedItems.user ? `${BASE_URL}/api/users/${selectedItems.user.id}` : `${BASE_URL}/api/users`;
      const method = selectedItems.user ? 'PUT' : 'POST';
      
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(forms.user)
      });

      if (response.ok) {
        setSuccess(selectedItems.user ? 'User updated successfully' : 'User created successfully');
        closeDialog('user');
        resetForm('user');
        loadData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save user');
      }
    } catch (error) {
      setError('Failed to save user');
    }
  }, [fetchUsers]);

  const handleGroupSubmit = useCallback(async () => {
    try {
      const url = selectedItems.group ? `${BASE_URL}/api/device-groups/${selectedItems.group.id}` : `${BASE_URL}/api/device-groups`;
      const method = selectedItems.group ? 'PUT' : 'POST';
      
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(forms.group)
      });

      if (response.ok) {
        setSuccess(selectedItems.group ? 'Group updated successfully' : 'Group created successfully');
        closeDialog('group');
        resetForm('group');
        loadData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save group');
      }
    } catch (error) {
      setError('Failed to save group');
    }
  }, [fetchUsers]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('User deleted successfully');
        loadData();
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
    }
  }, [fetchUsers]);

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/device-groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Group deleted successfully');
        loadData();
      } else {
        setError('Failed to delete group');
      }
    } catch (error) {
      setError('Failed to delete group');
    }
  }, [fetchUsers]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, permissions, and device access
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<PersonIcon />} label="Users" />
          <Tab icon={<GroupIcon />} label="Device Groups" />
        </Tabs>
      </Paper>

      {/* Users Tab */}
      {activeTab === 0 && (
        <Paper>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Users</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog('user')}
            >
              Add User
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUser={currentUser}
                    onEdit={(user) => openDialog('user', user)}
                    onDelete={handleDeleteUser}
                    onDeviceAccess={(user) => {
                      setSelectedItems(prev => ({ ...prev, user: user }));
                      setDialogs(prev => ({ ...prev, deviceAccess: true }));
                    }}
                    onGroupAccess={(user) => {
                      setSelectedItems(prev => ({ ...prev, userForGroupAccess: user }));
                      setDialogs(prev => ({ ...prev, groupAccess: true }));
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Device Groups Tab */}
      {activeTab === 1 && (
        <Paper>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Device Groups</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog('group')}
            >
              Add Group
            </Button>
          </Box>
          
          <Grid container spacing={3} sx={{ p: 3 }}>
            {data.deviceGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={(group) => openDialog('group', group)}
                onDelete={handleDeleteGroup}
                onManageDevices={(group) => openDialog('groupManagement', group)}
              />
            ))}
          </Grid>
        </Paper>
      )}

      {/* User Dialog */}
      <Dialog 
        open={dialogs.user} 
        onClose={() => closeDialog('user')} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedItems.user ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={forms.user.username}
                onChange={(e) => updateForm('user', { username: e.target.value })}
                disabled={!!selectedItems.user}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={forms.user.email}
                onChange={(e) => updateForm('user', { email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={forms.user.firstName}
                onChange={(e) => updateForm('user', { firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={forms.user.lastName}
                onChange={(e) => updateForm('user', { lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={forms.user.password}
                onChange={(e) => updateForm('user', { password: e.target.value })}
                helperText={selectedItems.user ? 'Leave blank to keep current password' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={forms.user.role}
                  onChange={(e) => updateForm('user', { role: e.target.value })}
                  label="Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Menu Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which menus this user can access
              </Typography>
              <Grid container spacing={2}>
                {availableMenus.map((menu) => (
                  <Grid item xs={12} sm={6} md={4} key={menu.value}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forms.user.permissions?.menus?.includes(menu.value) || false}
                          onChange={(e) => {
                            const currentMenus = forms.user.permissions?.menus || [];
                            const newMenus = e.target.checked
                              ? [...currentMenus, menu.value]
                              : currentMenus.filter(m => m !== menu.value);
                            updateForm('user', {
                              permissions: {
                                ...forms.user.permissions,
                                menus: newMenus
                              }
                            });
                          }}
                        />
                      }
                      label={menu.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('user')}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {selectedItems.user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Dialog */}
      <Dialog 
        open={dialogs.group} 
        onClose={() => closeDialog('group')} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedItems.group ? 'Edit Device Group' : 'Add New Device Group'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                value={forms.group.name}
                onChange={(e) => updateForm('group', { name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={forms.group.description}
                onChange={(e) => updateForm('group', { description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Color"
                type="color"
                value={forms.group.color}
                onChange={(e) => updateForm('group', { color: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('group')}>Cancel</Button>
          <Button onClick={handleGroupSubmit} variant="contained">
            {selectedItems.group ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Device Access Dialog */}
      <Dialog 
        open={dialogs.deviceAccess} 
        onClose={() => closeDialog('deviceAccess')} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Grant Device Access to {selectedItems.user?.firstName} {selectedItems.user?.lastName}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Device</InputLabel>
                <Select
                  value={forms.deviceAccess.deviceId}
                  onChange={(e) => updateForm('deviceAccess', { deviceId: e.target.value })}
                  label="Device"
                >
                  {data.devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name || device.imei} ({device.imei})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={forms.deviceAccess.accessLevel}
                  onChange={(e) => updateForm('deviceAccess', { accessLevel: e.target.value })}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expires At (Optional)"
                type="datetime-local"
                value={forms.deviceAccess.expiresAt}
                onChange={(e) => updateForm('deviceAccess', { expiresAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('deviceAccess')}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                const response = await authenticatedFetch(`/api/users/${selectedItems.user.id}/devices`, {
                  method: 'POST',
                  body: JSON.stringify(forms.deviceAccess)
                });

                if (response.ok) {
                  setSuccess('Device access granted successfully');
                  closeDialog('deviceAccess');
                  resetForm('deviceAccess');
                  loadData();
                } else {
                  const error = await response.json();
                  setError(error.error || 'Failed to grant device access');
                }
              } catch (error) {
                setError('Failed to grant device access');
              }
            }} 
            variant="contained"
            disabled={!forms.deviceAccess.deviceId}
          >
            Grant Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Access Dialog */}
      <Dialog 
        open={dialogs.groupAccess} 
        onClose={() => closeDialog('groupAccess')} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Grant Device Group Access to {selectedItems.userForGroupAccess?.firstName} {selectedItems.userForGroupAccess?.lastName}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Device Group</InputLabel>
                <Select
                  value={forms.groupAccess.groupId}
                  onChange={(e) => updateForm('groupAccess', { groupId: e.target.value })}
                  label="Device Group"
                >
                  {data.deviceGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name} ({group.devices?.length || 0} devices)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={forms.groupAccess.accessLevel}
                  onChange={(e) => updateForm('groupAccess', { accessLevel: e.target.value })}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expires At (Optional)"
                type="datetime-local"
                value={forms.groupAccess.expiresAt}
                onChange={(e) => updateForm('groupAccess', { expiresAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('groupAccess')}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                const response = await authenticatedFetch(`/api/users/${selectedItems.userForGroupAccess.id}/device-groups`, {
                  method: 'POST',
                  body: JSON.stringify(forms.groupAccess)
                });

                if (response.ok) {
                  const result = await response.json();
                  setSuccess(result.message || 'Device group access granted successfully');
                  closeDialog('groupAccess');
                  resetForm('groupAccess');
                  loadData();
                } else {
                  const error = await response.json();
                  setError(error.error || 'Failed to grant device group access');
                }
              } catch (error) {
                setError('Failed to grant device group access');
              }
            }} 
            variant="contained"
            disabled={!forms.groupAccess.groupId}
          >
            Grant Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Management Dialog */}
      <Dialog 
        open={dialogs.groupManagement} 
        onClose={() => closeDialog('groupManagement')} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Manage Devices in "{selectedItems.group?.name}" Group
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Current Devices ({selectedItems.group?.devices?.length || 0})
              </Typography>
              {selectedItems.group?.devices && selectedItems.group.devices.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  {selectedItems.group.devices.map((device) => (
                    <Chip
                      key={device.id}
                      label={`${device.name || device.imei} (${device.imei})`}
                      onDelete={async () => {
                        try {
                          const response = await authenticatedFetch(`/api/device-groups/${selectedItems.group.id}/devices/${device.id}`, {
                            method: 'DELETE'
                          });

                          if (response.ok) {
                            setSuccess('Device removed from group successfully');
                            loadData();
                            // Update the selected group with the new device list
                            const updatedGroup = { ...selectedItems.group };
                            updatedGroup.devices = updatedGroup.devices.filter(d => d.id !== device.id);
                            setSelectedItems(prev => ({ ...prev, group: updatedGroup }));
                          } else {
                            const error = await response.json();
                            setError(error.error || 'Failed to remove device from group');
                          }
                        } catch (error) {
                          setError('Failed to remove device from group');
                        }
                      }}
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No devices in this group
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Add Device to Group
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth>
                    <InputLabel>Select Device</InputLabel>
                    <Select
                      value={forms.groupDevice.deviceId}
                      onChange={(e) => updateForm('groupDevice', { deviceId: e.target.value })}
                      label="Select Device"
                    >
                      {data.devices
                        .filter(device => !selectedItems.group?.devices?.some(groupDevice => groupDevice.id === device.id))
                        .map((device) => (
                          <MenuItem key={device.id} value={device.id}>
                            {device.name || device.imei} ({device.imei})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={async () => {
                      console.log('Add Device button clicked');
                      console.log('selectedItems.group:', selectedItems.group);
                      console.log('forms.groupDevice.deviceId:', forms.groupDevice.deviceId);
                      
                      try {
                        const response = await authenticatedFetch(`/api/device-groups/${selectedItems.group.id}/devices`, {
                          method: 'POST',
                          body: JSON.stringify({ deviceId: forms.groupDevice.deviceId })
                        });

                        console.log('API response:', response);

                        if (response.ok) {
                          setSuccess('Device added to group successfully');
                          resetForm('groupDevice');
                          loadData();
                          // Update the selected group with the new device list
                          const addedDevice = data.devices.find(d => d.id === forms.groupDevice.deviceId);
                          if (addedDevice) {
                            const updatedGroup = { ...selectedItems.group };
                            updatedGroup.devices = [...(updatedGroup.devices || []), addedDevice];
                            setSelectedItems(prev => ({ ...prev, group: updatedGroup }));
                          }
                        } else {
                          const error = await response.json();
                          console.log('API error:', error);
                          setError(error.error || 'Failed to add device to group');
                        }
                      } catch (error) {
                        console.log('Exception caught:', error);
                        setError('Failed to add device to group');
                      }
                    }}
                    disabled={!forms.groupDevice.deviceId}
                  >
                    Add Device
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('groupManagement')}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 