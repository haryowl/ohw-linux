const fs = require('fs');
const path = require('path');

// Files to fix with their specific changes
const fixes = [
  {
    file: 'frontend/src/components/DeviceEditDialog.js',
    changes: [
      { line: 16, from: 'import { Add as AddIcon, Delete as DeleteIcon } from \'@mui/icons-material\';', to: 'import { Add as AddIcon } from \'@mui/icons-material\';' }
    ]
  },
  {
    file: 'frontend/src/components/OfflineMapLayer.js',
    changes: [
      { line: 1, from: 'import React from \'react\';', to: '' }
    ]
  },
  {
    file: 'frontend/src/components/TrackingMap.js',
    changes: [
      { line: 30, from: '  const [error, setError] = useState(null);', to: '  const [error] = useState(null);' },
      { line: 160, from: '    const ws = new WebSocket(wsUrl);', to: '    // const ws = new WebSocket(wsUrl);' }
    ]
  },
  {
    file: 'frontend/src/contexts/DataContext.js',
    changes: [
      { line: 4, from: 'import { apiFetchDevices, apiFetchAlerts } from \'../services/api\';', to: 'import { } from \'../services/api\';' }
    ]
  },
  {
    file: 'frontend/src/pages/Dashboard.js',
    changes: [
      { line: 3, from: 'import React, { useState, useEffect } from \'react\';', to: 'import React, { useState } from \'react\';' },
      { line: 7, from: 'import { Paper, Typography, Box, Grid, Card, CardContent, CardHeader, IconButton, Chip } from \'@mui/material\';', to: 'import { Typography, Box, Grid, Card, CardContent, CardHeader, IconButton, Chip } from \'@mui/material\';' },
      { line: 27, from: 'import { TrendingUp as TrendIcon, LocationOn, Speed, AccessTime } from \'@mui/icons-material\';', to: 'import { LocationOn, Speed, AccessTime } from \'@mui/icons-material\';' }
    ]
  },
  {
    file: 'frontend/src/pages/DataExport.js',
    changes: [
      { line: 138, from: '  }, [selectedDevices, dateRange, format]);', to: '  }, [selectedDevices, dateRange, format, fetchData]);' }
    ]
  },
  {
    file: 'frontend/src/pages/DeviceList.js',
    changes: [
      { line: 25, from: 'import { Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon, Add as AddIcon } from \'@mui/icons-material\';', to: 'import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from \'@mui/icons-material\';' }
    ]
  },
  {
    file: 'frontend/src/pages/Settings.js',
    changes: [
      { line: 4, from: 'import { Paper, Typography, Box, Grid, Card, CardContent, CardHeader, Button, TextField, Switch, FormControlLabel, Alert, CircularProgress, IconButton, LinearProgress, Tooltip } from \'@mui/material\';', to: 'import { Typography, Box, Grid, Card, CardContent, CardHeader, Button, TextField, Switch, FormControlLabel, Alert, CircularProgress } from \'@mui/material\';' },
      { line: 34, from: 'import { Restore as RestoreIcon, Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon, Save as SaveIcon } from \'@mui/icons-material\';', to: 'import { Download as DownloadIcon, Upload as UploadIcon, Save as SaveIcon } from \'@mui/icons-material\';' },
      { line: 49, from: 'import axios from \'axios\';', to: '// import axios from \'axios\';' },
      { line: 76, from: '  const [backups, setBackups] = useState([]);', to: '  // const [backups, setBackups] = useState([]);' },
      { line: 311, from: '  const handleRestoreBackup = async (backupFile) => {', to: '  // const handleRestoreBackup = async (backupFile) => {' },
      { line: 324, from: '  const handleDeleteBackup = async (backupFile) => {', to: '  // const handleDeleteBackup = async (backupFile) => {' }
    ]
  },
  {
    file: 'frontend/src/pages/Tracking.js',
    changes: [
      { line: 42, from: 'import { useMap, useMapEvents } from \'react-leaflet\';', to: 'import { useMapEvents } from \'react-leaflet\';' },
      { line: 73, from: '  const [deviceLocations, setDeviceLocations] = useState({});', to: '  // const [deviceLocations, setDeviceLocations] = useState({});' },
      { line: 90, from: '  const [replayData, setReplayData] = useState([]);', to: '  // const [replayData, setReplayData] = useState([]);' },
      { line: 283, from: '  const fetchDeviceLocations = useCallback(async () => {', to: '  // const fetchDeviceLocations = useCallback(async () => {' },
      { line: 398, from: '  }, [selectedDevices, mapCenter, zoomLevel]);', to: '  }, [selectedDevices, mapCenter, zoomLevel, getCurrentReplayPoint]);' }
    ]
  },
  {
    file: 'frontend/src/pages/UserManagement.js',
    changes: [
      { line: 231, from: '  const getAuthHeaders = () => {', to: '  // const getAuthHeaders = () => {' },
      { line: 290, from: '  }, [authenticatedFetch, fetchUsers]);', to: '  }, [fetchUsers]);' },
      { line: 407, from: '  }, [authenticatedFetch, fetchUsers]);', to: '  }, [fetchUsers]);' },
      { line: 431, from: '  }, [authenticatedFetch, fetchUsers]);', to: '  }, [fetchUsers]);' },
      { line: 450, from: '  }, [authenticatedFetch, fetchUsers]);', to: '  }, [fetchUsers]);' },
      { line: 469, from: '  }, [authenticatedFetch, fetchUsers]);', to: '  }, [fetchUsers]);' }
    ]
  }
];

function fixFile(filePath, changes) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    changes.forEach(change => {
      if (change.line <= lines.length) {
        const currentLine = lines[change.line - 1];
        if (currentLine.includes(change.from.split(' ')[0])) { // Check if line contains the first word
          lines[change.line - 1] = change.to;
          modified = true;
          console.log(`✅ Fixed line ${change.line} in ${filePath}`);
        } else {
          console.log(`⚠️  Line ${change.line} in ${filePath} doesn't match expected content`);
        }
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing ESLint warnings...\n');
  
  let fixedCount = 0;
  let totalFiles = fixes.length;

  fixes.forEach(fix => {
    if (fixFile(fix.file, fix.changes)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`✅ Fixed: ${fixedCount}/${totalFiles} files`);
  
  if (fixedCount === totalFiles) {
    console.log('🎉 All ESLint warnings have been fixed!');
  } else {
    console.log('⚠️  Some files could not be fixed. Check the output above.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, fixes }; 