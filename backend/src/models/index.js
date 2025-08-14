// backend/src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../utils/logger');
const path = require('path');

// Import model definitions
const defineDevice = require('./device');
const defineFieldMapping = require('./mapping');
const defineAlertRule = require('./alertRule');
const defineRecord = require('./record');
const defineAlert = require('./alert');
const defineUser = require('./user');
const defineDeviceGroup = require('./deviceGroup');
const defineUserDeviceAccess = require('./userDeviceAccess');

// Force production environment to use the correct database
const env = 'production'; // Force production environment
const dbConfig = config.database[env];

// Ensure we have a valid database configuration
if (!dbConfig) {
    throw new Error(`Database configuration for environment "${env}" not found`);
}

console.log('Using database environment:', env);
console.log('Database storage path:', dbConfig.storage);

// Create Sequelize instance
const sequelize = new Sequelize({
    ...dbConfig,
    logging: msg => logger.debug(msg)
});

// Initialize models
const Device = defineDevice(sequelize);
const FieldMapping = defineFieldMapping(sequelize);
const AlertRule = defineAlertRule(sequelize);
const Record = defineRecord(sequelize);
const Alert = defineAlert(sequelize);
const User = defineUser(sequelize);
const DeviceGroup = defineDeviceGroup(sequelize);
const UserDeviceAccess = defineUserDeviceAccess(sequelize);

// Setup associations
Device.hasMany(FieldMapping, {
    foreignKey: 'deviceId',
    as: 'mappings'
});

Device.hasMany(Record, {
    foreignKey: 'deviceImei',
    as: 'records'
});

Record.belongsTo(Device, {
    foreignKey: 'deviceImei',
    as: 'device'
});

AlertRule.hasMany(Alert, {
    foreignKey: 'ruleId',
    as: 'alerts'
});

Alert.belongsTo(AlertRule, {
    foreignKey: 'ruleId',
    as: 'rule'
});

// User Management Associations
User.hasMany(UserDeviceAccess, {
    foreignKey: 'userId',
    as: 'deviceAccess'
});

User.hasMany(DeviceGroup, {
    foreignKey: 'createdBy',
    as: 'createdGroups'
});

Device.hasMany(UserDeviceAccess, {
    foreignKey: 'deviceId',
    as: 'userAccess'
});

Device.belongsTo(DeviceGroup, {
    foreignKey: 'groupId',
    as: 'group'
});

DeviceGroup.hasMany(Device, {
    foreignKey: 'groupId',
    as: 'devices'
});

DeviceGroup.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});

UserDeviceAccess.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

UserDeviceAccess.belongsTo(Device, {
    foreignKey: 'deviceId',
    as: 'device'
});

UserDeviceAccess.belongsTo(User, {
    foreignKey: 'grantedBy',
    as: 'grantedByUser'
});

// Export models and Sequelize instance
module.exports = {
    sequelize,
    Device,
    FieldMapping,
    AlertRule,
    Record,
    Alert,
    User,
    DeviceGroup,
    UserDeviceAccess
};
