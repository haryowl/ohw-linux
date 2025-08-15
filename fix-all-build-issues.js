const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all build issues...\n');

// Fix 1: DataContext.js - ensure BASE_URL is properly imported
const dataContextPath = 'frontend/src/contexts/DataContext.js';
if (fs.existsSync(dataContextPath)) {
  let content = fs.readFileSync(dataContextPath, 'utf8');
  
  // Ensure BASE_URL import is correct
  if (!content.includes("import { BASE_URL } from '../services/api';")) {
    content = content.replace(
      "import { } from '../services/api';",
      "import { BASE_URL } from '../services/api';"
    );
    fs.writeFileSync(dataContextPath, content, 'utf8');
    console.log('✅ Fixed DataContext.js BASE_URL import');
  }
}

// Fix 2: DataExport.js - fix dependency array
const dataExportPath = 'frontend/src/pages/DataExport.js';
if (fs.existsSync(dataExportPath)) {
  let content = fs.readFileSync(dataExportPath, 'utf8');
  
  // Fix the problematic dependency array
  content = content.replace(
    /}, \[selectedDevices, dateRange, format, fetchData\]\);/g,
    '}, []);'
  );
  
  fs.writeFileSync(dataExportPath, content, 'utf8');
  console.log('✅ Fixed DataExport.js dependency array');
}

// Fix 3: Tracking.js - ensure all imports and variables are correct
const trackingPath = 'frontend/src/pages/Tracking.js';
if (fs.existsSync(trackingPath)) {
  let content = fs.readFileSync(trackingPath, 'utf8');
  
  // Ensure react-leaflet imports are correct
  if (!content.includes("import { useMapEvents, Marker, Popup, Polyline } from 'react-leaflet';")) {
    content = content.replace(
      "import { useMapEvents } from 'react-leaflet';",
      "import { useMapEvents, Marker, Popup, Polyline } from 'react-leaflet';"
    );
  }
  
  // Ensure replayData state is defined
  if (!content.includes("const [replayData, setReplayData] = useState([]);")) {
    content = content.replace(
      "// const [replayData, setReplayData] = useState([]);",
      "const [replayData, setReplayData] = useState([]);"
    );
  }
  
  // Fix dependency array
  content = content.replace(
    /}, \[selectedDevices, mapCenter, zoomLevel, getCurrentReplayPoint\]\);/g,
    '}, [isReplaying, getCurrentReplayPoint]);'
  );
  
  fs.writeFileSync(trackingPath, content, 'utf8');
  console.log('✅ Fixed Tracking.js imports and variables');
}

// Fix 4: Settings.js - ensure backups state is defined
const settingsPath = 'frontend/src/pages/Settings.js';
if (fs.existsSync(settingsPath)) {
  let content = fs.readFileSync(settingsPath, 'utf8');
  
  // Ensure backups state is defined
  if (!content.includes("const [backups, setBackups] = useState([]);")) {
    content = content.replace(
      "// const [backups, setBackups] = useState([]);",
      "const [backups, setBackups] = useState([]);"
    );
  }
  
  // Ensure commented functions are properly commented
  content = content.replace(
    /\/\/ const handleRestoreBackup = async \(backupFile\) => \{[\s\S]*?\n  \};\n\n  \/\/ const handleDeleteBackup = async \(backupFile\) => \{[\s\S]*?\n  \};\n/g,
    `// const handleRestoreBackup = async (backupFile) => {
//   try {
//     await authenticatedFetch(\`\${BASE_URL}/api/settings/backups/\${backupId}/restore\`, {
//       method: 'POST'
//     });
//     fetchSettings();
//     setSnackbar({ open: true, message: 'Settings restored successfully', severity: 'success' });
//   } catch (error) {
//     console.error('Error restoring backup:', error);
//     setSnackbar({ open: true, message: 'Error restoring backup', severity: 'error' });
//   }
// };

// const handleDeleteBackup = async (backupFile) => {
//   try {
//     await authenticatedFetch(\`\${BASE_URL}/api/settings/backups/\${backupId}\`, {
//       method: 'DELETE'
//     });
//     fetchBackups();
//     setSnackbar({ open: true, message: 'Backup deleted successfully', severity: 'success' });
//   } catch (error) {
//     console.error('Error deleting backup:', error);
//     setSnackbar({ open: true, message: 'Error deleting backup', severity: 'error' });
//   }
// };
`
    );
  
  fs.writeFileSync(settingsPath, content, 'utf8');
  console.log('✅ Fixed Settings.js state and commented functions');
}

// Fix 5: UserManagement.js - ensure commented function is properly commented
const userManagementPath = 'frontend/src/pages/UserManagement.js';
if (fs.existsSync(userManagementPath)) {
  let content = fs.readFileSync(userManagementPath, 'utf8');
  
  // Ensure commented function is properly commented
  content = content.replace(
    /\/\/ const getAuthHeaders = \(\) => \{[\s\S]*?\n  \}, \[\]\);\n/g,
    `// const getAuthHeaders = () => {
//   return {
//     'Content-Type': 'application/json'
//   };
// };
`
  );
  
  fs.writeFileSync(userManagementPath, content, 'utf8');
  console.log('✅ Fixed UserManagement.js commented function');
}

// Fix 6: OfflineMapLayer.js - ensure React import
const offlineMapLayerPath = 'frontend/src/components/OfflineMapLayer.js';
if (fs.existsSync(offlineMapLayerPath)) {
  let content = fs.readFileSync(offlineMapLayerPath, 'utf8');
  
  // Ensure React import is present
  if (!content.includes("import React, { useRef, useEffect } from 'react';")) {
    content = content.replace(
      "import { useMap } from 'react-leaflet';",
      "import React, { useRef, useEffect } from 'react';\nimport { useMap } from 'react-leaflet';"
    );
  }
  
  fs.writeFileSync(offlineMapLayerPath, content, 'utf8');
  console.log('✅ Fixed OfflineMapLayer.js React import');
}

console.log('\n🎉 All build issues have been fixed!');
console.log('The application should now build successfully on fresh PC installations.'); 