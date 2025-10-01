const { Record, Device } = require('./src/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function manualAutoExport() {
    console.log('🧪 Manual auto-export test...');
    
    try {
        // Get yesterday's records
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        const endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        
        const records = await Record.findAll({
            where: {
                datetime: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['datetime', 'ASC']]
        });
        
        console.log('📊 Found records:', records.length);
        
        if (records.length === 0) {
            console.log('❌ No records found');
            return;
        }
        
        // Create exports directory
        const exportsDir = path.join(__dirname, 'exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }
        
        // Generate CSV
        const csv = 'IMEI,Timestamp,Lat,Lon,Alt,Satellite,Speed,Sensor Kiri,Sensor Kanan,Sensor Serial,Uptime Seconds\n' +
            records.map(record => {
                return [
                    record.deviceImei,
                    record.datetime ? new Date(record.datetime).toLocaleString() : 'N/A',
                    record.latitude || 'N/A',
                    record.longitude || 'N/A',
                    record.altitude || 'N/A',
                    record.satellites || 'N/A',
                    record.speed || 'N/A',
                    record.userData0 || 'N/A',
                    record.userData1 || 'N/A',
                    record.modbus0 || 'N/A',
                    record.userData2 || 'N/A'
                ].join(',');
            }).join('\n');
        
        // Generate filename
        const dateStr = yesterday.toISOString().split('T')[0];
        const filename = `all_devices_${dateStr}.pfsl`;
        const filepath = path.join(exportsDir, filename);
        
        // Write file
        fs.writeFileSync(filepath, csv);
        
        console.log('✅ Manual export completed:', filename);
        console.log('📁 File saved to:', filepath);
        console.log('📊 Records exported:', records.length);
        
    } catch (error) {
        console.error('❌ Manual export failed:', error);
    }
}

manualAutoExport();