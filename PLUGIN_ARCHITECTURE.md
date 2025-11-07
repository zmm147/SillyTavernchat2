# SillyTavernchat 插件系统架构

本文档详细说明了 SillyTavernchat 插件系统的架构和工作原理。

## 目录

- [系统概述](#系统概述)
- [插件生命周期](#插件生命周期)
- [加载机制](#加载机制)
- [路由隔离](#路由隔离)
- [错误处理](#错误处理)
- [全局接口](#全局接口)
- [性能考虑](#性能考虑)

## 系统概述

```
┌─────────────────────────────────────────────┐
│       SillyTavernchat Server                │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      Express Application                │ │
│  │                                         │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │   Main Router & Middleware       │ │ │
│  │  │   ├── Authentication             │ │ │
│  │  │   ├── CSRF Protection            │ │ │
│  │  │   └── Request Logging            │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │                                         │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │    Plugin System                 │ │ │
│  │  │    ├── plugin-loader.js          │ │ │
│  │  │    ├── Plugin Registry           │ │ │
│  │  │    └── Route Mounting            │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │                                         │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │    Loaded Plugins                │ │ │
│  │  │    ├── /api/plugins/{id}/...     │ │ │
│  │  │    ├── Plugin A Routes           │ │ │
│  │  │    ├── Plugin B Routes           │ │ │
│  │  │    └── Plugin C Routes           │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Data Layer (node-persist)             │ │
│  │  └── ${DATA_ROOT}                      │ │
│  │      ├── plugin-data/                 │ │
│  │      └── plugin-configs/              │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 插件生命周期

### 1. 启动阶段 (Startup)

```
Server Start
    ↓
Check enableServerPlugins config
    ↓
Load plugins directory
    ├── Scan for plugin directories
    ├── Check package.json
    └── Find index.js/index.mjs
        ↓
Auto-update plugins (if enabled)
    ├── Check for .git directories
    ├── Fetch latest changes
    └── Pull if updates available
        ↓
Load each plugin
    ├── Import module
    ├── Validate info object
    ├── Register router
    └── Call init() function
            ↓
Mount routes to Express
    └── /api/plugins/{pluginId}/...
            ↓
Server Ready
```

### 2. 运行阶段 (Runtime)

```
Request arrives
    ↓
Express routing
    ├── Check main routes
    └── Check plugin routes
            ↓
If plugin route:
    ├── Execute plugin handler
    ├── Access to req, res
    └── Return response
            ↓
Response sent to client
```

### 3. 关闭阶段 (Shutdown)

```
Server shutdown signal (SIGTERM, SIGINT)
    ↓
Call all plugin exit() functions
    ├── Close connections
    ├── Cleanup resources
    └── Save state
            ↓
All exit handlers complete
    ↓
Server process terminates
```

## 加载机制

### 文件 Lookup 顺序

```
plugins/
├── my-plugin/
│   ├── package.json           (1. 检查此文件)
│   │   └── "main": "src/index.js"
│   │       ↓
│   │       加载 src/index.js
│   ├── index.js               (2. 如果没有 package.json)
│   ├── index.cjs
│   ├── index.mjs
│   └── 其他文件 (忽略)
│
└── plugin.js                  (3. 根目录的 .js 文件)
```

### 模块导入逻辑

```javascript
// plugin-loader.js 中的伪代码

async function loadFromDirectory(pluginPath) {
    // 1. 检查 package.json
    if (packageJson.exists()) {
        const main = packageJson.main;
        loadModule(main); // 成功则返回
    }
    
    // 2. 检查默认文件名
    for (const filename of ['index.js', 'index.cjs', 'index.mjs']) {
        if (exists(filename)) {
            loadModule(filename); // 成功则返回
        }
    }
}

async function loadModule(filePath) {
    // 1. 导入模块
    const module = await import(fileUrl);
    
    // 2. 验证 info 对象
    const info = module.info || module.default?.info;
    validateInfo(info);
    
    // 3. 获取 init 函数
    const init = module.init || module.default?.init;
    
    // 4. 创建 router 并调用 init
    const router = express.Router();
    await init(router);
    
    // 5. 挂载路由
    app.use(`/api/plugins/${info.id}`, router);
    
    // 6. 保存 exit 函数
    if (module.exit || module.default?.exit) {
        exitHooks.push(exit);
    }
}
```

## 路由隔离

### 命名空间

每个插件的路由都挂载在独立的命名空间下：

```
插件 ID: my-plugin

插件中的路由:
    router.get('/status', ...)
    router.post('/data', ...)
    router.delete('/item/:id', ...)

完整的 API 路径:
    GET    /api/plugins/my-plugin/status
    POST   /api/plugins/my-plugin/data
    DELETE /api/plugins/my-plugin/item/:id
```

### 中间件继承

```
Express Middleware Stack:

┌─────────────────────────────────────┐
│ Global Middleware                   │
│ ├── helmet()                        │
│ ├── compression()                   │
│ ├── bodyParser()                    │
│ ├── cookieSession()                 │
│ ├── csrf protection                 │
│ └── custom middleware               │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Plugin Route Middleware              │
│ /api/plugins/{pluginId}/*           │
│ (可选的插件级中间件)                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Plugin Handler                      │
│ (具体的路由处理器)                   │
└─────────────────────────────────────┘
```

### 请求对象扩展

插件可以访问 Express 扩展的请求对象：

```javascript
router.get('/user', (req, res) => {
    // req 对象包含的内容：
    console.log(req.method);           // HTTP 方法
    console.log(req.path);             // 请求路径
    console.log(req.query);            // 查询参数
    console.log(req.body);             // 请求体
    console.log(req.headers);          // 请求头
    console.log(req.params);           // URL 参数
    
    // 由 SillyTavernchat 添加的扩展：
    console.log(req.user);             // 当前用户信息
    console.log(req.session);          // 会话数据
    
    // res 对象的标准方法：
    res.json(data);                    // 发送 JSON
    res.send(data);                    // 发送数据
    res.status(200).json(data);        // 设置状态码
    res.setHeader('key', 'value');     // 设置响应头
});
```

## 错误处理

### 验证流程

```javascript
// 1. info 对象验证
const validation = {
    id: {
        required: true,
        type: 'string',
        pattern: /^[a-z0-9_-]+$/,
        example: 'my-plugin'
    },
    name: {
        required: true,
        type: 'string',
        example: 'My Plugin'
    },
    description: {
        required: true,
        type: 'string',
        example: 'Description'
    }
};

// 2. init 函数验证
if (typeof init !== 'function') {
    throw Error('init is not a function');
}

// 3. ID 唯一性检查
if (loadedPlugins.has(pluginId)) {
    throw Error(`Plugin ID '${pluginId}' is already in use`);
}
```

### 错误处理策略

```javascript
try {
    // 加载插件
    await loadFromFile(pluginPath);
} catch (error) {
    // 1. 记录错误
    console.error('Plugin loading failed:', error);
    
    // 2. 继续加载其他插件
    continue;
    
    // 3. 不中断服务器启动
}
```

## 全局接口

### 访问全局变量

```javascript
export async function init(router) {
    // 数据根目录
    const dataRoot = globalThis.DATA_ROOT;
    // => '/home/user/.config/SillyTavern' 或其他
    
    // 命令行参数
    const args = globalThis.COMMAND_LINE_ARGS;
    // => { global: false, listen: true, port: 8000, ... }
    
    // 强制全局模式标志
    const forceGlobal = globalThis.FORCE_GLOBAL_MODE;
    // => true 或 false
}
```

### 服务器事件

```javascript
export async function init(router) {
    // 监听服务器启动事件
    process.serverEvents.on('server-started', (event) => {
        console.log('Server started at:', event.url);
    });
    
    // 发出自定义事件（如需要）
    process.serverEvents.emit('custom-event', { data: 'value' });
}
```

### 类型定义 (TypeScript)

```typescript
// 来自 index.d.ts

namespace NodeJS {
    interface Process {
        serverEvents: EventEmitter<ServerEventMap>;
    }
}

interface ServerEventMap {
    [EVENT_NAMES.SERVER_STARTED]: [ServerStartedEvent];
}

interface ServerStartedEvent {
    url: URL;
}
```

## 性能考虑

### 内存管理

```
加载时的内存占用:

模块导入        ~ 1-5 MB (取决于依赖)
路由注册        ~ 0.1-1 MB
插件状态        ~ 可变 (取决于实现)

监控建议:
- 使用 process.memoryUsage()
- 定期检查内存泄漏
- 实现适当的清理
```

### 启动时间影响

```
启动时间分解:

系统启动           ~ 100ms
加载 N 个插件      ~ N * 50-200ms
自动更新插件       ~ 取决于网络和插件大小
总计              ~ 100ms + (N * 50-200ms) + 更新时间

优化建议:
- 禁用生产环境中不需要的插件
- 设置 enableServerPluginsAutoUpdate: false
- 使用 npm 的依赖缓存
```

### 请求性能

```
请求处理:

Route matching     ~ <1ms
Middleware chain   ~ 1-5ms
Plugin handler     ~ 取决于实现
Total             ~ 1-6ms + 插件处理时间

监控建议:
- 使用 api-monitor-plugin 跟踪性能
- 设置性能告警阈值
- 定期分析慢查询
```

## 安全考虑

### 插件隔离

```
插件 A                    插件 B
  ├── 自己的路由           ├── 自己的路由
  ├── 自己的数据           ├── 自己的数据
  └── 不能直接访问 B       └── 不能直接访问 A
```

**注意**: 插件可以访问全局数据和其他插件可公开访问的数据。

### 访问控制

```javascript
// 插件可以实现自己的访问控制
router.get('/protected', (req, res) => {
    // 检查用户
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 检查权限
    if (!req.user.profile.admin) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({ data: 'sensitive' });
});
```

### 输入验证

```javascript
router.post('/data', (req, res) => {
    // 验证输入
    if (!req.body || typeof req.body.name !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }
    
    // 处理数据
    const name = req.body.name.trim();
    // ...
});
```

## 扩展性

### 支持的功能

✓ 支持:
- 任意数量的 API 端点
- 中间件
- 错误处理
- 数据持久化
- 异步操作
- npm 依赖

✗ 不支持:
- 修改核心服务器行为
- 访问其他插件的私有数据
- 动态注册新的全局中间件

## 示例: 完整的插件加载流程

```
1. 服务器启动
   └─ server-main.js 执行
   
2. 加载插件系统
   └─ loadPlugins(app, './plugins')
   
3. 检查配置
   └─ enableServerPlugins = true ?
   
4. 扫描目录
   └─ 列出 ./plugins 中的所有目录和文件
   
5. 自动更新（可选）
   └─ 对每个 Git 仓库执行 git pull
   
6. 加载每个插件
   ├─ 导入模块
   ├─ 验证 info 对象
   │  ├─ 检查 id 格式
   │  ├─ 检查 name 存在
   │  └─ 检查 description 存在
   ├─ 验证 init 函数
   ├─ 创建 Express Router
   ├─ 调用 init(router)
   │  └─ 插件注册所有路由
   ├─ 挂载到主应用
   │  └─ app.use('/api/plugins/{id}', router)
   └─ 保存 exit 函数（如有）
   
7. 服务器就绪
   └─ 所有插件已加载，准备接收请求
   
8. 运行时
   └─ 请求来临时调用插件路由
   
9. 服务器关闭
   └─ 调用所有插件的 exit() 函数进行清理
```

---

**需要更多信息？** 查看 [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md) 或 [src/plugin-loader.js](./src/plugin-loader.js)。
