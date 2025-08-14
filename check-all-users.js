const { User, DeviceGroup, Device } = require('./backend/src/models');

async function checkAllUsers() {
    try {
        console.log('Checking all users in database...\n');
        
        // Find all users
        const users = await User.findAll();
        console.log(`Total users found: ${users.length}\n`);
        
        for (const user of users) {
            console.log(`User: ${user.username}`);
            console.log(`- ID: ${user.id}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Active: ${user.isActive}`);
            console.log(`- Permissions:`, JSON.stringify(user.permissions, null, 2));
            console.log('---');
        }
        
        // Check device groups
        console.log('\nChecking device groups...');
        const deviceGroups = await DeviceGroup.findAll();
        console.log(`Total device groups: ${deviceGroups.length}`);
        
        for (const group of deviceGroups) {
            console.log(`\nDevice Group: ${group.name} (ID: ${group.id})`);
            
            // Get devices in this group
            const devices = await Device.findAll({ where: { groupId: group.id } });
            console.log(`- Devices in group: ${devices.length}`);
            
            for (const device of devices) {
                console.log(`  - Device: ${device.name || device.imei} (IMEI: ${device.imei})`);
            }
        }
        
        // Check total devices
        console.log('\nChecking all devices...');
        const allDevices = await Device.findAll();
        console.log(`Total devices in database: ${allDevices.length}`);
        
        for (const device of allDevices) {
            console.log(`- ${device.name || device.imei} (IMEI: ${device.imei}, Group ID: ${device.groupId || 'none'})`);
        }
        
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        process.exit(0);
    }
}

checkAllUsers(); 