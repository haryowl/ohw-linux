const express = require('express');
const router = express.Router();
const { Record } = require('../models');
const { Op } = require('sequelize');
const { Parser: Json2csvParser } = require('json2csv');
const ExcelJS = require('exceljs');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

// Get records with optional date filtering - OPTIMIZED
router.get('/', requireAuth, asyncHandler(async (req, res) => {
    const requestStart = Date.now();
    console.log('🚀 GET /api/records - Starting request');
    
    let { startDate, endDate, limit = 100, range, imeis } = req.query;
    const where = {};
    const now = new Date();
    
    // Better defaults to prevent massive queries
    if (!range && !startDate && !endDate) {
        // Default to last 1h instead of 24h for better performance
        range = '1h';
    }
    
    if (range === '24h') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
    } else if (range === '1h') {
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        endDate = now;
    } else if (range === 'all') {
        // For 'all' requests, limit to last 7 days to prevent timeout
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
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
    
    // Better limit handling to prevent massive queries
    let queryLimit = parseInt(limit);
    if (limit === 'all' || queryLimit === 0 || isNaN(queryLimit)) {
        // Cap at 1000 records for 'all' requests to prevent timeout
        queryLimit = 1000;
    } else if (queryLimit > 1000) {
        // Cap at 1000 records maximum
        queryLimit = 1000;
    }
    
    console.log(`📊 Records query: ${range || 'custom'} range, limit: ${queryLimit}`);
    const dbStart = Date.now();
    
    const records = await Record.findAll({
        where,
        order: [['datetime', 'DESC']],
        limit: queryLimit,
        // Add attributes to reduce data transfer
        attributes: ['id', 'deviceImei', 'datetime', 'latitude', 'longitude', 'altitude', 'speed', 'course', 'satellites', 'hdop', 'forwarded']
    });
    
    const dbTime = Date.now() - dbStart;
    const totalTime = Date.now() - requestStart;
    
    console.log(`✅ Records query completed in ${dbTime}ms - Found ${records.length} records`);
    console.log(`✅ Total request time: ${totalTime}ms`);
    
    res.json(records);
}));

// Get available IMEIs for export filtering
router.get('/imeis', requireAuth, asyncHandler(async (req, res) => {
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
}));

// Export records
router.post('/export', requireAuth, asyncHandler(async (req, res) => {
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
}));

module.exports = router; 