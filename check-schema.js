// check-schema.js
const { sequelize } = require('./backend/src/models');

async function checkSchema() {
  try {
    const tableInfo = await sequelize.query("PRAGMA table_info(Devices)");
    console.log('Devices table schema:', tableInfo[0]);
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await sequelize.close();
  }
}

checkSchema();