const { Record } = require('./src/models');
const { Op } = require('sequelize');

async function checkRecords() {
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
        limit: 5
    });
    
    console.log('Records found:', records.length);
    if (records.length > 0) {
        console.log('Sample record:', records[0].dataValues);
    }
}

checkRecords();