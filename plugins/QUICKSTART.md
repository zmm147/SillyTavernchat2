# 插件开发快速开始

欢迎！本指南将帮助您快速开始开发 SillyTavernchat 插件。

## 5 分钟快速开始

### 步骤 1: 准备环境

确保您已安装：
- Node.js 18+
- npm
- 您喜欢的代码编辑器

### 步骤 2: 创建插件目录

```bash
mkdir plugins/my-first-plugin
cd plugins/my-first-plugin
npm init -y
```

### 步骤 3: 创建主文件

创建 `index.js`：

```javascript
export const info = {
    id: 'my-first-plugin',
    name: 'My First Plugin',
    description: 'My awesome first plugin'
};

export async function init(router) {
    console.log('My plugin is running!');
    
    router.get('/hello', (req, res) => {
        res.json({ message: 'Hello from my plugin!' });
    });
}
```

### 步骤 4: 启用插件

在项目根目录的 `config.yaml` 中添加：

```yaml
enableServerPlugins: true
```

### 步骤 5: 启动服务器

```bash
npm start
```

### 步骤 6: 测试您的插件

```bash
curl http://localhost:8000/api/plugins/my-first-plugin/hello
```

成功！您已经创建了第一个插件！🎉

## 下一步

### 查看示例插件

我们提供了三个完整的示例插件：

1. **example-plugin** - 基础示例（推荐开始学习）
2. **data-export-plugin** - 导出应用数据
3. **api-monitor-plugin** - 监控 API 请求

### 阅读完整文档

详见 [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md)

## 常用命令

```bash
# 查看插件列表
ls plugins/

# 创建新插件
mkdir plugins/my-plugin

# 启动服务器
npm start

# 调试插件
npm run debug

# 更新所有插件
node plugins.js update

# 安装新插件
node plugins.js install <git-url>
```

## 插件路由

您的插件定义的路由会自动挂载在 `/api/plugins/{pluginId}` 下。

例如：
- 插件 ID: `my-plugin`
- 路由: `/hello`
- 完整 URL: `/api/plugins/my-plugin/hello`

## 完整的最小示例

```javascript
// 插件必须导出 info 对象和 init 函数

export const info = {
    id: 'my-plugin',           // 必需：唯一标识符（只能用小写字母、数字、下划线、连字符）
    name: 'My Plugin',         // 必需：显示名称
    description: 'My plugin'   // 必需：描述
};

export async function init(router) {
    // 在这里定义您的路由
    
    router.get('/status', (req, res) => {
        res.json({ status: 'ok' });
    });
    
    router.post('/data', (req, res) => {
        // 处理 POST 请求
        res.json(req.body);
    });
}

// 可选：清理函数
export async function exit() {
    console.log('Plugin shutting down');
}
```

## 调试技巧

### 1. 使用 console.log

```javascript
export async function init(router) {
    console.log('[my-plugin] Initializing');
    
    router.get('/test', (req, res) => {
        console.log('[my-plugin] Test endpoint called');
        res.json({});
    });
}
```

### 2. 在浏览器中检查

```javascript
// 从浏览器中调用插件
fetch('/api/plugins/my-plugin/status')
    .then(r => r.json())
    .then(data => console.log(data));
```

### 3. 使用 Node 调试器

```bash
npm run debug
# 在 chrome://inspect 中打开调试器
```

## 常见问题

### Q: 我的插件没有加载怎么办？

A: 检查以下几点：
1. 在 `config.yaml` 中启用了插件
2. 插件在 `plugins` 目录中
3. 检查服务器日志中的错误信息
4. 检查 `info` 对象和 `init` 函数是否正确导出

### Q: 如何访问当前用户信息？

A: 使用 Express 中间件提供的 `req.user`：

```javascript
router.get('/user', (req, res) => {
    if (req.user) {
        res.json(req.user.profile);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
```

### Q: 如何保存数据？

A: 使用 Node.js 文件系统 API：

```javascript
import fs from 'node:fs';
import path from 'node:path';

export async function init(router) {
    router.post('/save', (req, res) => {
        const filePath = path.join(globalThis.DATA_ROOT, 'my-plugin-data.json');
        fs.writeFileSync(filePath, JSON.stringify(req.body));
        res.json({ success: true });
    });
}
```

### Q: 如何使用 npm 包？

A: 在您的插件目录中运行 `npm install`：

```bash
cd plugins/my-plugin
npm install express-validator
```

然后在代码中导入：

```javascript
import { body, validationResult } from 'express-validator';
```

## 最佳实践

1. **使用有意义的 ID**
   - ✓ `stats-tracker`, `auth-helper`, `data-exporter`
   - ✗ `plugin1`, `test`, `foo`

2. **添加错误处理**
   ```javascript
   router.get('/data', (req, res) => {
       try {
           const data = fetchData();
           res.json(data);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   });
   ```

3. **记录重要信息**
   ```javascript
   console.log('[my-plugin] Important event occurred');
   ```

4. **实现 exit 函数进行清理**
   ```javascript
   export async function exit() {
       // 关闭数据库连接、清理文件等
   }
   ```

## 下一级教程

### 创建数据库插件

```javascript
import Database from 'better-sqlite3';
import path from 'node:path';

const db = new Database(path.join(globalThis.DATA_ROOT, 'my-plugin.db'));

export async function init(router) {
    db.exec('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)');
    
    router.get('/items', (req, res) => {
        const items = db.prepare('SELECT * FROM items').all();
        res.json(items);
    });
}

export async function exit() {
    db.close();
}
```

### 创建中间件插件

```javascript
export async function init(router) {
    const authMiddleware = (req, res, next) => {
        const token = req.headers['x-auth-token'];
        if (!token) {
            return res.status(401).json({ error: 'Missing token' });
        }
        next();
    };
    
    router.use(authMiddleware);
    
    router.get('/protected', (req, res) => {
        res.json({ data: 'This is protected' });
    });
}
```

## 获得帮助

1. 查看现有示例插件的源代码
2. 阅读 [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md)
3. 在 GitHub Issues 中提问
4. 查看服务器日志中的错误信息

---

**准备好了吗？让我们创建一些出色的插件！** 🚀
