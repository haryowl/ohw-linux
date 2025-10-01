const { sequelize } = require('./src/models');

async function disableForeignKeyConstraints() {
  try {
    console.log('🔧 Disabling foreign key constraints...');
    
    // Disable foreign key constraints for SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    console.log('✅ Foreign key constraints disabled');
    console.log('ℹ️  You can now restart the backend server');
    
  } catch (error) {
    console.error('❌ Error disabling foreign key constraints:', error);
    throw error;
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  disableForeignKeyConstraints()
    .then(() => {
      console.log('✅ Foreign key constraints disabled successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to disable foreign key constraints:', error);
      process.exit(1);
    });
}

module.exports = disableForeignKeyConstraints; 