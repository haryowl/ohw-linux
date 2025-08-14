// backend/src/app.js

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const http = require('http');
const websocketHandler = require('./services/websocketHandler');
const GalileoskyParser = require('./services/parser');
const logger = require('./utils/logger');
const net = require('net');

// Configure server with larger header limits
const server = http.createServer({
    maxHeaderSize: 32768, // 32KB header limit (default is 8KB)
    maxHttpHeaderSize: 32768
}, app);

// Create parser instance
const parser = new GalileoskyParser();

// Global data references for mobile application (in-memory arrays)
global.parsedData = [];
global.devices = new Map();
global.lastIMEI = null;

app.use(cors(config.http.cors)); // Apply CORS middleware
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' })); // Increase JSON body limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded body limit

// Add request size limits
app.use((req, res, next) => {
    // Log request headers for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        const headerSize = JSON.stringify(req.headers).length;
        if (headerSize > 8000) { // Log if headers are large
            logger.warn('Large request headers detected', {
                size: headerSize,
                url: req.url,
                method: req.method,
                userAgent: req.headers['user-agent']
            });
        }
    }
    next();
});

// Serve static files if frontend build exists
const frontendBuildPath = path.join(__dirname, '..', '..', 'frontend', 'build');
if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
}

// Initialize WebSocket
websocketHandler.initialize(server);

// Listen for record storage events from parser and broadcast to WebSocket clients
parser.on('recordStored', (record) => {
    logger.info('Broadcasting record to WebSocket clients', {
        imei: record.imei,
        timestamp: record.timestamp
    });
    
    // Extract GPS data if available
    let latitude = null, longitude = null, speed = null, direction = null;
    if (record.tags) {
        // Try to extract from tags (Galileosky format)
        if (record.tags['0x30'] && record.tags['0x30'].value) {
            latitude = record.tags['0x30'].value.latitude;
            longitude = record.tags['0x30'].value.longitude;
        }
        if (record.tags['0x33'] && record.tags['0x33'].value) {
            speed = record.tags['0x33'].value.speed;
            direction = record.tags['0x33'].value.direction;
        }
    }
    // Fallback for other formats (e.g., type 33 handler)
    if (record.latitude && record.longitude) {
        latitude = record.latitude;
        longitude = record.longitude;
    }
    if (record.speed) speed = record.speed;
    if (record.direction || record.course) direction = record.direction || record.course;

    // Import the broadcast function from server.js
    const { broadcast } = require('./server');
    if (broadcast) {
        broadcast('new_record', {
            imei: record.imei,
            timestamp: record.timestamp,
            latitude,
            longitude,
            speed,
            direction,
            data: record.tags,
            recordNumber: record.recordNumber
        });
    }
});

// Listen for device update events from parser and broadcast to WebSocket clients
parser.on('deviceUpdated', (deviceInfo) => {
    logger.info('Broadcasting device update to WebSocket clients', {
        imei: deviceInfo.imei,
        isNew: deviceInfo.isNew,
        isActive: deviceInfo.isActive
    });
    
    // Import the broadcast function from server.js
    const { broadcast } = require('./server');
    if (broadcast) {
        broadcast('device_updated', {
            imei: deviceInfo.imei,
            isNew: deviceInfo.isNew,
            lastSeen: deviceInfo.lastSeen,
            isActive: deviceInfo.isActive
        });
    }
});

// Mount routes directly
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/devices', require('./routes/devices'));
app.use('/api/data', require('./routes/data'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/mapping', require('./routes/mapping'));
app.use('/api/records', require('./routes/records'));
app.use('/api/peer', require('./routes/peer'));
app.use('/api/users', require('./routes/users'));
app.use('/api/device-groups', require('./routes/deviceGroups'));

// Dashboard stats route
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const dataAggregator = require('./services/dataAggregator');
        const stats = await dataAggregator.getDashboardData();
        res.json(stats);
    } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Connection statistics route
app.get('/api/connections/stats', (req, res) => {
    try {
        const stats = parser.getConnectionStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error fetching connection stats:', error);
        res.status(500).json({ error: 'Failed to fetch connection stats' });
    }
});

// TCP Server for device connections
const tcpServer = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logger.info('New device connected:', { address: clientAddress });

    // Clear IMEI for this specific connection
    parser.clearIMEI(clientAddress);

    let buffer = Buffer.alloc(0);
    let unsentData = Buffer.alloc(0);

    // Set socket options to prevent hanging connections
    socket.setKeepAlive(true, 60000); // 60 seconds
    socket.setTimeout(30000); // 30 seconds timeout

    socket.on('data', async (data) => {
        try {
            // Log raw data received
            logger.info('Raw data received:', {
                address: socket.remoteAddress + ':' + socket.remotePort,
                bufferLength: data.length,
                hex: data.toString('hex').toUpperCase(),
                length: data.length,
                timestamp: new Date().toISOString()
            });

            // Combine any unsent data with new data
            if (unsentData.length > 0) {
                buffer = Buffer.concat([unsentData, data]);
                unsentData = Buffer.alloc(0);
            } else {
                buffer = data;
            }

            // Process all complete packets in the buffer
            const packets = [];
            
            while (buffer.length >= 3) {  // Minimum packet size (HEAD + LENGTH)
                const packetType = buffer.readUInt8(0);
                const rawLength = buffer.readUInt16LE(1);
                // Only use the lower 15 bits for length
                const actualLength = rawLength & 0x7FFF;  // Mask with 0x7FFF to get only lower 15 bits
                const totalLength = actualLength + 3;  // HEAD + LENGTH + DATA + CRC

                // Check if we have a complete packet
                if (buffer.length < totalLength + 2) {  // +2 for CRC
                    unsentData = Buffer.from(buffer);
                    break;
                }

                // Extract the complete packet
                const packet = buffer.slice(0, totalLength + 2);
                buffer = buffer.slice(totalLength + 2);

                // Determine packet type
                const isIgnorablePacket = packetType === 0x15;
                const isExtensionPacket = packetType !== 0x01 && !isIgnorablePacket;

                // Log packet details
                logger.info('Packet details:', {
                    address: socket.remoteAddress + ':' + socket.remotePort,
                    type: `0x${packetType.toString(16).padStart(2, '0')}`,
                    packetType: isIgnorablePacket ? 'Ignored' : (isExtensionPacket ? 'Extension' : 'Main Packet'),
                    length: actualLength,
                    totalLength,
                    bufferLength: buffer.length,
                    hasUnsentData: buffer.length > 0,
                    timestamp: new Date().toISOString()
                });

                // Handle different packet types
                if (isIgnorablePacket) {
                    logger.info('Ignoring packet type 0x15');
                    // Send confirmation immediately for ignorable packets
                    const packetChecksum = packet.readUInt16LE(packet.length - 2);
                    const confirmation = Buffer.from([0x02, packetChecksum & 0xFF, (packetChecksum >> 8) & 0xFF]);
                    socket.write(confirmation);
                    logger.info('Confirmation sent for ignorable packet:', {
                        address: socket.remoteAddress + ':' + socket.remotePort,
                        hex: confirmation.toString('hex').toUpperCase(),
                        checksum: `0x${confirmation.slice(1).toString('hex').toUpperCase()}`,
                        timestamp: new Date().toISOString()
                    });
                    continue;
                }

                if (isExtensionPacket) {
                    // Handle extension packet immediately
                    const packetChecksum = packet.readUInt16LE(packet.length - 2);
                    const confirmation = Buffer.from([0x02, packetChecksum & 0xFF, (packetChecksum >> 8) & 0xFF]);
                    socket.write(confirmation);
                    logger.info('Confirmation sent for extension packet:', {
                        address: socket.remoteAddress + ':' + socket.remotePort,
                        hex: confirmation.toString('hex').toUpperCase(),
                        checksum: `0x${confirmation.slice(1).toString('hex').toUpperCase()}`,
                        timestamp: new Date().toISOString()
                    });
                    continue;
                }

                // Queue main packets for processing
                packets.push(packet);
            }

            // Process all main packets using the parser directly
            for (const packet of packets) {
                try {
                    // Send confirmation immediately (don't wait for processing)
                    const packetChecksum = packet.readUInt16LE(packet.length - 2);
                    const confirmation = Buffer.from([0x02, packetChecksum & 0xFF, (packetChecksum >> 8) & 0xFF]);
                    socket.write(confirmation);
                    
                    logger.info('Confirmation sent:', {
                        address: socket.remoteAddress + ':' + socket.remotePort,
                        hex: confirmation.toString('hex').toUpperCase(),
                        checksum: `0x${confirmation.slice(1).toString('hex').toUpperCase()}`,
                        packetLength: packet.length - 5, // Subtract header, length, and CRC
                        timestamp: new Date().toISOString()
                    });

                    // Parse packet using the parser directly (like original implementation)
                    const parsedData = await parser.parse(packet, clientAddress);
                    
                    logger.info('Packet parsed successfully:', {
                        address: socket.remoteAddress + ':' + socket.remotePort,
                        recordsCount: parsedData?.records?.length || 0,
                        timestamp: new Date().toISOString()
                    });

                } catch (error) {
                    logger.error('Error processing packet:', {
                        address: socket.remoteAddress + ':' + socket.remotePort,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }

        } catch (error) {
            logger.error('Error processing data:', {
                address: socket.remoteAddress + ':' + socket.remotePort,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('error', (error) => {
        logger.error('Socket error:', {
            error: error.message,
            address: clientAddress,
            timestamp: new Date().toISOString()
        });
        // Force close the socket on error
        socket.destroy();
    });

    socket.on('timeout', () => {
        logger.warn('Socket timeout, closing connection:', {
            address: clientAddress,
            timestamp: new Date().toISOString()
        });
        socket.destroy();
    });

    socket.on('close', (hadError) => {
        logger.info('Device disconnected:', {
            address: clientAddress,
            hadError,
            timestamp: new Date().toISOString()
        });
        // Clear buffer on disconnect
        buffer = Buffer.alloc(0);
        unsentData = Buffer.alloc(0);
        // Clear IMEI for this specific connection
        parser.clearIMEI(clientAddress);
    });

    socket.on('end', () => {
        logger.info('Device ended connection:', {
            address: clientAddress,
            timestamp: new Date().toISOString()
        });
        socket.destroy();
    });
});

// Start TCP server
const PORT = process.env.TCP_PORT || 3003;
tcpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`TCP server listening on port ${PORT} (all interfaces)`);
}).on('error', (error) => {
    logger.error('TCP server error:', error);
});

// Handle server errors
tcpServer.on('error', (error) => {
    logger.error('TCP server error:', error);
});

// Handle server close
tcpServer.on('close', () => {
    logger.info('TCP server closed');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, starting graceful shutdown...');
    
    // Stop accepting new connections
    tcpServer.close(() => {
        logger.info('TCP server stopped accepting new connections');
    });
    
    // Close HTTP server
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, starting graceful shutdown...');
    
    // Stop accepting new connections
    tcpServer.close(() => {
        logger.info('TCP server stopped accepting new connections');
    });
    
    // Close HTTP server
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

server.listen(config.http.port, '0.0.0.0', () => {
    logger.info(`HTTP server listening on port ${config.http.port} (all interfaces)`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Application error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Export both the Express app and TCP server
module.exports = { app, tcpServer };