# SillyTavernchat 插件系统

欢迎来到 SillyTavernchat 的插件系统！这个目录包含了官方示例插件和开发资源。

## 📚 快速导航

- 🚀 **[快速开始指南](./QUICKSTART.md)** - 5分钟快速上手
- 📖 **[完整开发文档](../PLUGIN_DEVELOPMENT.md)** - 详细的 API 参考和最佳实践
- 🎯 **[示例插件](#示例插件)** - 学习现有的实现

## 📦 包含的插件

### 1. example-plugin - 基础示例

最简单的示例插件，展示了核心功能：
- 健康检查端点
- 统计跟踪
- 回显服务
- 服务器信息查询

**位置**: `plugins/example-plugin/`

**快速开始**:
```bash
# 启用插件
npm start

# 测试
curl http://localhost:8000/api/plugins/example-plugin/health
```

### 2. data-export-plugin - 数据导出

展示如何导出应用数据：
- 系统统计导出（JSON/CSV）
- 目录统计信息
- 应用完整信息导出

**位置**: `plugins/data-export-plugin/`

**快速开始**:
```bash
# 导出系统统计
curl http://localhost:8000/api/plugins/data-export-plugin/export/system-stats/json > stats.json

# 导出为 CSV
curl http://localhost:8000/api/plugins/data-export-plugin/export/system-stats/csv > stats.csv
```

### 3. api-monitor-plugin - API 监控

监控和分析 API 请求：
- 实时请求统计
- 端点性能分析
- 错误率监控
- 请求历史

**位置**: `plugins/api-monitor-plugin/`

**快速开始**:
```bash
# 获取统计
curl "http://localhost:8000/api/plugins/api-monitor-plugin/stats?window=60000"

# 详细统计
curl http://localhost:8000/api/plugins/api-monitor-plugin/stats/detailed
```

### 4. plugin-template - 开发模板

用于创建新插件的模板：
- 完整的项目结构
- 带注释的代码框架
- 最佳实践示例
- Helper 函数模板

**位置**: `plugins/plugin-template/`

**使用方法**:
```bash
# 复制模板
cp -r plugins/plugin-template plugins/my-plugin
cd plugins/my-plugin

# 自定义插件
# 1. 编辑 package.json
# 2. 编辑 index.js 中的 info 对象
# 3. 实现您的功能
```

## 🎯 创建新插件

### 方式 1: 使用模板（推荐）

```bash
cp -r plugins/plugin-template plugins/my-awesome-plugin
cd plugins/my-awesome-plugin
```

### 方式 2: 从零开始

```bash
mkdir plugins/my-plugin
cd plugins/my-plugin
npm init -y
```

创建 `index.js`:

```javascript
export const info = {
    id: 'my-plugin',
    name: 'My Plugin',
    description: 'My awesome plugin'
};

export async function init(router) {
    router.get('/hello', (req, res) => {
        res.json({ message: 'Hello!' });
    });
}
```

## 🚀 启用和测试

### 1. 启用插件

在项目根目录的 `config.yaml` 中：

```yaml
enableServerPlugins: true
enableServerPluginsAutoUpdate: false  # 开发时推荐禁用自动更新
```

### 2. 启动服务器

```bash
npm start
```

### 3. 测试插件

```bash
# 测试您的插件
curl http://localhost:8000/api/plugins/my-plugin/hello

# 查看服务器日志中的初始化消息
# [my-plugin] Initializing...
# [my-plugin] Routes registered successfully
```

## 📋 插件命令

### 更新所有插件

```bash
node plugins.js update
```

### 安装新插件

```bash
node plugins.js install https://github.com/user/plugin-repo.git
```

## 📚 学习资源

### 对于初学者

1. 阅读 [QUICKSTART.md](./QUICKSTART.md)
2. 查看 `example-plugin` 的源代码
3. 运行示例插件并测试其端点

### 对于中级开发者

1. 阅读 [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md)
2. 查看 `data-export-plugin` 和 `api-monitor-plugin`
3. 实现自己的功能

### 对于高级开发者

1. 查看 `src/plugin-loader.js` 了解加载机制
2. 查看 Express Router 文档
3. 实现高级功能（数据库、认证等）

## 🔧 插件开发最佳实践

### 1. 命名规范

✓ 推荐:
- `my-org-plugin`
- `stats-collector`
- `api-gateway-extension`

✗ 避免:
- `MyPlugin` (包含大写字母)
- `my plugin` (包含空格)
- `plugin!` (特殊字符)

### 2. 错误处理

```javascript
export async function init(router) {
    try {
        // 初始化代码
        router.get('/data', (req, res) => {
            try {
                res.json(getData());
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        console.error(`[${info.id}] Initialization failed:`, error);
        throw error;
    }
}
```

### 3. 日志记录

```javascript
// 使用统一的前缀
console.log(`[${info.id}] Important message`);
console.error(`[${info.id}] Error message`);
console.debug(`[${info.id}] Debug message`);
```

### 4. 资源清理

```javascript
export async function exit() {
    console.log(`[${info.id}] Cleaning up...`);
    // 关闭连接、释放资源等
}
```

## 🐛 调试

### 启用调试模式

```bash
npm run debug
# 然后在 Chrome 中访问 chrome://inspect
```

### 查看日志

插件的所有 console.log 输出都会显示在服务器日志中。

### 测试端点

```bash
# 使用 curl
curl http://localhost:8000/api/plugins/my-plugin/endpoint

# 使用 fetch
fetch('/api/plugins/my-plugin/endpoint')
    .then(r => r.json())
    .then(data => console.log(data));
```

## 📦 发布插件

### 准备发布

1. 创建 Git 仓库
2. 添加 README.md 文档
3. 添加适当的许可证
4. 编写测试

### 发布到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/user/plugin-repo.git
git push -u origin main
```

### 安装发布的插件

```bash
node plugins.js install https://github.com/user/plugin-repo.git
```

## ❓ 常见问题

### Q: 我的插件没有加载怎么办？

A: 检查：
1. 在 config.yaml 中启用了 enableServerPlugins
2. 插件在 plugins 目录中
3. 服务器日志中的错误信息
4. info 对象和 init 函数是否正确导出

### Q: 如何在插件间共享代码？

A: 创建一个独立的 npm 包并作为依赖引入。

### Q: 插件可以修改主应用的行为吗？

A: 不能直接修改，但可以通过 API 与主应用交互。

### Q: 插件会持久化吗？

A: 会。插件数据保存在 DATA_ROOT 目录中。

## 🤝 贡献

欢迎提交您的插件！

1. Fork 本项目
2. 创建功能分支
3. 提交 Pull Request

## 📄 许可证

所有插件均采用 AGPL-3.0 许可证。

## 🆘 获取帮助

- 📖 查看 [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md)
- 💬 在 GitHub Issues 中提问
- 📧 联系项目维护者

---

**开始构建令人惊艳的插件吧！** 🚀
