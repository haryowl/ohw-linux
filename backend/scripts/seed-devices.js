const { sequelize, Device, DeviceGroup, User } = require('../src/models');

async function seedDevices() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Get an admin user for creating the group
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Create a device group if it doesn't exist
    let deviceGroup = await DeviceGroup.findOne({ where: { name: 'Test Group' } });
    if (!deviceGroup) {
      deviceGroup = await DeviceGroup.create({
        name: 'Test Group',
        description: 'Group for testing virtual devices',
        color: '#1976d2',
        createdBy: adminUser.id
      });
      console.log('Created device group:', deviceGroup.name);
    }

    // Sample virtual devices
    const virtualDevices = [
      {
        imei: '123456789012345',
        name: 'Virtual Device 1',
        hardwareVersion: 'v1.0',
        firmwareVersion: 'v2.1.0',
        status: 'active',
        groupId: deviceGroup.id,
        lastSeen: new Date()
      },
      {
        imei: '234567890123456',
        name: 'Virtual Device 2',
        hardwareVersion: 'v1.1',
        firmwareVersion: 'v2.2.0',
        status: 'active',
        groupId: deviceGroup.id,
        lastSeen: new Date()
      },
      {
        imei: '345678901234567',
        name: 'Virtual Device 3',
        hardwareVersion: 'v1.2',
        firmwareVersion: 'v2.3.0',
        status: 'inactive',
        groupId: deviceGroup.id,
        lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        imei: '456789012345678',
        name: 'Virtual Device 4',
        hardwareVersion: 'v1.0',
        firmwareVersion: 'v2.1.0',
        status: 'offline',
        groupId: deviceGroup.id,
        lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      },
      {
        imei: '567890123456789',
        name: 'Virtual Device 5',
        hardwareVersion: 'v1.3',
        firmwareVersion: 'v2.4.0',
        status: 'active',
        groupId: deviceGroup.id,
        lastSeen: new Date()
      }
    ];

    // Check existing devices
    const existingDevices = await Device.findAll();
    console.log(`Found ${existingDevices.length} existing devices`);

    // Create virtual devices
    for (const deviceData of virtualDevices) {
      const existingDevice = await Device.findOne({ where: { imei: deviceData.imei } });
      
      if (!existingDevice) {
        const device = await Device.create(deviceData);
        console.log(`Created virtual device: ${device.name} (${device.imei})`);
      } else {
        console.log(`Device already exists: ${existingDevice.name} (${existingDevice.imei})`);
      }
    }

    // Display all devices
    const allDevices = await Device.findAll({
      include: [{ model: DeviceGroup, as: 'group' }]
    });

    console.log('\nAll devices in database:');
    allDevices.forEach(device => {
      console.log(`- ${device.name} (${device.imei}) - Status: ${device.status} - Group: ${device.group?.name || 'None'}`);
    });

    console.log(`\nTotal devices: ${allDevices.length}`);

  } catch (error) {
    console.error('Error seeding devices:', error);
  } finally {
    await sequelize.close();
  }
}

seedDevices(); 