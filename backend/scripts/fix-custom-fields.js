const { Device } = require('../src/models');

async function fixCustomFields() {
  try {
    const devices = await Device.findAll();
    let fixedCount = 0;
    let errorCount = 0;
    for (const device of devices) {
      if (typeof device.customFields === 'string') {
        try {
          const parsed = JSON.parse(device.customFields);
          await device.update({ customFields: parsed });
          fixedCount++;
          console.log(`Fixed device ${device.id} (${device.imei})`);
        } catch (e) {
          errorCount++;
          console.error(`Failed to parse customFields for device ${device.id} (${device.imei}):`, e.message);
        }
      }
    }
    console.log(`Custom fields fix complete. Fixed: ${fixedCount}, Errors: ${errorCount}`);
  } catch (err) {
    console.error('Error running fix:', err);
  } finally {
    process.exit(0);
  }
}

fixCustomFields(); 