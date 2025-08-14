const express = require('express');
const router = express.Router();
const { Record } = require('../models');
const { Op } = require('sequelize');
const { Parser: Json2csvParser } = require('json2csv');
const ExcelJS = require('exceljs');

// Get records with optional date filtering
router.get('/', async (req, res) => {
    try {
        let { startDate, endDate, limit = 1000, range, imeis } = req.query;
        const where = {};
        const now = new Date();
        if (!range && !startDate && !endDate) {
            // Default to last 24h
            range = '24h';
        }
        if (range === '24h') {
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            endDate = now;
        } else if (range === 'all') {
            startDate = null;
            endDate = null;
        }
        if (startDate && endDate) {
            where.datetime = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        
        // Add IMEI filtering if provided
        if (imeis) {
            const imeiList = imeis.split(',').map(imei => imei.trim()).filter(imei => imei);
            if (imeiList.length > 0) {
                where.deviceImei = {
                    [Op.in]: imeiList
                };
            }
        }
        
        let queryLimit = parseInt(limit);
        if (limit === 'all' || queryLimit === 0 || isNaN(queryLimit)) {
            queryLimit = null; // No limit
        }
        const records = await Record.findAll({
            where,
            order: [['datetime', 'DESC']],
            limit: queryLimit
        });
        res.json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ 
            error: 'Failed to fetch records', 
            details: error.message, 
            stack: error.stack 
        });
    }
});

// Get available IMEIs for export filtering
router.get('/imeis', async (req, res) => {
    try {
        // Use a simpler approach to get distinct IMEIs
        const records = await Record.findAll({
            attributes: ['deviceImei'],
            group: ['deviceImei'],
            raw: true
        });
        
        const imeiList = records
            .map(item => item.deviceImei)
            .filter(imei => imei && imei.trim() !== '')
            .sort();
            
        res.json(imeiList);
    } catch (error) {
        console.error('Error fetching IMEIs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch IMEIs',
            details: error.message 
        });
    }
});

// Export records
router.post('/export', async (req, res) => {
    try {
        const { startDate, endDate, format, fields, imeis } = req.body;
        const where = {};
        
        // Use DATETIME field for time filtering instead of TIMESTAMP
        if (startDate && endDate) {
            where.datetime = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        
        // Add IMEI filtering if provided
        if (imeis && imeis.length > 0) {
            where.deviceImei = {
                [Op.in]: imeis
            };
        }
        
        const records = await Record.findAll({
            where,
            order: [['datetime', 'DESC']] // Order by device datetime instead of server timestamp
        });
        
        const data = records.map(r => r.toJSON());
        const selectedData = data.map(row => {
            const filtered = {};
            fields.forEach(f => filtered[f] = row[f]);
            return filtered;
        });
        
        if (format === 'csv') {
            const parser = new Json2csvParser({ fields });
            const csv = parser.parse(selectedData);
            res.header('Content-Type', 'text/csv');
            res.attachment('data-export.csv');
            return res.send(csv);
        } else if (format === 'json') {
            res.header('Content-Type', 'application/json');
            res.attachment('data-export.json');
            return res.send(JSON.stringify(selectedData, null, 2));
        } else if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Export');
            worksheet.columns = fields.map(f => ({ header: f, key: f }));
            worksheet.addRows(selectedData);
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment('data-export.xlsx');
            await workbook.xlsx.write(res);
            return res.end();
        } else {
            return res.status(400).json({ error: 'Invalid export format' });
        }
    } catch (error) {
        console.error('Error exporting records:', error);
        res.status(500).json({ error: 'Failed to export records' });
    }
});

module.exports = router; 