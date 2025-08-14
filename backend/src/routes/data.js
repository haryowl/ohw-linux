// backend/src/routes/data.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler'); // Import your async error handler
const dataAggregator = require('../services/dataAggregator'); // Import your data service
const { Record, Device, DeviceGroup } = require('../models');
const { Op } = require('sequelize');
const { requireAuth } = require('./auth');
const { checkDeviceAccess, filterDevicesByPermission } = require('../middleware/permissions');
const { getAvailableColumns, columnSets } = require('../utils/columnHelper');

// Get device data (with permission check)
router.get('/:deviceId', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const data = await dataAggregator.getDeviceData(deviceId); // Call your data service
    res.json(data);
}));

// Get tracking data for a device (using device datetime for filtering)
router.get('/:deviceId/tracking', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { startDate, endDate } = req.query;
    
    const where = {
        deviceImei: deviceId,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
    };
    
    if (startDate && endDate) {
        // Use device datetime field for filtering instead of server timestamp
        where.datetime = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }
    
    // Get available columns for tracking data
    const availableColumns = getAvailableColumns(columnSets.tracking, Record);
    
    const trackingData = await Record.findAll({
        where,
        attributes: availableColumns,
        order: [['datetime', 'ASC']] // Order by device datetime instead of server timestamp
    });
    
    res.json(trackingData);
}));

// Get export data for a device (using device datetime for filtering)
router.get('/:deviceId/export', requireAuth, checkDeviceAccess, asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { startDate, endDate } = req.query;
    
    const where = {
        deviceImei: deviceId
    };
    
    if (startDate && endDate) {
        // Use device datetime field for filtering instead of server timestamp
        where.datetime = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }
    
    // Get available columns for export data
    const availableColumns = getAvailableColumns(columnSets.export, Record);
    
    const exportData = await Record.findAll({
        where,
        attributes: availableColumns,
        order: [['datetime', 'ASC']] // Order by device datetime instead of server timestamp
    });
    
    res.json(exportData);
}));

// Get dashboard data (filtered by user permissions)
router.get('/dashboard', requireAuth, filterDevicesByPermission, asyncHandler(async (req, res) => {
    let accessibleDevices = [];
    
    // If admin, get all devices
    if (req.user.role === 'admin') {
        const allDevices = await Device.findAll();
        accessibleDevices = allDevices.map(device => device.imei);
    } else {
        // Filter devices based on user permissions
        const { userPermissions } = req;
        
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
        
        accessibleDevices.push(...directDeviceImeis);
        
        // Get devices from device groups
        if (userPermissions.deviceGroups && userPermissions.deviceGroups.length > 0) {
            const deviceGroups = await DeviceGroup.findAll({
                where: { id: userPermissions.deviceGroups },
                include: ['devices']
            });
            
            for (const group of deviceGroups) {
                if (group.devices) {
                    accessibleDevices.push(...group.devices.map(device => device.imei));
                }
            }
        }
        
        // Remove duplicates
        accessibleDevices = [...new Set(accessibleDevices)];
    }
    
    // Get stats and realtime data for accessible devices only
    const stats = await dataAggregator.getDashboardData(accessibleDevices);
    const realtimeData = await dataAggregator.getRealtimeData(accessibleDevices);
    
    res.json({ stats, realtimeData });
}));

module.exports = router;
