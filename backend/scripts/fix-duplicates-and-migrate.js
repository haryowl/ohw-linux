const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

async function fixDuplicatesAndMigrate() {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established');

        // Step 1: Check for duplicates
        const duplicates = await sequelize.query(`
            SELECT id, COUNT(*) as count
            FROM users
            GROUP BY id
            HAVING count > 1
        `, { type: sequelize.QueryTypes.SELECT });

        if (duplicates.length > 0) {
            logger.info(`Found ${duplicates.length} duplicate IDs in users table`);
            
            // Step 2: Create backup of users table
            await sequelize.query('DROP TABLE IF EXISTS users_backup');
            await sequelize.query('CREATE TABLE users_backup AS SELECT * FROM users');
            logger.info('Created users_backup table');

            // Step 3: Remove duplicates, keeping the first row for each id
            const result = await sequelize.query(`
                DELETE FROM users
                WHERE rowid NOT IN (
                    SELECT MIN(rowid)
                    FROM users
                    GROUP BY id
                )
            `);
            logger.info('Removed duplicate rows from users table');

            // Step 4: Verify no more duplicates
            const remainingDuplicates = await sequelize.query(`
                SELECT id, COUNT(*) as count
                FROM users
                GROUP BY id
                HAVING count > 1
            `, { type: sequelize.QueryTypes.SELECT });

            if (remainingDuplicates.length === 0) {
                logger.info('Successfully removed all duplicates');
            } else {
                logger.warn(`Still found ${remainingDuplicates.length} duplicate IDs`);
            }
        } else {
            logger.info('No duplicate IDs found in users table');
        }

        // Step 5: Add customFields column to Devices table
        try {
            await sequelize.query(`
                ALTER TABLE Devices 
                ADD COLUMN customFields TEXT DEFAULT '{}'
            `);
            logger.info('Custom fields column added to Devices table');
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                logger.info('Custom fields column already exists in Devices table');
            } else {
                throw error;
            }
        }

        logger.info('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        console.error(error);
        process.exit(1);
    }
}

fixDuplicatesAndMigrate(); 