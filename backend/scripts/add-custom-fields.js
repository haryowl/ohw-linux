const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

async function addCustomFields() {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established');

        // Add customFields column to Devices table
        await sequelize.query(`
            ALTER TABLE Devices 
            ADD COLUMN customFields TEXT DEFAULT '{}'
        `);
        logger.info('Custom fields column added to Devices table');

        logger.info('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            logger.info('Custom fields column already exists in Devices table');
            process.exit(0);
        } else {
            logger.error('Migration failed:', error);
            console.error(error);
            process.exit(1);
        }
    }
}

addCustomFields(); 