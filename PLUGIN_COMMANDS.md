# SillyTavernchat 插件系统命令参考

本文档列出了所有与插件相关的命令和使用方法。

## npm 脚本命令

### 更新所有插件

```bash
npm run plugins:update
# 或
node plugins.js update
```

**说明**: 
- 自动从 Git 仓库拉取所有已安装插件的最新版本
- 只更新那些通过 `plugins.js install` 安装的插件
- 需要在项目根目录执行

**示例输出**:
```
Finding 2 directories in ./plugins
Updating plugin my-plugin...
Plugin my-plugin updated to commit abc123def
Updating plugin another-plugin...
Plugin another-plugin is already up to date
All plugins updated!
```

### 安装新插件

```bash
npm run plugins:install
# 或
node plugins.js install <plugin-git-url>
```

**参数**:
- `<plugin-git-url>`: 插件 Git 仓库的 URL

**说明**:
- 从指定的 Git 仓库克隆插件到 `plugins` 目录
- 使用浅克隆（`--depth 1`）以节省空间
- 插件目录名称由 Git URL 自动推导

**示例**:
```bash
npm run plugins:install https://github.com/user/my-plugin.git
# 或
node plugins.js install https://github.com/user/my-plugin.git
```

**结果**:
- 在 `plugins/my-plugin/` 目录下安装插件
- 自动初始化 Git 仓库
- 可以通过 `npm run plugins:update` 更新

## 插件配置

### 启用/禁用插件系统

在项目根目录的 `config.yaml` 中配置：

```yaml
# 启用服务器插件系统
enableServerPlugins: true

# 启用插件自动更新（生产环境建议禁用）
enableServerPluginsAutoUpdate: false
```

## 开发工作流程

### 1. 创建新插件

```bash
# 方式 1: 使用模板（推荐）
cp -r plugins/plugin-template plugins/my-plugin
cd plugins/my-plugin
npm install

# 方式 2: 从零开始
mkdir plugins/my-plugin
cd plugins/my-plugin
npm init -y
```

### 2. 启用开发模式

编辑 `config.yaml`:
```yaml
enableServerPlugins: true
enableServerPluginsAutoUpdate: false
```

### 3. 启动开发服务器

```bash
npm start
```

服务器将自动加载 `plugins` 目录中的所有插件。

### 4. 测试插件

```bash
# 测试健康检查
curl http://localhost:8000/api/plugins/my-plugin/health

# 使用 fetch 测试
curl -X POST http://localhost:8000/api/plugins/my-plugin/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### 5. 调试

```bash
# 启用调试模式
npm run debug
```

然后在浏览器中打开 `chrome://inspect` 连接调试器。

## 插件发布工作流程

### 1. 本地测试

```bash
npm start
# 测试您的插件
curl http://localhost:8000/api/plugins/my-plugin/...
```

### 2. 准备发布

在插件目录中：

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库
# 然后推送
git remote add origin https://github.com/user/my-plugin.git
git branch -M main
git push -u origin main
```

### 3. 安装已发布的插件

```bash
node plugins.js install https://github.com/user/my-plugin.git
```

### 4. 更新已安装的插件

```bash
npm run plugins:update
```

## 故障排查

### 插件未加载

**症状**: 启动服务器后，插件未被加载

**检查清单**:
1. 检查 `enableServerPlugins` 是否在 `config.yaml` 中设置为 `true`
2. 检查插件是否在 `plugins/` 目录中
3. 检查服务器日志中的错误信息
4. 验证插件的 `info` 对象是否正确

**解决方案**:
```bash
# 查看插件目录
ls -la plugins/

# 启动服务器并查看日志
npm start 2>&1 | grep -i plugin
```

### 插件加载但路由不可用

**症状**: 插件已加载，但 API 端点返回 404

**检查**:
1. 检查插件的路由注册是否正确
2. 验证 API URL 格式是否正确
3. 检查插件是否有错误

**验证路由**:
```bash
# 查看插件健康状态
curl http://localhost:8000/api/plugins/my-plugin/health

# 查看完整 URL
# /api/plugins/{pluginId}/{route}
```

### 更新插件失败

**症状**: `node plugins.js update` 返回错误

**原因可能**:
1. Git 未安装
2. 插件目录不是 Git 仓库
3. 网络连接问题
4. 磁盘空间不足

**解决方案**:
```bash
# 检查 Git 是否安装
which git

# 检查插件是否是 Git 仓库
cd plugins/my-plugin
git status

# 重新安装插件
rm -rf plugins/my-plugin
node plugins.js install https://github.com/user/my-plugin.git
```

## 最佳实践

### 1. 使用统一的命令

- 始终使用 `npm run plugins:update` 而不是直接运行 `node plugins.js`
- 这样可以确保路径正确

### 2. 自动化更新

```bash
# 创建 cron 任务定期更新插件
# 编辑 crontab
crontab -e

# 添加每天早上 3 点更新插件
0 3 * * * cd /path/to/SillyTavernchat && npm run plugins:update
```

### 3. 备份插件配置

```bash
# 备份已安装的插件列表
ls -1 plugins/ > plugins.txt

# 恢复已安装的插件
while read plugin; do
  if [ -f "plugins/$plugin/package.json" ]; then
    REPO=$(grep '"repository"' plugins/$plugin/package.json | cut -d'"' -f4)
    node plugins.js install $REPO
  fi
done < plugins.txt
```

### 4. 开发时禁用自动更新

```yaml
enableServerPlugins: true
enableServerPluginsAutoUpdate: false  # 开发时禁用
```

### 5. 生产环境配置

```yaml
enableServerPlugins: true
enableServerPluginsAutoUpdate: true   # 生产环境启用
```

## 相关文档

- [插件开发指南](./PLUGIN_DEVELOPMENT.md)
- [快速开始指南](./plugins/QUICKSTART.md)
- [插件系统](./plugins/README.md)

## 命令速查表

| 命令 | 说明 |
|------|------|
| `npm run plugins:update` | 更新所有插件 |
| `npm run plugins:install` | 安装新插件 |
| `npm start` | 启动服务器并加载插件 |
| `npm run debug` | 启动调试模式 |
| `npm run lint` | 代码检查 |

---

**需要帮助？** 查看 [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md) 了解更多信息。
