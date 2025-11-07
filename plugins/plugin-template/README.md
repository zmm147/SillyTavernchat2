# Plugin Template

这是一个 SillyTavernchat 插件的模板项目。使用这个模板可以快速开始创建您自己的插件。

## 使用模板

### 1. 复制模板

```bash
cp -r plugins/plugin-template plugins/my-awesome-plugin
cd plugins/my-awesome-plugin
```

### 2. 修改 package.json

更新以下字段：

```json
{
  "name": "my-awesome-plugin",
  "description": "My awesome plugin description",
  "author": "Your Name"
}
```

### 3. 修改 index.js

更新 `info` 对象：

```javascript
export const info = {
    id: 'my-awesome-plugin',
    name: 'My Awesome Plugin',
    description: 'Description of my plugin'
};
```

### 4. 实现您的功能

根据注释中的 TODO 项目，实现您的插件逻辑。

### 5. 测试您的插件

```bash
# 启动服务器
npm start

# 测试插件
curl http://localhost:8000/api/plugins/my-awesome-plugin/health
```

## 模板文件说明

### index.js

主插件文件，包含：

- **info 对象**: 插件元数据（必需）
- **init() 函数**: 插件初始化（必需）
- **exit() 函数**: 插件清理（可选）
- **registerRoutes()**: 路由注册函数
- **Helper 函数**: 辅助函数示例

### package.json

Node.js 项目配置文件。

### README.md

插件文档。

## 模板中的示例功能

模板包含以下示例：

1. **Health Check 端点** - 检查插件状态
2. **Status 端点** - 获取插件信息
3. **GET 端点** - 示例 GET 请求处理
4. **POST 端点** - 示例 POST 请求处理
5. **配置加载/保存** - 文件 I/O 示例
6. **数据验证** - 输入验证示例

## 常用代码片段

### 访问用户信息

```javascript
router.get('/user', (req, res) => {
    if (req.user) {
        res.json({
            handle: req.user.profile.handle,
            directories: req.user.directories
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
```

### 获取插件数据目录

```javascript
function getPluginDataDir() {
    const dir = path.join(globalThis.DATA_ROOT, `${info.id}-data`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}
```

### 创建中间件

```javascript
function authMiddleware(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

router.use(authMiddleware);
```

### 错误处理

```javascript
router.get('/data', async (req, res) => {
    try {
        const data = await fetchData();
        res.json(data);
    } catch (error) {
        console.error('[my-plugin] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

### 使用环境变量

```javascript
const apiKey = process.env.MY_PLUGIN_API_KEY;
const debug = process.env.MY_PLUGIN_DEBUG === 'true';

if (!apiKey) {
    throw new Error('MY_PLUGIN_API_KEY environment variable is required');
}
```

## 开发检查清单

- [ ] 更新插件 ID（只能用小写字母、数字、下划线、连字符）
- [ ] 更新插件名称和描述
- [ ] 实现所需功能
- [ ] 添加适当的错误处理
- [ ] 编写日志记录语句
- [ ] 添加清理代码（如果需要）
- [ ] 测试所有端点
- [ ] 更新 README 文档
- [ ] 测试文件 I/O（如果需要）
- [ ] 测试性能和内存使用

## 部署

### 创建 Git 仓库

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 安装到 SillyTavernchat

```bash
node plugins.js install <your-plugin-git-url>
```

### 更新插件

```bash
node plugins.js update
```

## 获取帮助

- 查看 [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md) 完整文档
- 查看 [QUICKSTART.md](../QUICKSTART.md) 快速开始指南
- 查看其他示例插件
- 在 GitHub Issues 中提问

## 许可证

AGPL-3.0

---

**现在开始创建您的插件吧！** 🚀
