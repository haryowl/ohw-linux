const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

async function setupUserManagement() {
  try {
    logger.info('Setting up user management system...');
    
    // Sync database with new models (without alter)
    await sequelize.sync();
    logger.info('Database synced successfully');
    
    // Run migrations manually
    logger.info('Running migrations...');
    
    // Create users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
        isActive BOOLEAN NOT NULL DEFAULT 1,
        lastLogin DATETIME,
        passwordChangedAt DATETIME,
        permissions TEXT NOT NULL DEFAULT '{"menus":["dashboard"],"devices":[],"deviceGroups":[]}',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create device_groups table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS device_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) NOT NULL DEFAULT '#1976d2',
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdBy INTEGER NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create user_device_access table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_device_access (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        deviceId INTEGER NOT NULL,
        accessLevel VARCHAR(20) NOT NULL DEFAULT 'read' CHECK (accessLevel IN ('read', 'write', 'admin')),
        grantedBy INTEGER NOT NULL,
        grantedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (deviceId) REFERENCES Devices(id) ON DELETE CASCADE,
        FOREIGN KEY (grantedBy) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, deviceId)
      )
    `);
    
    // Add groupId column to Devices table if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE Devices ADD COLUMN groupId INTEGER REFERENCES device_groups(id) ON DELETE SET NULL
      `);
      logger.info('Added groupId column to Devices table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        logger.info('groupId column already exists in Devices table');
      } else {
        throw error;
      }
    }
    
    // Create indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_device_groups_name ON device_groups(name)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_device_groups_createdBy ON device_groups(createdBy)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_device_groups_isActive ON device_groups(isActive)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_user_device_access_userId ON user_device_access(userId)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_user_device_access_deviceId ON user_device_access(deviceId)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_user_device_access_grantedBy ON user_device_access(grantedBy)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_user_device_access_isActive ON user_device_access(isActive)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_user_device_access_accessLevel ON user_device_access(accessLevel)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_devices_groupId ON Devices(groupId)');
    
    // Create admin user if it doesn't exist
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const [existingAdmin] = await sequelize.query(
      'SELECT id FROM users WHERE username = ?',
      { replacements: ['admin'] }
    );
    
    if (existingAdmin.length === 0) {
      await sequelize.query(`
        INSERT INTO users (username, email, password, firstName, lastName, role, isActive, permissions, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          'admin',
          'admin@ohw.com',
          hashedPassword,
          'System',
          'Administrator',
          'admin',
          1,
          JSON.stringify({
            menus: ['dashboard', 'devices', 'mapping', 'tracking', 'data', 'alerts', 'settings', 'export', 'demo', 'user-management'],
            devices: [],
            deviceGroups: []
          }),
          new Date(),
          new Date()
        ]
      });
      logger.info('Admin user created successfully');
    } else {
      logger.info('Admin user already exists');
    }
    
    logger.info('User management system setup completed!');
    logger.info('Default admin credentials:');
    logger.info('Username: admin');
    logger.info('Password: admin123');
    
  } catch (error) {
    logger.error('Error setting up user management:', error);
    process.exit(1);
  }
}

setupUserManagement(); 