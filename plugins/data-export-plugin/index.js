/**
 * Data Export Plugin for SillyTavernchat
 * 
 * Provides endpoints for exporting application data in various formats
 * (JSON, CSV, etc.)
 */

import fs from 'node:fs';
import path from 'node:path';

export const info = {
    id: 'data-export-plugin',
    name: 'Data Export Plugin',
    description: 'Export application data in various formats (JSON, CSV)'
};

/**
 * Get system statistics
 */
function getSystemStats() {
    return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
    };
}

/**
 * Get directory statistics
 */
function getDirectoryStats(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    function walkDir(dir) {
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                try {
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        walkDir(filePath);
                    } else {
                        totalSize += stat.size;
                        fileCount++;
                    }
                } catch (err) {
                    console.error(`[data-export] Error reading ${filePath}:`, err.message);
                }
            }
        } catch (err) {
            console.error(`[data-export] Error reading directory ${dir}:`, err.message);
        }
    }

    if (fs.existsSync(dirPath)) {
        walkDir(dirPath);
    }

    return {
        path: dirPath,
        totalSize: totalSize,
        fileCount: fileCount,
        sizeInMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
}

/**
 * Convert JSON to CSV
 */
function jsonToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                const stringValue = String(value || '');
                // Escape quotes and wrap in quotes if contains comma
                if (stringValue.includes(',') || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ].join('\n');

    return csv;
}

export async function init(router) {
    console.log('[data-export] Plugin initialized');

    // Export system stats as JSON
    router.get('/export/system-stats/json', (req, res) => {
        try {
            const stats = getSystemStats();
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="system-stats.json"');
            res.json(stats);
        } catch (error) {
            console.error('[data-export] Error exporting system stats:', error);
            res.status(500).json({ error: 'Failed to export system stats' });
        }
    });

    // Export system stats as CSV
    router.get('/export/system-stats/csv', (req, res) => {
        try {
            const stats = getSystemStats();
            const csv = `Field,Value\nTimestamp,"${stats.timestamp}"\nUptime (seconds),${stats.uptime.toFixed(2)}\nPlatform,${stats.platform}\nNode Version,"${stats.nodeVersion}"\nRSS (MB),"${(stats.memory.rss / 1024 / 1024).toFixed(2)}"\nHeap Used (MB),"${(stats.memory.heapUsed / 1024 / 1024).toFixed(2)}"\nHeap Total (MB),"${(stats.memory.heapTotal / 1024 / 1024).toFixed(2)}"`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="system-stats.csv"');
            res.send(csv);
        } catch (error) {
            console.error('[data-export] Error exporting system stats:', error);
            res.status(500).json({ error: 'Failed to export system stats' });
        }
    });

    // Get directory statistics
    router.get('/directory-stats', (req, res) => {
        try {
            const dataRoot = globalThis.DATA_ROOT;
            const stats = getDirectoryStats(dataRoot);

            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            console.error('[data-export] Error getting directory stats:', error);
            res.status(500).json({ error: 'Failed to get directory stats' });
        }
    });

    // Export application info as JSON
    router.get('/export/app-info/json', (req, res) => {
        try {
            const appInfo = {
                exportTime: new Date().toISOString(),
                dataRoot: globalThis.DATA_ROOT,
                systemStats: getSystemStats(),
                directoryStats: getDirectoryStats(globalThis.DATA_ROOT)
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="app-info.json"');
            res.json(appInfo);
        } catch (error) {
            console.error('[data-export] Error exporting app info:', error);
            res.status(500).json({ error: 'Failed to export app info' });
        }
    });

    // Get plugin status endpoint for monitoring
    router.get('/status', (req, res) => {
        res.json({
            pluginId: info.id,
            status: 'active',
            endpointsAvailable: [
                '/export/system-stats/json',
                '/export/system-stats/csv',
                '/export/app-info/json',
                '/directory-stats',
                '/status'
            ]
        });
    });

    console.log('[data-export] All routes registered');
}

export async function exit() {
    console.log('[data-export] Plugin shutting down');
}
