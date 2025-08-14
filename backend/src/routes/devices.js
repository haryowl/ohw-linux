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

// Get all devices (filtered by user permissions)
router.get('/', requireAuth, filterDevicesByPermission, asyncHandler(async (req, res) => {
    console.log('GET /api/devices - User:', req.user.username, 'Role:', req.user.role);
    console.log('User permissions:', JSON.stringify(req.user.permissions, null, 2));
    
    let devices;
    
    // If admin, get all devices
    if (req.user.role === 'admin') {
        console.log('Admin user - getting all devices');
        devices = await deviceManager.getAllDevices();
    } else {
        console.log('Non-admin user - filtering devices by permissions');
        // Filter devices based on user permissions
        const { userPermissions } = req;
        console.log('User permissions from middleware:', JSON.stringify(userPermissions, null, 2));
        
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
            console.log('Getting devices from direct access:', directDeviceImeis);
            const directDevices = await Device.findAll({
                where: { imei: directDeviceImeis }
            });
            console.log('Direct devices found:', directDevices.length);
            accessibleDevices.push(...directDevices);
        }
        
        // Get devices from device groups
        if (userPermissions.deviceGroups && userPermissions.deviceGroups.length > 0) {
            console.log('Getting devices from device groups:', userPermissions.deviceGroups);
            const deviceGroups = await DeviceGroup.findAll({
                where: { id: userPermissions.deviceGroups },
                include: ['devices']
            });
            
            for (const group of deviceGroups) {
                if (group.devices) {
                    console.log(`Group ${group.name} has ${group.devices.length} devices`);
                    accessibleDevices.push(...group.devices);
                }
            }
        }
        
        // Remove duplicates
        const uniqueDevices = accessibleDevices.filter((device, index, self) => 
            index === self.findIndex(d => d.imei === device.imei)
        );
        
        console.log('Total accessible devices:', uniqueDevices.length);
        devices = uniqueDevices;
    }
    
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

