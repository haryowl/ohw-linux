const { User, DeviceGroup } = require('../models');

// Middleware to check if user has access to specific devices
async function checkDeviceAccess(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Admin has access to all devices
        if (user.role === 'admin') {
            return next();
        }

        const deviceId = req.params.deviceId || req.params.id;
        if (!deviceId) {
            return next(); // No specific device requested
        }

        // Check if user has direct access to this device
        const { permissions } = user;
        if (permissions.devices && permissions.devices.includes(deviceId)) {
            return next();
        }
        
        // Check if user has access through UserDeviceAccess table
        const { UserDeviceAccess, Device } = require('../models');
        const userDeviceAccess = await UserDeviceAccess.findOne({
            where: { 
                userId: user.userId,
                isActive: true
            },
            include: [
                {
                    model: Device,
                    as: 'device',
                    where: { imei: deviceId }
                }
            ]
        });
        
        if (userDeviceAccess) {
            return next();
        }

        // Check if user has access through device groups
        if (permissions.deviceGroups && permissions.deviceGroups.length > 0) {
            const deviceGroups = await DeviceGroup.findAll({
                where: { id: permissions.deviceGroups },
                include: ['devices']
            });

            for (const group of deviceGroups) {
                if (group.devices && group.devices.some(device => device.imei === deviceId)) {
                    return next();
                }
            }
        }

        return res.status(403).json({ error: 'Access denied to this device' });
    } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Middleware to filter devices based on user permissions
async function filterDevicesByPermission(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Admin can see all devices
        if (user.role === 'admin') {
            return next();
        }

        // Store user permissions in request for later use
        req.userPermissions = user.permissions;
        return next();
    } catch (error) {
        console.error('Permission filter error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Middleware to check menu access
function checkMenuAccess(menuName) {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Admin has access to all menus
            if (user.role === 'admin') {
                return next();
            }

            // Check if user has access to this menu
            const { permissions } = user;
            if (!permissions || !permissions.menus) {
                return res.status(403).json({ error: 'No menu permissions' });
            }

            if (!permissions.menus.includes(menuName.toLowerCase())) {
                return res.status(403).json({ error: 'Access denied to this menu' });
            }

            return next();
        } catch (error) {
            console.error('Menu access check error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
}

module.exports = {
    checkDeviceAccess,
    filterDevicesByPermission,
    checkMenuAccess
}; 