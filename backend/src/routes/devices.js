// backend/src/routes/devices.js
const express = require('express');
const router = express.Router();
const deviceManager = require('../services/deviceManager');
const asyncHandler = require('../utils/asyncHandler'); // Import the asyncHandler middleware
const tagDefinitions = require('../services/tagDefinitions');
const TagParser = require('../services/tagParser');
const { Record, Device, DeviceGroup } = require('../models');
const { Op } = require('sequelize');
const { requireAuth } = require('./auth');
const { checkDeviceAccess, filterDevicesByPermission } = require('../middleware/permissions');

// Simple in-memory cache for devices (5 minutes TTL)
const deviceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedDevices(userId, role) {
    const cacheKey = `${userId}-${role}`;
    const cached = deviceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedDevices(userId, role, data) {
    const cacheKey = `${userId}-${role}`;
    deviceCache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
}

// Get all devices (filtered by user permissions) - OPTIMIZED
router.get('/', requireAuth, filterDevicesByPermission, asyncHandler(async (req, res) => {
    console.log('GET /api/devices - User:', req.user.username, 'Role:', req.user.role);
    
    // Check cache first
    const cachedDevices = getCachedDevices(req.user.userId, req.user.role);
    if (cachedDevices) {
        console.log('Returning cached devices:', cachedDevices.length);
        return res.json(cachedDevices);
    }
    
    let devices;
    
    // If admin, get all devices with optimized query
    if (req.user.role === 'admin') {
        console.log('Admin user - getting all devices');
        devices = await Device.findAll({
            include: [{
                model: require('../models').FieldMapping,
                as: 'mappings',
                where: { enabled: true },
                required: false
            }],
            order: [['lastSeen', 'DESC']],
            // Add limit to prevent loading too many devices at once
            limit: 1000
        });
    } else {
        console.log('Non-admin user - filtering devices by permissions');
        // Optimized query for non-admin users
        const { userPermissions } = req;
        
        // Build efficient query conditions
        const deviceConditions = [];
        const groupConditions = [];
        
        // Direct device access
        if (userPermissions.devices && userPermissions.devices.length > 0) {
            deviceConditions.push({ imei: { [Op.in]: userPermissions.devices } });
        }
        
        // Device group access
        if (userPermissions.deviceGroups && userPermissions.deviceGroups.length > 0) {
            groupConditions.push({ id: { [Op.in]: userPermissions.deviceGroups } });
        }
        
        // User device access from UserDeviceAccess table
        const { UserDeviceAccess } = require('../models');
        const userDeviceAccess = await UserDeviceAccess.findAll({
            where: { 
                userId: req.user.userId,
                isActive: true
            },
            attributes: ['deviceId'],
            raw: true
        });
        
        if (userDeviceAccess.length > 0) {
            const deviceIds = userDeviceAccess.map(access => access.deviceId);
            deviceConditions.push({ id: { [Op.in]: deviceIds } });
        }
        
        // Combine all conditions
        const whereCondition = deviceConditions.length > 0 ? { [Op.or]: deviceConditions } : {};
        
        // Get devices with single optimized query
        devices = await Device.findAll({
            where: whereCondition,
            include: [
                {
                    model: require('../models').FieldMapping,
                    as: 'mappings',
                    where: { enabled: true },
                    required: false
                },
                // Include device groups if needed
                ...(groupConditions.length > 0 ? [{
                    model: DeviceGroup,
                    as: 'groups',
                    where: { [Op.or]: groupConditions },
                    required: false
                }] : [])
            ],
            order: [['lastSeen', 'DESC']],
            limit: 1000
        });
        
        // Filter out devices that don't have any group access if groups were specified
        if (groupConditions.length > 0) {
            devices = devices.filter(device => 
                deviceConditions.length > 0 || 
                (device.groups && device.groups.length > 0)
            );
        }
    }
    
    // Cache the result
    setCachedDevices(req.user.userId, req.user.role, devices);
    
    console.log('Returning devices:', devices.length);
    res.json(devices);
}));

// Get all devices with current location (filtered by user permissions)
router.get('/locations', requireAuth, filterDevicesByPermission, asyncHandler(async (req, res) => {
    console.log('GET /api/devices/locations - User:', req.user.username, 'Role:', req.user.role);
    
    let devices;
    
    // If admin, get all devices
    if (req.user.role === 'admin') {
        console.log('Admin user - getting all devices for locations');
        devices = await deviceManager.getAllDevices();
    } else {
        console.log('Non-admin user - filtering devices by permissions for locations');
        // Filter devices based on user permissions
        const { userPermissions } = req;
        const accessibleDevices = [];
        
        // Get devices from direct access (both permissions and UserDeviceAccess table)
        const directDeviceImeis = [];
        
        // From permissions.devices
        if (userPermissions.devices && userPermissions.devices.length > 0) {
            directDeviceImeis.push(...userPermissions.devices);
        }
        
        // From UserDeviceAccess table
        const { UserDeviceAccess } = require('../models');
        const userDeviceAccess = await UserDeviceAccess.findAll({
            where: { 
                userId: req.user.userId,
                isActive: true
            },
            include: [
                {
                    model: Device,
                    as: 'device'
                }
            ]
        });
        
        for (const access of userDeviceAccess) {
            if (access.device && !directDeviceImeis.includes(access.device.imei)) {
                directDeviceImeis.push(access.device.imei);
            }
        }
        
        if (directDeviceImeis.length > 0) {
            const directDevices = await Device.findAll({
                where: { imei: directDeviceImeis }
            });
            accessibleDevices.push(...directDevices);
        }
        
        // Get devices from device groups
        if (userPermissions.deviceGroups && userPermissions.deviceGroups.length > 0) {
            const deviceGroups = await DeviceGroup.findAll({
                where: { id: userPermissions.deviceGroups },
                include: ['devices']
            });
            
            for (const group of deviceGroups) {
                if (group.devices) {
                    accessibleDevices.push(...group.devices);
                }
            }
        }
        
        // Remove duplicates
        const uniqueDevices = accessibleDevices.filter((device, index, self) => 
            index === self.findIndex(d => d.imei === device.imei)
        );
        
        devices = uniqueDevices;
    }
    
    console.log('Getting locations for devices:', devices.length);
    
    // Get the latest location for each device
    const devicesWithLocations = await Promise.all(
        devices.map(async (device) => {
            const latestRecord = await Record.findOne({
                where: {
                    deviceImei: device.imei,
                    latitude: { [Op.ne]: null },
                    longitude: { [Op.ne]: null }
                },
                order: [['timestamp', 'DESC']],
                attributes: ['latitude', 'longitude', 'timestamp', 'speed', 'direction']
            });
            
            return {
                ...device.toJSON(),
                location: latestRecord ? {
                    latitude: latestRecord.latitude,
                    longitude: latestRecord.longitude,
                    timestamp: latestRecord.timestamp,
                    speed: latestRecord.speed,
                    direction: latestRecord.direction
                } : null
            };
        })
    );
    
    console.log('Returning devices with locations:', devicesWithLocations.length);
    res.json(devicesWithLocations);
}));

// Get device by ID (with permission check)
router.get('/:id', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const device = await deviceManager.getDeviceById(req.params.id);
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
}));

// Update device (with permission check)
router.put('/:id', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const device = await deviceManager.getDeviceById(id);
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    // Validate customFields if provided
    if (updates.customFields && typeof updates.customFields !== 'object') {
        return res.status(400).json({ message: 'Custom fields must be an object' });
    }

    // Filter out empty custom field values
    if (updates.customFields) {
        const filteredCustomFields = {};
        Object.entries(updates.customFields).forEach(([key, value]) => {
            if (key.trim() && value !== null && value !== undefined && value !== '') {
                filteredCustomFields[key.trim()] = value;
            }
        });
        updates.customFields = filteredCustomFields;
    }

    await device.update(updates);
    
    // Return the updated device
    const updatedDevice = await deviceManager.getDeviceById(id);
    res.json({ 
        message: 'Device updated successfully',
        device: updatedDevice
    });
}));

// Delete device (with permission check)
router.delete('/:id', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const device = await deviceManager.getDeviceById(id);
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    await device.destroy();
    res.json({ message: 'Device deleted successfully' });
}));

module.exports = router;

