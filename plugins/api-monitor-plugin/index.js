/**
 * API Monitor Plugin for SillyTavernchat
 * 
 * Monitors and analyzes API requests, provides rate limiting statistics,
 * and tracks request patterns.
 */

export const info = {
    id: 'api-monitor-plugin',
    name: 'API Monitor Plugin',
    description: 'Monitor and analyze API requests with detailed statistics'
};

class RequestMonitor {
    constructor() {
        this.requests = [];
        this.requestsPerEndpoint = new Map();
        this.requestsPerMethod = new Map();
        this.maxHistory = 10000; // Keep last 10000 requests
    }

    recordRequest(method, path, statusCode, duration) {
        const request = {
            method,
            path,
            statusCode,
            duration,
            timestamp: Date.now()
        };

        this.requests.push(request);

        // Keep only last N requests
        if (this.requests.length > this.maxHistory) {
            this.requests.shift();
        }

        // Update endpoint statistics
        const endpoint = `${method} ${path}`;
        if (!this.requestsPerEndpoint.has(endpoint)) {
            this.requestsPerEndpoint.set(endpoint, {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                errors: 0,
                success: 0
            });
        }

        const stats = this.requestsPerEndpoint.get(endpoint);
        stats.count++;
        stats.totalDuration += duration;
        stats.minDuration = Math.min(stats.minDuration, duration);
        stats.maxDuration = Math.max(stats.maxDuration, duration);

        if (statusCode >= 400) {
            stats.errors++;
        } else {
            stats.success++;
        }

        // Update method statistics
        if (!this.requestsPerMethod.has(method)) {
            this.requestsPerMethod.set(method, {
                count: 0,
                totalDuration: 0
            });
        }

        const methodStats = this.requestsPerMethod.get(method);
        methodStats.count++;
        methodStats.totalDuration += duration;
    }

    getStatistics(timeWindowMs = 60000) {
        const now = Date.now();
        const cutoff = now - timeWindowMs;

        const recentRequests = this.requests.filter(r => r.timestamp >= cutoff);

        const totalRequests = recentRequests.length;
        const totalDuration = recentRequests.reduce((sum, r) => sum + r.duration, 0);
        const avgDuration = totalRequests > 0 ? totalDuration / totalRequests : 0;

        const statusCodeCounts = {};
        const methodCounts = {};
        const endpointCounts = {};

        for (const request of recentRequests) {
            // Count status codes
            statusCodeCounts[request.statusCode] = (statusCodeCounts[request.statusCode] || 0) + 1;

            // Count methods
            methodCounts[request.method] = (methodCounts[request.method] || 0) + 1;

            // Count endpoints
            const endpoint = `${request.method} ${request.path}`;
            endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
        }

        return {
            timeWindow: `${timeWindowMs}ms`,
            totalRequests,
            avgDuration: avgDuration.toFixed(2),
            requestsPerSecond: (totalRequests / (timeWindowMs / 1000)).toFixed(2),
            statusCodes: statusCodeCounts,
            methods: methodCounts,
            topEndpoints: Object.entries(endpointCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([endpoint, count]) => ({ endpoint, count }))
        };
    }

    getDetailedStats() {
        const endpoints = Array.from(this.requestsPerEndpoint.entries()).map(([endpoint, stats]) => ({
            endpoint,
            ...stats,
            avgDuration: (stats.totalDuration / stats.count).toFixed(2),
            errorRate: ((stats.errors / stats.count) * 100).toFixed(2)
        }));

        endpoints.sort((a, b) => b.count - a.count);

        return {
            totalTrackedRequests: this.requests.length,
            endpoints: endpoints.slice(0, 50),
            summary: {
                totalEndpoints: this.requestsPerEndpoint.size,
                totalMethods: this.requestsPerMethod.size
            }
        };
    }

    getRecentRequests(limit = 100) {
        return this.requests.slice(-limit).reverse();
    }

    clearStatistics() {
        this.requests = [];
        this.requestsPerEndpoint.clear();
        this.requestsPerMethod.clear();
    }
}

const monitor = new RequestMonitor();

export async function init(router) {
    console.log('[api-monitor] Initializing API monitor plugin');

    // Track all requests to this plugin
    router.use((req, res, next) => {
        const startTime = process.hrtime.bigint();

        // Capture the original res.end method
        const originalEnd = res.end;
        res.end = function() {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

            monitor.recordRequest(req.method, req.path, res.statusCode, duration);

            return originalEnd.apply(res, arguments);
        };

        next();
    });

    // Get statistics (last 1 minute)
    router.get('/stats', (req, res) => {
        const timeWindow = parseInt(req.query.window || '60000', 10);
        const stats = monitor.getStatistics(timeWindow);

        res.json({
            success: true,
            data: stats
        });
    });

    // Get detailed statistics
    router.get('/stats/detailed', (req, res) => {
        const stats = monitor.getDetailedStats();

        res.json({
            success: true,
            data: stats
        });
    });

    // Get recent requests
    router.get('/recent-requests', (req, res) => {
        const limit = parseInt(req.query.limit || '100', 10);
        const requests = monitor.getRecentRequests(Math.min(limit, 1000));

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    });

    // Get endpoint performance
    router.get('/endpoint-performance/:method/:path', (req, res) => {
        const endpoint = `${req.params.method} ${req.params.path}`;

        if (!monitor.requestsPerEndpoint.has(endpoint)) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found in monitor data'
            });
        }

        const stats = monitor.requestsPerEndpoint.get(endpoint);

        res.json({
            success: true,
            endpoint,
            ...stats,
            avgDuration: (stats.totalDuration / stats.count).toFixed(2),
            errorRate: ((stats.errors / stats.count) * 100).toFixed(2)
        });
    });

    // Clear statistics
    router.post('/clear', (req, res) => {
        monitor.clearStatistics();

        res.json({
            success: true,
            message: 'Statistics cleared'
        });
    });

    // Health check
    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            trackedRequests: monitor.requests.length,
            trackedEndpoints: monitor.requestsPerEndpoint.size
        });
    });

    console.log('[api-monitor] API monitor plugin initialized successfully');
}

export async function exit() {
    console.log('[api-monitor] API monitor plugin shutting down');
    const stats = monitor.getStatistics();
    console.log(`[api-monitor] Total requests tracked: ${monitor.requests.length}`);
    console.log(`[api-monitor] Total endpoints: ${monitor.requestsPerEndpoint.size}`);
}
