const { sequelize } = require('./src/models');
const { DataTypes } = require('sequelize');

async function addRoleIdColumn() {
  try {
    await sequelize.authenticate();
    console.log('🔧 Adding roleId column to Users table...');
    
    // Check if column already exists to prevent errors on re-run
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.roleId) {
      await queryInterface.addColumn('users', 'roleId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        comment: 'Reference to custom role (overrides the role enum)'
      });
      console.log('✅ roleId column added successfully');
    } else {
      console.log('ℹ️ roleId column already exists, skipping.');
    }
    
    console.log('🎉 Role ID migration completed!');
  } catch (error) {
    console.error('❌ Error adding roleId column:', error);
  } finally {
    await sequelize.close();
  }
}

addRoleIdColumn(); 