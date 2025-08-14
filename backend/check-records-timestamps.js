const { Record } = require('./src/models');

async function main() {
  try {
    // Count total records
    const total = await Record.count();
    console.log('Total records:', total);

    // Find min/max device datetime (use 'datetime' field if available, else fallback to 'timestamp')
    const minRecord = await Record.findOne({ order: [['datetime', 'ASC']] });
    const maxRecord = await Record.findOne({ order: [['datetime', 'DESC']] });

    if (minRecord && maxRecord && minRecord.datetime && maxRecord.datetime) {
      console.log('Earliest device datetime:', minRecord.datetime);
      console.log('Latest device datetime:', maxRecord.datetime);
    } else {
      // Fallback to server timestamp
      const minTs = await Record.findOne({ order: [['timestamp', 'ASC']] });
      const maxTs = await Record.findOne({ order: [['timestamp', 'DESC']] });
      if (minTs && maxTs) {
        console.log('Earliest server timestamp:', minTs.timestamp);
        console.log('Latest server timestamp:', maxTs.timestamp);
      } else {
        console.log('No records found.');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 