# API Monitor Plugin

这个插件提供了详细的 API 请求监控和分析功能。

## 功能

- 📊 实时 API 请求统计
- 📈 端点性能分析
- 📋 请求历史记录
- 🔍 详细的性能指标
- 🚀 按时间窗口分析

## 安装

该插件已包含在 SillyTavernchat 的 `plugins` 目录中。

### 启用插件

在 `config.yaml` 中设置：

```yaml
enableServerPlugins: true
```

然后重启服务器。

## API 端点

### 获取统计信息

```bash
curl "http://localhost:8000/api/plugins/api-monitor-plugin/stats?window=60000"
```

参数：
- `window` (可选): 时间窗口，单位毫秒，默认 60000 (1分钟)

响应示例：
```json
{
  "success": true,
  "data": {
    "timeWindow": "60000ms",
    "totalRequests": 245,
    "avgDuration": "12.34",
    "requestsPerSecond": "4.08",
    "statusCodes": {
      "200": 230,
      "404": 10,
      "500": 5
    },
    "methods": {
      "GET": 180,
      "POST": 50,
      "PUT": 10,
      "DELETE": 5
    },
    "topEndpoints": [
      {
        "endpoint": "GET /api/characters",
        "count": 45
      },
      {
        "endpoint": "POST /api/chats",
        "count": 32
      }
    ]
  }
}
```

### 获取详细统计

```bash
curl http://localhost:8000/api/plugins/api-monitor-plugin/stats/detailed
```

响应包含：
- 所有被跟踪的端点
- 每个端点的请求计数
- 平均响应时间
- 错误率

### 获取最近的请求

```bash
curl "http://localhost:8000/api/plugins/api-monitor-plugin/recent-requests?limit=50"
```

参数：
- `limit` (可选): 返回的请求数，默认 100，最大 1000

响应示例：
```json
{
  "success": true,
  "count": 50,
  "requests": [
    {
      "method": "GET",
      "path": "/api/characters",
      "statusCode": 200,
      "duration": 12.45,
      "timestamp": 1705318245123
    }
  ]
}
```

### 获取端点性能

```bash
curl "http://localhost:8000/api/plugins/api-monitor-plugin/endpoint-performance/GET/%2Fapi%2Fcharacters"
```

响应示例：
```json
{
  "success": true,
  "endpoint": "GET /api/characters",
  "count": 45,
  "totalDuration": 560.25,
  "minDuration": 5.12,
  "maxDuration": 45.67,
  "errors": 2,
  "success": 43,
  "avgDuration": "12.45",
  "errorRate": "4.44"
}
```

### 清除统计数据

```bash
curl -X POST http://localhost:8000/api/plugins/api-monitor-plugin/clear
```

### 检查健康状态

```bash
curl http://localhost:8000/api/plugins/api-monitor-plugin/health
```

## 使用案例

### 实时性能监控

```javascript
// 定期获取最近 1 分钟的统计
setInterval(() => {
    fetch('/api/plugins/api-monitor-plugin/stats?window=60000')
        .then(r => r.json())
        .then(data => {
            console.log('Requests/sec:', data.data.requestsPerSecond);
            console.log('Avg Duration:', data.data.avgDuration);
        });
}, 5000); // 每 5 秒检查一次
```

### 找出性能瓶颈

```bash
# 获取所有端点的性能数据，按请求数排序
curl http://localhost:8000/api/plugins/api-monitor-plugin/stats/detailed \
    | jq '.data.endpoints | sort_by(-.totalDuration) | .[0:5]'
```

### 监控错误率

```javascript
fetch('/api/plugins/api-monitor-plugin/stats?window=300000')
    .then(r => r.json())
    .then(data => {
        const statusCodes = data.data.statusCodes;
        const errorCount = Object.entries(statusCodes)
            .filter(([code]) => code >= 400)
            .reduce((sum, [, count]) => sum + count, 0);
        
        const errorRate = (errorCount / data.data.totalRequests * 100).toFixed(2);
        console.log(`Error rate: ${errorRate}%`);
        
        if (errorRate > 5) {
            console.warn('High error rate detected!');
        }
    });
```

### 生成性能报告

```bash
#!/bin/bash

echo "=== API 性能报告 ==="
echo "时间: $(date)"
echo ""

echo "最近 1 分钟的统计:"
curl -s "http://localhost:8000/api/plugins/api-monitor-plugin/stats?window=60000" \
    | jq '.data | {totalRequests, avgDuration, requestsPerSecond}'

echo ""
echo "最近 5 分钟的统计:"
curl -s "http://localhost:8000/api/plugins/api-monitor-plugin/stats?window=300000" \
    | jq '.data | {totalRequests, avgDuration, requestsPerSecond}'

echo ""
echo "最慢的 5 个端点:"
curl -s "http://localhost:8000/api/plugins/api-monitor-plugin/stats/detailed" \
    | jq '.data.endpoints | sort_by(-.totalDuration) | .[0:5] | .[] | {endpoint, avgDuration, count}'
```

## 监控指标解释

### avgDuration
平均响应时间，单位毫秒。

### requestsPerSecond
平均每秒的请求数。

### statusCodes
HTTP 状态码分布：
- 2xx: 成功请求
- 3xx: 重定向
- 4xx: 客户端错误
- 5xx: 服务器错误

### errorRate
返回 4xx 或 5xx 状态码的请求百分比。

## 注意事项

- 该插件会记录最近 10000 个请求（内存中）
- 重启服务器会清除所有统计数据
- 在高流量环境中，监控本身会消耗一些性能

## 许可证

AGPL-3.0

## 支持

有问题？请在 GitHub Issues 中提问。
