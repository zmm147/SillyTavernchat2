/**
 * Example Plugin for SillyTavernchat
 * 
 * This plugin demonstrates the basic structure and functionality
 * of a SillyTavernchat server plugin.
 */

export const info = {
    id: 'example-plugin',
    name: 'Example Plugin',
    description: 'A simple example plugin that demonstrates plugin development'
};

// Plugin state
const pluginState = {
    messageCount: 0,
    startTime: Date.now(),
    lastMessage: null
};

/**
 * Initialize the plugin
 * @param {import('express').Router} router - Express router instance
 */
export async function init(router) {
    console.log('[example-plugin] Initializing...');
    
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            uptime: Date.now() - pluginState.startTime,
            messageCount: pluginState.messageCount
        });
    });
    
    // Get plugin info
    router.get('/info', (req, res) => {
        res.json({
            pluginId: info.id,
            pluginName: info.name,
            description: info.description,
            version: '1.0.0'
        });
    });
    
    // Echo endpoint - echoes back received data
    router.post('/echo', (req, res) => {
        const message = req.body.message || 'No message provided';
        pluginState.lastMessage = message;
        pluginState.messageCount++;
        
        res.json({
            received: message,
            echo: message.split('').reverse().join(''),
            messageNumber: pluginState.messageCount,
            timestamp: new Date().toISOString()
        });
    });
    
    // Get statistics
    router.get('/stats', (req, res) => {
        const uptime = Date.now() - pluginState.startTime;
        const uptimeSeconds = Math.floor(uptime / 1000);
        
        res.json({
            totalMessages: pluginState.messageCount,
            lastMessage: pluginState.lastMessage,
            uptime: {
                milliseconds: uptime,
                seconds: uptimeSeconds,
                minutes: Math.floor(uptimeSeconds / 60),
                hours: Math.floor(uptimeSeconds / 3600)
            },
            startTime: new Date(pluginState.startTime).toISOString(),
            messagesPerSecond: (pluginState.messageCount / (uptime / 1000)).toFixed(2)
        });
    });
    
    // Reset statistics
    router.post('/stats/reset', (req, res) => {
        pluginState.messageCount = 0;
        pluginState.startTime = Date.now();
        pluginState.lastMessage = null;
        
        res.json({
            success: true,
            message: 'Statistics reset'
        });
    });
    
    // Server info endpoint
    router.get('/server-info', (req, res) => {
        res.json({
            nodeVersion: process.version,
            platform: process.platform,
            dataRoot: globalThis.DATA_ROOT,
            environment: {
                debug: process.env.DEBUG === 'true',
                nodeEnv: process.env.NODE_ENV || 'development'
            }
        });
    });
    
    console.log('[example-plugin] Routes registered successfully');
}

/**
 * Plugin cleanup function - called when server shuts down
 */
export async function exit() {
    console.log('[example-plugin] Shutting down...');
    console.log(`[example-plugin] Total messages processed: ${pluginState.messageCount}`);
    console.log(`[example-plugin] Uptime: ${Math.floor((Date.now() - pluginState.startTime) / 1000)}s`);
}
