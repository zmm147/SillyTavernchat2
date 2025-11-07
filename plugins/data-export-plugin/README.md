# Data Export Plugin

这个插件提供了将应用程序数据导出为多种格式的功能。

## 功能

- 📊 导出系统统计信息（JSON/CSV 格式）
- 📁 获取目录统计信息
- 📋 导出应用程序完整信息
- 🔍 监控插件状态

## 安装

该插件已包含在 SillyTavernchat 的 `plugins` 目录中。

### 启用插件

在 `config.yaml` 中设置：

```yaml
enableServerPlugins: true
```

然后重启服务器。

## API 端点

### 导出系统统计 - JSON

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/export/system-stats/json > stats.json
```

响应示例：
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 12345.67,
  "memory": {
    "rss": 123456789,
    "heapUsed": 87654321,
    "heapTotal": 123456789
  },
  "platform": "linux",
  "nodeVersion": "v18.19.0"
}
```

### 导出系统统计 - CSV

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/export/system-stats/csv > stats.csv
```

CSV 文件将包含：
```
Field,Value
Timestamp,"2024-01-15T10:30:45.123Z"
Uptime (seconds),12345.67
Platform,linux
Node Version,"v18.19.0"
...
```

### 获取目录统计

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/directory-stats
```

响应示例：
```json
{
  "success": true,
  "stats": {
    "path": "/path/to/data",
    "totalSize": 123456789,
    "fileCount": 456,
    "sizeInMB": "117.74"
  }
}
```

### 导出应用程序信息 - JSON

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/export/app-info/json > app-info.json
```

响应包含：
- 导出时间
- 数据根目录
- 系统统计信息
- 目录统计信息

### 检查插件状态

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/status
```

## 使用场景

### 系统监控

定期导出系统统计信息以进行性能分析：

```bash
#!/bin/bash
while true; do
  curl http://localhost:8000/api/plugins/data-export-plugin/export/system-stats/json > stats_$(date +%s).json
  sleep 3600  # 每小时导出一次
done
```

### 存储容量规划

检查数据目录大小以进行容量规划：

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/directory-stats | jq '.stats.sizeInMB'
```

### 数据备份

完整备份应用程序信息：

```bash
curl http://localhost:8000/api/plugins/data-export-plugin/export/app-info/json > backup_$(date +%Y%m%d).json
```

## 从前端调用

```javascript
// 导出系统统计
fetch('/api/plugins/data-export-plugin/export/system-stats/json')
    .then(response => response.json())
    .then(data => {
        console.log('System Stats:', data);
    });

// 导出为 CSV
fetch('/api/plugins/data-export-plugin/export/system-stats/csv')
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stats.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
```

## 许可证

AGPL-3.0

## 支持

有问题？请在 GitHub Issues 中提问。
