@echo off
echo ========================================
echo Fix Database Schema - Missing Tables
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    pause
    exit /b 1
)

echo [INFO] Fixing database schema in: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%\backend"

echo [INFO] Running database migrations...
call npm run migrate

echo [INFO] Creating missing tables...
node -e "
const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'prod.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

async function fixDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Create AlertRules table if it doesn't exist
    await sequelize.query(\`
      CREATE TABLE IF NOT EXISTS AlertRules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        condition TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL DEFAULT 'medium',
        enabled BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    \`);
    
    console.log('AlertRules table created/verified.');
    
    // Sync all models
    const { AlertRule } = require('./src/models');
    await sequelize.sync({ force: false });
    
    console.log('Database schema fixed successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDatabase();
"

echo.
echo ========================================
echo Database Schema Fixed!
echo ========================================
echo.
echo You can now restart the backend:
echo npm start
echo.
pause 