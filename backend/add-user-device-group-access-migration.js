const { sequelize } = require('./src/models');

async function addUserDeviceGroupAccessTable() {
  try {
    console.log('🔧 Adding user_device_group_access table...');
    
    // Sync the database to create the new table
    await sequelize.sync({ force: false });
    console.log('✅ Database schema synced');
    
    // Check if the table exists
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    const hasTable = tableExists.includes('user_device_group_access');
    
    if (hasTable) {
      console.log('✅ user_device_group_access table already exists');
    } else {
      console.log('❌ user_device_group_access table not found - this should not happen after sync');
    }
    
    console.log('🎉 User device group access migration completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart the backend server');
    console.log('   2. Access the User Management page');
    console.log('   3. Use the "Group Access Management" tab to manage user access');
    console.log('   4. Grant users access to specific device groups');
    
  } catch (error) {
    console.error('❌ Error adding user device group access table:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addUserDeviceGroupAccessTable()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addUserDeviceGroupAccessTable; 