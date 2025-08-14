const { User, sequelize } = require('./src/models');

async function updateAdminPermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Find admin user
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create default admin user
      const newAdminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        permissions: {
          menus: ['dashboard', 'devices', 'mapping', 'tracking', 'settings', 'alerts', 'data', 'export', 'demo', 'user-management'],
          devices: [],
          deviceGroups: []
        }
      });

      console.log('New admin user created successfully:');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Email: admin@example.com');
      return;
    }

    console.log('Found existing admin user:', adminUser.username);
    console.log('Current role:', adminUser.role);
    console.log('Current permissions:', JSON.stringify(adminUser.permissions, null, 2));

    // Update admin user with proper permissions
    const updatedPermissions = {
      menus: ['dashboard', 'devices', 'mapping', 'tracking', 'settings', 'alerts', 'data', 'export', 'demo', 'user-management'],
      devices: [],
      deviceGroups: []
    };

    await adminUser.update({
      role: 'admin',
      isActive: true,
      permissions: updatedPermissions
    });

    console.log('Admin user updated successfully:');
    console.log('Role: admin');
    console.log('Permissions:', JSON.stringify(updatedPermissions, null, 2));

  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

updateAdminPermissions(); 