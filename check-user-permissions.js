const { User, DeviceGroup, Device } = require('./backend/src/models');

async function checkUserPermissions() {
    try {
        console.log('Checking user permissions...\n');
        
        // Find user alfi
        const user = await User.findOne({ where: { username: 'alfi' } });
        if (!user) {
            console.log('User "alfi" not found');
            return;
        }
        
        console.log('User found:');
        console.log('- ID:', user.id);
        console.log('- Username:', user.username);
        console.log('- Role:', user.role);
        console.log('- Permissions:', JSON.stringify(user.permissions, null, 2));
        
        // Check device groups
        console.log('\nChecking device groups...');
        const deviceGroups = await DeviceGroup.findAll();
        console.log('Total device groups:', deviceGroups.length);
        
        for (const group of deviceGroups) {
            console.log(`\nDevice Group: ${group.name} (ID: ${group.id})`);
            
            // Get devices in this group
            const devices = await Device.findAll({ where: { groupId: group.id } });
            console.log(`- Devices in group: ${devices.length}`);
            
            for (const device of devices) {
                console.log(`  - Device: ${device.name || device.imei} (IMEI: ${device.imei})`);
            }
            
            // Check if user has access to this group
            if (user.permissions.deviceGroups && user.permissions.deviceGroups.includes(group.id)) {
                console.log(`- User HAS access to this group`);
            } else {
                console.log(`- User does NOT have access to this group`);
            }
        }
        
        // Check total accessible devices for user
        console.log('\nCalculating accessible devices for user...');
        let accessibleDevices = [];
        
        // Get devices from direct access
        if (user.permissions.devices && user.permissions.devices.length > 0) {
            const directDevices = await Device.findAll({
                where: { imei: user.permissions.devices }
            });
            accessibleDevices.push(...directDevices);
            console.log(`- Direct device access: ${directDevices.length} devices`);
        }
        
        // Get devices from device groups
        if (user.permissions.deviceGroups && user.permissions.deviceGroups.length > 0) {
            const deviceGroups = await DeviceGroup.findAll({
                where: { id: user.permissions.deviceGroups },
                include: ['devices']
            });
            
            for (const group of deviceGroups) {
                if (group.devices) {
                    accessibleDevices.push(...group.devices);
                    console.log(`- Group "${group.name}": ${group.devices.length} devices`);
                }
            }
        }
        
        // Remove duplicates
        const uniqueDevices = accessibleDevices.filter((device, index, self) => 
            index === self.findIndex(d => d.imei === device.imei)
        );
        
        console.log(`\nTotal accessible devices for user: ${uniqueDevices.length}`);
        for (const device of uniqueDevices) {
            console.log(`- ${device.name || device.imei} (IMEI: ${device.imei})`);
        }
        
    } catch (error) {
        console.error('Error checking user permissions:', error);
    } finally {
        process.exit(0);
    }
}

checkUserPermissions(); 