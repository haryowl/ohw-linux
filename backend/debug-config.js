const path = require('path');
require('dotenv').config();

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_PATH:', process.env.DB_PATH);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

console.log('\nLoading config...');
const config = require('./src/config');

console.log('\nConfig object:');
console.log('Environment:', config.env);
console.log('Database config:', JSON.stringify(config.database, null, 2));

console.log('\nResolved database path:');
const env = config.env;
const dbConfig = config.database[env];
console.log('Environment:', env);
console.log('Database config for env:', JSON.stringify(dbConfig, null, 2));

if (dbConfig && dbConfig.storage) {
    console.log('Storage path:', dbConfig.storage);
    console.log('Storage path exists:', require('fs').existsSync(dbConfig.storage));
} else {
    console.log('No storage path found in config!');
} 