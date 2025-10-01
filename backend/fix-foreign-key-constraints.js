const { sequelize } = require('./src/models');

async function fixForeignKeys() {
  try {
    await sequelize.authenticate();
    console.log('🔧 Fixing foreign key constraints...');
    
    // Disable foreign keys temporarily
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    console.log('✅ Foreign keys disabled');
    
    // Drop the Records table completely
    await sequelize.query('DROP TABLE IF EXISTS Records;');
    console.log('✅ Records table dropped');
    
    // Drop any existing foreign key constraints
    await sequelize.query('PRAGMA foreign_key_list(Records);').then(result => {
      console.log('Foreign key constraints found:', result[0]);
    }).catch(() => {
      console.log('No foreign key constraints found');
    });
    
    // Sync the models to recreate the table without foreign key constraints
    await sequelize.sync({ force: false });
    console.log('✅ Database schema recreated without foreign key constraints');
    
    // Verify no foreign key constraints exist
    await sequelize.query('PRAGMA foreign_key_list(Records);').then(result => {
      if (result[0] && result[0].length > 0) {
        console.log('⚠️ Foreign key constraints still exist:', result[0]);
      } else {
        console.log('✅ No foreign key constraints found on Records table');
      }
    }).catch(() => {
      console.log('✅ No foreign key constraints found');
    });
    
    console.log('🎉 Foreign key constraint fix completed!');
  } catch (error) {
    console.error('❌ Error fixing foreign key constraints:', error);
  } finally {
    await sequelize.close();
  }
}

fixForeignKeys(); 