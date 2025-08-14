const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, 'data', 'prod.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

async function fixForwardedColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check if the forwarded column exists
    const [results] = await sequelize.query("PRAGMA table_info(Records)");
    const columns = results.map(row => row.name);
    
    console.log('Current columns in Records table:', columns);
    
    if (columns.includes('forwarded')) {
      console.log('✅ forwarded column already exists');
    } else {
      console.log('❌ forwarded column missing, adding it...');
      
      // Add the forwarded column
      await sequelize.query(`
        ALTER TABLE Records 
        ADD COLUMN forwarded BOOLEAN NOT NULL DEFAULT 0
      `);
      
      console.log('✅ forwarded column added successfully');
      
      // Verify the column was added
      const [newResults] = await sequelize.query("PRAGMA table_info(Records)");
      const newColumns = newResults.map(row => row.name);
      console.log('Updated columns in Records table:', newColumns);
    }

    // Also check if SequelizeMeta table exists
    const [metaResults] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='SequelizeMeta'");
    
    if (metaResults.length > 0) {
      console.log('✅ SequelizeMeta table exists');
      const [migrations] = await sequelize.query("SELECT * FROM SequelizeMeta ORDER BY name");
      console.log('Applied migrations:', migrations.map(m => m.name));
    } else {
      console.log('❌ SequelizeMeta table does not exist');
      console.log('Creating SequelizeMeta table...');
      
      await sequelize.query(`
        CREATE TABLE SequelizeMeta (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        )
      `);
      
      console.log('✅ SequelizeMeta table created');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

fixForwardedColumn(); 