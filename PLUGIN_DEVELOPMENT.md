# SillyTavernchat 插件开发指南

欢迎使用 SillyTavernchat 插件系统！本指南将帮助您开发自己的服务器插件。

## 目录

- [快速开始](#快速开始)
- [插件基础](#插件基础)
- [插件结构](#插件结构)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)
- [示例插件](#示例插件)
- [常见问题](#常见问题)

## 快速开始

### 1. 创建插件目录

```bash
# 在 plugins 目录下创建新插件
mkdir plugins/my-awesome-plugin
cd plugins/my-awesome-plugin

# 初始化 npm 项目
npm init -y
```

### 2. 创建插件入口文件

创建 `index.js` 文件：

```javascript
export const info = {
    id: 'my-awesome-plugin',
    name: 'My Awesome Plugin',
    description: 'This is a simple example plugin'
};

export async function init(router) {
    console.log('My Awesome Plugin initialized!');
    
    // 在这里添加您的 API 路由
    router.get('/status', (req, res) => {
        res.json({ status: 'ok' });
    });
}

export async function exit() {
    console.log('My Awesome Plugin is shutting down');
}
```

### 3. 启动服务器

在 config.yaml 中启用插件：

```yaml
enableServerPlugins: true
enableServerPluginsAutoUpdate: false
```

然后启动服务器：

```bash
npm start
```

插件将自动加载！

## 插件基础

### 插件架构

SillyTavernchat 的插件系统基于以下原则：

- **模块化**：每个插件是独立的模块
- **异步**：支持异步初始化和清理
- **隔离**：每个插件有自己的路由命名空间
- **可靠**：插件错误不会影响主服务器

### 插件生命周期

1. **加载（Loading）**：插件被导入到内存
2. **初始化（Initialization）**：`init()` 函数被调用，插件注册路由
3. **运行（Running）**：插件处理请求
4. **清理（Exit）**：服务器关闭时调用 `exit()` 函数

## 插件结构

### 最小插件结构

```
my-plugin/
├── package.json
├── index.js
└── README.md
```

### 完整插件结构

```
my-plugin/
├── package.json           # NPM 配置
├── index.js               # 主入口文件
├── README.md              # 插件文档
├── src/
│   ├── routes/           # API 路由
│   │   ├── api.js
│   │   └── health.js
│   └── utils/            # 工具函数
│       └── helpers.js
└── tests/                 # 测试文件
    └── example.test.js
```

### package.json 示例

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "A simple SillyTavernchat plugin",
  "main": "index.js",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

## API 参考

### 插件导出

#### info 对象

插件必须导出 `info` 对象，包含以下字段：

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `id` | string | ✓ | 插件唯一标识符（只能包含小写字母、数字、下划线、连字符） |
| `name` | string | ✓ | 插件显示名称 |
| `description` | string | ✓ | 插件描述 |

示例：

```javascript
export const info = {
    id: 'my-plugin',
    name: 'My Plugin',
    description: 'A cool plugin for SillyTavernchat'
};
```

#### init() 函数

异步函数，在插件初始化时调用。

**参数：**
- `router` (Express.Router): Express 路由实例

**返回值：** Promise

插件应该在这个函数中注册所有的 API 路由。

示例：

```javascript
export async function init(router) {
    // 获取插件ID
    console.log('Initializing plugin...');
    
    // 添加路由
    router.get('/data', (req, res) => {
        res.json({ message: 'Hello from plugin!' });
    });
    
    router.post('/save', (req, res) => {
        // 处理 POST 请求
        res.json({ success: true });
    });
}
```

#### exit() 函数（可选）

异步函数，在服务器关闭时调用。用于清理资源。

**返回值：** Promise

示例：

```javascript
export async function exit() {
    console.log('Cleaning up resources...');
    // 关闭数据库连接、清理临时文件等
}
```

### Express Router

插件收到一个标准的 Express Router 实例。您可以使用所有标准的 Express 方法：

```javascript
export async function init(router) {
    // GET 请求
    router.get('/items', (req, res) => {
        res.json([]);
    });
    
    // POST 请求
    router.post('/items', (req, res) => {
        res.status(201).json({ id: 1 });
    });
    
    // PUT 请求
    router.put('/items/:id', (req, res) => {
        res.json({ id: req.params.id });
    });
    
    // DELETE 请求
    router.delete('/items/:id', (req, res) => {
        res.status(204).send();
    });
    
    // 中间件
    router.use((req, res, next) => {
        console.log('Request to plugin');
        next();
    });
}
```

### 访问全局变量

您可以访问 SillyTavernchat 提供的全局变量：

- `globalThis.DATA_ROOT`: 数据存储根目录
- `globalThis.COMMAND_LINE_ARGS`: 命令行参数
- `process.serverEvents`: 服务器事件发射器

示例：

```javascript
export async function init(router) {
    const dataRoot = globalThis.DATA_ROOT;
    console.log(`Data directory: ${dataRoot}`);
    
    // 监听服务器事件
    process.serverEvents.on('server-started', (event) => {
        console.log(`Server started at: ${event.url}`);
    });
}
```

## 最佳实践

### 1. 插件 ID 命名规范

- 只使用小写字母、数字、下划线和连字符
- 使用前缀来避免冲突（例如 `my-org-plugin`）
- 使用有意义的名称

```javascript
// ✓ 好的
id: 'my-org-stats-collector'
id: 'api-gateway-extension'

// ✗ 坏的
id: 'MyPlugin'          // 包含大写字母
id: 'my plugin'         // 包含空格
id: 'plugin!'           // 包含特殊字符
```

### 2. 错误处理

使用 try-catch 处理可能的错误：

```javascript
export async function init(router) {
    try {
        // 初始化代码
    } catch (error) {
        console.error('Plugin initialization failed:', error);
        throw error; // 让系统知道初始化失败
    }
}
```

### 3. 日志记录

使用 console 进行日志记录（建议添加前缀）：

```javascript
const PLUGIN_NAME = 'my-plugin';

export async function init(router) {
    console.log(`[${PLUGIN_NAME}] Initializing...`);
    console.log(`[${PLUGIN_NAME}] Configuration loaded`);
}

export async function exit() {
    console.log(`[${PLUGIN_NAME}] Shutting down`);
}
```

### 4. 环境变量

使用环境变量来配置插件：

```javascript
export async function init(router) {
    const apiKey = process.env.MY_PLUGIN_API_KEY;
    const debug = process.env.MY_PLUGIN_DEBUG === 'true';
    
    if (!apiKey) {
        throw new Error('MY_PLUGIN_API_KEY environment variable is required');
    }
    
    if (debug) {
        console.log('[my-plugin] Debug mode enabled');
    }
}
```

### 5. 配置文件

创建一个 config.json 文件来存储插件配置：

```javascript
import fs from 'node:fs';
import path from 'node:path';

const configPath = path.join(globalThis.DATA_ROOT, 'my-plugin-config.json');

function loadConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export async function init(router) {
    const config = loadConfig();
    
    router.get('/config', (req, res) => {
        res.json(config);
    });
    
    router.post('/config', (req, res) => {
        Object.assign(config, req.body);
        saveConfig(config);
        res.json({ success: true });
    });
}
```

### 6. 数据持久化

使用 Node.js 文件系统 API 进行数据持久化：

```javascript
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(globalThis.DATA_ROOT, 'my-plugin-data');

function ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

export async function init(router) {
    ensureDataDir();
    
    router.post('/save-data', (req, res) => {
        const filePath = path.join(dataDir, 'data.json');
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    });
    
    router.get('/get-data', (req, res) => {
        const filePath = path.join(dataDir, 'data.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            res.json(data);
        } else {
            res.json({});
        }
    });
}
```

### 7. 中间件和验证

```javascript
export async function init(router) {
    // 认证中间件
    const authenticatePlugin = (req, res, next) => {
        const token = req.headers['x-plugin-token'];
        if (!token || token !== process.env.PLUGIN_AUTH_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };
    
    // 验证请求体
    const validateRequest = (req, res, next) => {
        if (!req.body || !req.body.data) {
            return res.status(400).json({ error: 'Missing data field' });
        }
        next();
    };
    
    // 应用中间件到特定路由
    router.post('/protected', authenticatePlugin, validateRequest, (req, res) => {
        res.json({ received: req.body.data });
    });
}
```

## 示例插件

### 示例 1：简单的统计插件

```javascript
// plugins/stats-plugin/index.js
export const info = {
    id: 'stats-plugin',
    name: 'Statistics Plugin',
    description: 'Tracks API request statistics'
};

const stats = {
    requests: 0,
    startTime: Date.now()
};

export async function init(router) {
    // 中间件：计数请求
    router.use((req, res, next) => {
        stats.requests++;
        next();
    });
    
    // 获取统计信息
    router.get('/stats', (req, res) => {
        const uptime = Date.now() - stats.startTime;
        res.json({
            requests: stats.requests,
            uptime: uptime,
            avgRequestsPerSecond: (stats.requests / (uptime / 1000)).toFixed(2)
        });
    });
    
    // 重置统计
    router.post('/reset', (req, res) => {
        stats.requests = 0;
        stats.startTime = Date.now();
        res.json({ success: true });
    });
}

export async function exit() {
    console.log(`[stats-plugin] Total requests processed: ${stats.requests}`);
}
```

### 示例 2：数据导出插件

```javascript
// plugins/data-export/index.js
import fs from 'node:fs';
import path from 'node:path';

export const info = {
    id: 'data-export',
    name: 'Data Export Plugin',
    description: 'Export application data in various formats'
};

export async function init(router) {
    // 导出为 JSON
    router.get('/export/json', (req, res) => {
        const data = {
            timestamp: new Date().toISOString(),
            dataRoot: globalThis.DATA_ROOT,
            nodeVersion: process.version
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="export.json"');
        res.json(data);
    });
    
    // 导出为 CSV
    router.get('/export/csv', (req, res) => {
        const csv = 'Field,Value\n' +
                   `Timestamp,"${new Date().toISOString()}"\n` +
                   `Node Version,"${process.version}"\n`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
        res.send(csv);
    });
}
```

### 示例 3：队列处理插件

```javascript
// plugins/queue-processor/index.js
export const info = {
    id: 'queue-processor',
    name: 'Queue Processor',
    description: 'Process async tasks in a queue'
};

class TaskQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    async add(task) {
        this.queue.push({
            id: Math.random().toString(36),
            task,
            status: 'pending',
            createdAt: new Date()
        });
        this.process();
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            item.status = 'running';
            
            try {
                await item.task();
                item.status = 'completed';
            } catch (error) {
                item.status = 'failed';
                item.error = error.message;
            }
        }
        
        this.processing = false;
    }
    
    getStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            items: this.queue
        };
    }
}

const queue = new TaskQueue();

export async function init(router) {
    // 添加任务到队列
    router.post('/queue/add', (req, res) => {
        const { delay = 1000 } = req.body;
        
        queue.add(async () => {
            return new Promise(resolve => {
                setTimeout(resolve, delay);
            });
        });
        
        res.json({ message: 'Task added to queue' });
    });
    
    // 获取队列状态
    router.get('/queue/status', (req, res) => {
        res.json(queue.getStatus());
    });
}
```

## 常见问题

### Q: 如何调试我的插件？

A: 使用 `npm run debug` 启动服务器，然后在浏览器中打开 `chrome://inspect`。

```bash
npm run debug
```

### Q: 插件可以访问用户数据吗？

A: 可以。通过 Express 的 `req.user` 对象访问当前用户信息：

```javascript
export async function init(router) {
    router.get('/user-info', (req, res) => {
        if (req.user) {
            res.json({
                handle: req.user.profile.handle,
                directories: req.user.directories
            });
        } else {
            res.status(401).json({ error: 'Not authenticated' });
        }
    });
}
```

### Q: 如何在插件之间共享代码？

A: 创建一个共享库包，然后在其他插件中作为依赖引入。或者使用 npm 私有包。

### Q: 插件会影响主服务器的性能吗？

A: 是的，可能会。确保您的插件代码高效，避免长时间阻塞操作。使用异步代码。

### Q: 如何让插件在特定的 URL 路径上工作？

A: 您的插件路由自动挂载在 `/api/plugins/{pluginId}` 下。

例如，插件 ID 为 `my-plugin` 的插件中定义的 `/data` 路由会被挂载在 `/api/plugins/my-plugin/data`。

### Q: 我可以在插件中使用 npm 包吗？

A: 可以。在您的插件目录中运行 `npm install your-package`。

## 部署和分发

### 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库
2. 推送您的插件代码
3. 添加 README.md 和许可证

### 安装插件

用户可以使用以下命令安装您的插件：

```bash
node plugins.js install https://github.com/yourusername/your-plugin.git
```

### 更新插件

```bash
node plugins.js update
```

## 进阶主题

### 使用 TypeScript

如果您想使用 TypeScript，您可以使用 `.mjs` 文件并使用 TypeScript 编译器：

```bash
# 安装 TypeScript
npm install -D typescript ts-node

# 创建 tsconfig.json
npx tsc --init --target esnext --module esnext
```

### 与前端集成

虽然插件系统主要用于后端，但您可以通过 API 从前端与插件进行交互。

### 数据库集成

您可以在插件中集成数据库（如 SQLite、MongoDB 等）：

```javascript
import Database from 'better-sqlite3';

const db = new Database(path.join(globalThis.DATA_ROOT, 'plugin.db'));

export async function init(router) {
    router.get('/items', (req, res) => {
        const items = db.prepare('SELECT * FROM items').all();
        res.json(items);
    });
}

export async function exit() {
    db.close();
}
```

## 获取帮助

- 查看示例插件源代码
- 阅读 SillyTavernchat 主项目文档
- 在 GitHub Issues 中提问

---

**祝您开发愉快！** 🚀

