# Example Plugin for SillyTavernchat

这是一个简单的示例插件，展示了如何为 SillyTavernchat 开发服务器插件。

## 功能

- 🏥 **健康检查** - 检查插件状态
- 📊 **统计信息** - 跟踪消息数量和运行时间
- 🔄 **回显服务** - 接收并回显消息
- ℹ️ **服务器信息** - 获取服务器配置信息

## 安装

该插件已经包含在 SillyTavernchat 的 `plugins` 目录中。

### 启用插件

在 `config.yaml` 中设置：

```yaml
enableServerPlugins: true
```

然后重启服务器。

## 使用

### 检查插件状态

```bash
curl http://localhost:8000/api/plugins/example-plugin/health
```

响应示例：
```json
{
  "status": "healthy",
  "uptime": 12345,
  "messageCount": 5
}
```

### 获取插件信息

```bash
curl http://localhost:8000/api/plugins/example-plugin/info
```

### 发送消息（回显）

```bash
curl -X POST http://localhost:8000/api/plugins/example-plugin/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'
```

响应示例：
```json
{
  "received": "Hello, World!",
  "echo": "!dlroW ,olleH",
  "messageNumber": 1,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### 获取统计信息

```bash
curl http://localhost:8000/api/plugins/example-plugin/stats
```

响应示例：
```json
{
  "totalMessages": 5,
  "lastMessage": "Hello, World!",
  "uptime": {
    "milliseconds": 123456,
    "seconds": 123,
    "minutes": 2,
    "hours": 0
  },
  "startTime": "2024-01-15T10:28:45.123Z",
  "messagesPerSecond": "0.04"
}
```

### 重置统计

```bash
curl -X POST http://localhost:8000/api/plugins/example-plugin/stats/reset
```

### 获取服务器信息

```bash
curl http://localhost:8000/api/plugins/example-plugin/server-info
```

## API 端点

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/health` | 检查插件健康状态 |
| GET | `/info` | 获取插件信息 |
| POST | `/echo` | 回显发送的消息 |
| GET | `/stats` | 获取统计数据 |
| POST | `/stats/reset` | 重置统计数据 |
| GET | `/server-info` | 获取服务器信息 |

## 代码结构

```javascript
// 插件信息（必需）
export const info = {
    id: 'example-plugin',
    name: 'Example Plugin',
    description: 'A simple example plugin'
};

// 初始化函数（必需）
export async function init(router) {
    // 注册路由
    router.get('/health', ...);
}

// 清理函数（可选）
export async function exit() {
    // 清理资源
}
```

## 学习资源

- 详见 [PLUGIN_DEVELOPMENT.md](../../PLUGIN_DEVELOPMENT.md) 获取完整的插件开发指南
- 查看其他示例插件以了解更多高级功能

## 许可证

AGPL-3.0

## 支持

如有问题，请在 GitHub Issues 中提问。
