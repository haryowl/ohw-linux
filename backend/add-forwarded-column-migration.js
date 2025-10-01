const { sequelize } = require('./src/models');
const { DataTypes } = require('sequelize');

async function addForwardedColumn() {
  try {
    console.log('🔧 Adding forwarded column to Records table...');
    
    // Add the forwarded column
    await sequelize.getQueryInterface().addColumn('Records', 'forwarded', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    console.log('✅ Forwarded column added successfully');
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Forwarded column already exists, skipping...');
    } else {
      console.error('❌ Error adding forwarded column:', error);
      process.exit(1);
    }
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addForwardedColumn()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addForwardedColumn; 