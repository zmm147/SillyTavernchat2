/**
 * Plugin Template for SillyTavernchat
 * 
 * This is a template for creating your own SillyTavernchat plugins.
 * Replace all placeholder text and implement your plugin logic.
 */

import fs from 'node:fs';
import path from 'node:path';

// Plugin metadata - REQUIRED
export const info = {
    // Unique identifier (lowercase letters, numbers, underscores, hyphens only)
    id: 'plugin-template',
    // Display name
    name: 'Plugin Template',
    // Description
    description: 'A template for creating SillyTavernchat plugins'
};

// Plugin state (optional)
const pluginState = {
    initialized: false,
    requestCount: 0
};

/**
 * Initialize the plugin
 * This function is called when the plugin is loaded
 * 
 * @param {import('express').Router} router - Express router instance
 * @returns {Promise<void>}
 */
export async function init(router) {
    console.log(`[${info.id}] Initializing ${info.name}...`);

    try {
        // TODO: Add your initialization logic here
        
        // Example: Load configuration
        // const config = loadConfig();
        
        // Example: Initialize database
        // await initDatabase();
        
        pluginState.initialized = true;

        // Register routes
        registerRoutes(router);

        console.log(`[${info.id}] Successfully initialized`);
    } catch (error) {
        console.error(`[${info.id}] Initialization failed:`, error);
        throw error;
    }
}

/**
 * Register all API routes for this plugin
 * 
 * @param {import('express').Router} router - Express router instance
 */
function registerRoutes(router) {
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            pluginId: info.id,
            initialized: pluginState.initialized
        });
    });

    // Status endpoint
    router.get('/status', (req, res) => {
        res.json({
            pluginName: info.name,
            description: info.description,
            status: 'active',
            requestCount: pluginState.requestCount
        });
    });

    // Example GET endpoint
    router.get('/example', (req, res) => {
        pluginState.requestCount++;
        
        res.json({
            message: 'This is an example endpoint',
            data: {
                example: 'value'
            }
        });
    });

    // Example POST endpoint
    router.post('/example', (req, res) => {
        pluginState.requestCount++;
        
        // TODO: Add validation and error handling
        
        res.status(201).json({
            success: true,
            data: req.body,
            message: 'Data received and processed'
        });
    });

    // TODO: Add more routes here
}

/**
 * Plugin cleanup function
 * This function is called when the server shuts down
 * Use it to close connections, clean up resources, etc.
 * 
 * @returns {Promise<void>}
 */
export async function exit() {
    console.log(`[${info.id}] Shutting down...`);

    try {
        // TODO: Add your cleanup logic here
        
        // Example: Close database connection
        // await closeDatabase();
        
        // Example: Clean up temporary files
        // cleanupTempFiles();
        
        console.log(`[${info.id}] Shutdown complete`);
        console.log(`[${info.id}] Total requests processed: ${pluginState.requestCount}`);
    } catch (error) {
        console.error(`[${info.id}] Error during shutdown:`, error);
    }
}

// ============================================================================
// Helper Functions - Add your helper functions here
// ============================================================================

/**
 * Example: Load configuration from file
 * 
 * @returns {Object} Configuration object
 */
function loadConfig() {
    const configPath = path.join(globalThis.DATA_ROOT, `${info.id}-config.json`);
    
    if (fs.existsSync(configPath)) {
        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error(`[${info.id}] Error loading config:`, error);
            return {};
        }
    }
    
    return {};
}

/**
 * Example: Save configuration to file
 * 
 * @param {Object} config - Configuration object
 */
function saveConfig(config) {
    const configPath = path.join(globalThis.DATA_ROOT, `${info.id}-config.json`);
    
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        console.log(`[${info.id}] Config saved`);
    } catch (error) {
        console.error(`[${info.id}] Error saving config:`, error);
    }
}

/**
 * Example: Get data directory for this plugin
 * 
 * @returns {string} Path to plugin data directory
 */
function getPluginDataDir() {
    const pluginDataDir = path.join(globalThis.DATA_ROOT, `${info.id}-data`);
    
    if (!fs.existsSync(pluginDataDir)) {
        fs.mkdirSync(pluginDataDir, { recursive: true });
    }
    
    return pluginDataDir;
}

/**
 * Example: Validate request data
 * 
 * @param {Object} data - Data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateData(data) {
    const errors = [];
    
    // TODO: Add validation logic
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ============================================================================
// Notes for Plugin Development
// ============================================================================
// 
// 1. Plugin ID Requirements:
//    - Must be unique across all plugins
//    - Only lowercase letters, numbers, underscores, and hyphens
//    - Should be descriptive and follow naming conventions
//    - Examples: 'user-auth', 'data-validator', 'api-gateway'
//
// 2. Accessing Global Variables:
//    - globalThis.DATA_ROOT: Data storage root directory
//    - globalThis.COMMAND_LINE_ARGS: Command line arguments
//    - process.serverEvents: Server event emitter
//
// 3. Available Middleware:
//    - Express built-in middleware
//    - Custom middleware functions
//    - Error handling middleware
//
// 4. Error Handling:
//    - Always use try-catch in async functions
//    - Return appropriate HTTP status codes
//    - Log errors with descriptive messages
//
// 5. Logging:
//    - Use console.log with plugin prefix: `[${info.id}]`
//    - Log important events and errors
//    - Avoid excessive logging in production
//
// 6. Performance Considerations:
//    - Avoid blocking operations
//    - Use async/await for I/O operations
//    - Consider rate limiting for resource-intensive endpoints
//
// 7. Security:
//    - Validate all user input
//    - Implement proper authentication checks
//    - Use HTTPS in production
//    - Protect sensitive data
//
// 8. Testing:
//    - Create test files in a tests/ directory
//    - Test all endpoints thoroughly
//    - Document test procedures
//
// ============================================================================
