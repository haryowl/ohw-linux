const { Device } = require('./backend/src/models');

async function testCustomFields() {
  try {
    // Get a device
    const device = await Device.findOne();
    if (!device) {
      console.log('No devices found');
      return;
    }

    console.log('Testing custom fields for device:', device.imei);
    console.log('Current customFields:', device.customFields);
    console.log('Type of customFields:', typeof device.customFields);

    // Test setting custom fields
    const testFields = {
      TEST: 'test',
      Location: 'Warehouse A',
      Owner: 'John Doe'
    };

    console.log('\nSetting custom fields to:', testFields);
    await device.update({ customFields: testFields });

    // Reload the device
    await device.reload();
    console.log('After update - customFields:', device.customFields);
    console.log('Type after update:', typeof device.customFields);

    // Test that it's an object and has the expected properties
    if (typeof device.customFields === 'object' && device.customFields.TEST === 'test') {
      console.log('✅ Custom fields working correctly!');
    } else {
      console.log('❌ Custom fields not working correctly');
    }

  } catch (error) {
    console.error('Error testing custom fields:', error);
  } finally {
    process.exit(0);
  }
}

testCustomFields(); 