const express = require('express');
const router = express.Router();
const { User } = require('../models');
const logger = require('../utils/logger');
const sessionStore = require('../utils/sessionStore');

// Helper function to generate session token
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

 // Run every hour

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }
        
        // Find user
        const user = await User.findOne({ 
            where: { username, isActive: true },
            attributes: ['id', 'username', 'password', 'firstName', 'lastName', 'role', 'permissions']
        });
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid username or password' 
            });
        }
        
        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid username or password' 
            });
        }
        
        // Clear any existing sessions for this user
        await sessionStore.deleteByUserId(user.id);
        logger.info('Cleared existing sessions for user', { username: user.username });
        
        // Generate session token
        const token = generateToken();
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            createdAt: new Date()
        };
        
        await sessionStore.set(token, session);
        
        logger.info('Session stored in database', {
            token: token.substring(0, 8) + '...',
            userId: session.userId,
            username: session.username
        });
        
        // Update last login
        await user.update({ lastLogin: new Date() });
        
        // Clear any existing sessionToken cookie first
        res.clearCookie('sessionToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            domain: undefined
        });
        
        // Set session cookie
        res.cookie('sessionToken', token, {
            httpOnly: true,
            secure: false, // Set to false for HTTP connections
            sameSite: 'lax', // Use 'lax' for HTTP connections
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            domain: undefined // Remove domain restriction
        });
        
        // Return user data (without password)
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            permissions: user.permissions
        };
        
        logger.info('User logged in successfully', { 
            username: user.username, 
            token: token.substring(0, 8) + '...'
        });
        
        res.json(userData);
        
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.sessionToken;
        
        if (token) {
            const session = await sessionStore.get(token);
            if (session) {
                await sessionStore.delete(token);
                logger.info('User logged out', { username: session.username });
            }
        }
        
        // Clear session cookie
        res.clearCookie('sessionToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            domain: undefined
        });
        
        res.json({ message: 'Logged out successfully' });
        
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check authentication status
router.get('/check', requireAuth, async (req, res) => {
    try {
        // Get user data from database to ensure we have the latest info
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'permissions', 'isActive']
        });
        
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }
        
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            permissions: user.permissions
        };
        
        res.json(userData);
        
    } catch (error) {
        logger.error('Error checking authentication:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to check authentication (for other routes)
async function requireAuth(req, res, next) {
    const token = req.cookies.sessionToken;
    
    logger.info('requireAuth called', { 
        token: token ? token.substring(0, 8) + '...' : 'none',
        url: req.url,
        method: req.method
    });
    
    if (!token) {
        logger.warn('Authentication failed - no token');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        logger.info('Attempting to retrieve session from store');
        const session = await sessionStore.get(token);
        
        if (!session) {
            logger.warn('Authentication failed - invalid token', { 
                token: token.substring(0, 8) + '...'
            });
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        logger.info('Session retrieved successfully', {
            userId: session.userId,
            username: session.username,
            role: session.role
        });
        
        req.user = session;
        logger.info('Authentication successful', { 
            userId: session.userId, 
            username: session.username 
        });
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { router, requireAuth }; 