# Changelog

All notable changes to the Galileosky Parser Windows project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline
- Comprehensive documentation
- Contributing guidelines
- Security audit workflows

### Changed
- Improved project structure
- Enhanced deployment scripts
- Better error handling

## [1.3.0] - 2024-12-19

### Added
- **Dynamic Configuration System**: Automatic detection of localhost vs IP access
- **Mobile Frontend**: Responsive mobile interface for on-the-go access
- **Enhanced Deployment Tools**: Comprehensive deployment scripts and guides
- **Multi-Record Parsing**: Support for both 0x10 and 0x20 tag-based records
- **Real-time WebSocket Integration**: Live data streaming capabilities
- **Advanced Authentication**: Cookie-based session management
- **Data Export Functionality**: CSV export for GPS records
- **Device Management**: Complete CRUD operations for GPS devices
- **Interactive Maps**: Real-time device tracking on maps
- **User Management**: Role-based access control system

### Changed
- **Parser Logic**: Enhanced to handle split packets and multi-record formats
- **Frontend Architecture**: Modern React-based dashboard
- **Backend API**: RESTful API with comprehensive endpoints
- **Database Schema**: Improved data models with proper relationships
- **CORS Configuration**: Dynamic origin handling for flexible deployment
- **Error Handling**: Comprehensive error management and logging

### Fixed
- **Authentication Issues**: Resolved 401/500 errors with proper session handling
- **Multi-Record Parsing**: Fixed parsing of packets with multiple GPS records
- **CORS Problems**: Resolved cross-origin issues for different access methods
- **Database Integrity**: Added missing columns and proper schema management
- **Build Process**: Fixed frontend build issues and environment configuration

### Security
- **Session Management**: Secure cookie-based authentication
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Security**: Proper origin validation and credentials handling

## [1.2.0] - 2024-12-18

### Added
- **Multi-Record Support**: Handle packets containing multiple GPS records
- **Dynamic Tag Detection**: Automatic detection of 0x10 vs 0x20 record formats
- **Enhanced Logging**: Comprehensive logging for debugging and monitoring
- **Test Suite**: Automated tests for parser functionality
- **Diagnostic Tools**: Scripts for troubleshooting common issues

### Changed
- **Parser Algorithm**: Improved record boundary detection
- **Error Handling**: Better error messages and recovery
- **Performance**: Optimized parsing for large packets

### Fixed
- **Record Parsing**: Correctly parse all records in multi-record packets
- **Packet Buffering**: Handle split packets properly
- **Memory Management**: Prevent memory leaks in long-running processes

## [1.1.0] - 2024-12-17

### Added
- **Web Dashboard**: React-based user interface
- **Authentication System**: User login and session management
- **Database Integration**: SQLite database with Sequelize ORM
- **API Endpoints**: RESTful API for data access
- **Device Management**: Add and manage GPS devices

### Changed
- **Architecture**: Separated frontend and backend components
- **Data Storage**: Persistent storage with database
- **User Interface**: Web-based dashboard instead of console-only

### Fixed
- **Data Persistence**: Save parsed data to database
- **User Sessions**: Proper session management
- **API Security**: Authentication for API endpoints

## [1.0.0] - 2024-12-16

### Added
- **Basic GPS Parsing**: Parse Galileosky protocol packets
- **TCP Server**: Handle device connections
- **Console Interface**: Basic command-line interface
- **Real-time Processing**: Process incoming data in real-time
- **Logging**: Basic logging functionality

### Features
- Parse GPS coordinates from Galileosky devices
- Handle basic packet formats
- Display parsed data in console
- Basic error handling

---

## Migration Guide

### From 1.2.0 to 1.3.0
1. Update environment configuration:
   ```bash
   npm run deploy-dev
   ```
2. Run database migrations:
   ```bash
   cd backend
   node fix-forwarded-column.js
   ```
3. Rebuild frontend:
   ```bash
   cd frontend
   npm run build
   ```

### From 1.1.0 to 1.2.0
1. Update parser configuration
2. Run parser tests to verify functionality
3. Monitor logs for any parsing issues

### From 1.0.0 to 1.1.0
1. Install new dependencies
2. Set up database
3. Configure authentication
4. Migrate existing data if any

---

## Support

For support with version migrations or any issues:
- Create an issue on GitHub
- Check the troubleshooting section in README.md
- Review the deployment guides 