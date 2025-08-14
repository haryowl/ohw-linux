// list-tables.js
const { sequelize } = require('./backend/src/models');

async function listTables() {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in the database:', tables);
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await sequelize.close();
  }
}

listTables();