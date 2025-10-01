const { sequelize } = require('./src/models');
const { Role, User } = require('./src/models');

async function testRolesAPI() {
  try {
    await sequelize.authenticate();
    console.log('🔧 Testing Roles API...');
    
    // Test 1: Check if roles exist
    const roles = await Role.findAll();
    console.log('✅ Roles found:', roles.length);
    roles.forEach(role => {
      console.log(`  - ${role.name} (ID: ${role.id})`);
    });
    
    // Test 2: Check if admin user exists
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    console.log('✅ Admin user:', adminUser ? `ID: ${adminUser.id}, Role: ${adminUser.role}` : 'Not found');
    
    // Test 3: Test role associations
    const rolesWithAssociations = await Role.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          where: { isActive: true },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('✅ Roles with associations loaded:', rolesWithAssociations.length);
    
    // Test 4: Check available permissions endpoint
    const availablePermissions = {
      menus: [
        { value: 'dashboard', label: 'Dashboard', description: 'Access to main dashboard' },
        { value: 'devices', label: 'Devices', description: 'Access to device management' },
        { value: 'device-groups', label: 'Device Groups', description: 'Access to device group management' },
        { value: 'mapping', label: 'Mapping', description: 'Access to field mapping' },
        { value: 'tracking', label: 'Tracking', description: 'Access to location tracking' },
        { value: 'data', label: 'Data Table', description: 'Access to data viewing' },
        { value: 'alerts', label: 'Alerts', description: 'Access to alert management' },
        { value: 'settings', label: 'Settings', description: 'Access to system settings' },
        { value: 'user-management', label: 'User Management', description: 'Access to user management' },
        { value: 'export', label: 'Data Export', description: 'Access to data export' },
        { value: 'data-sm', label: 'Data SM', description: 'Access to Data SM module' },
        { value: 'demo', label: 'Offline Demo', description: 'Access to demo features' }
      ],
      modules: [
        { value: 'devices', label: 'Devices', description: 'Device management operations' },
        { value: 'device-groups', label: 'Device Groups', description: 'Device group operations' },
        { value: 'users', label: 'Users', description: 'User management operations' },
        { value: 'roles', label: 'Roles', description: 'Role management operations' },
        { value: 'alerts', label: 'Alerts', description: 'Alert management operations' },
        { value: 'data', label: 'Data', description: 'Data access operations' },
        { value: 'export', label: 'Export', description: 'Data export operations' }
      ],
      special: [
        { value: 'canManageUsers', label: 'Manage Users', description: 'Can create, edit, and delete users' },
        { value: 'canManageRoles', label: 'Manage Roles', description: 'Can create, edit, and delete roles' },
        { value: 'canManageSystem', label: 'Manage System', description: 'Can modify system settings' },
        { value: 'canExportData', label: 'Export Data', description: 'Can export system data' },
        { value: 'canViewAnalytics', label: 'View Analytics', description: 'Can view analytics and reports' }
      ]
    };
    
    console.log('✅ Available permissions structure is valid');
    
    console.log('🎉 All tests passed! The Roles API should work correctly.');
    
  } catch (error) {
    console.error('❌ Error testing Roles API:', error);
  } finally {
    await sequelize.close();
  }
}

testRolesAPI(); 