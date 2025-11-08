# 前端拓展开发文档

欢迎来到 SillyTavernchat 前端拓展开发的完整文档！本文档集合提供了从入门到精通的全面指南。

## 📚 文档导航

### 🚀 新手入门

如果你是第一次开发拓展，从这里开始：

1. **[快速开始 (5 分钟)](./FRONTEND_EXTENSION_QUICK_REFERENCE.md#快速开始)** - 最小化示例和速查表
2. **[实践教程](./FRONTEND_EXTENSION_TUTORIAL.md)** - 通过完整示例学习
3. **[工作流指南](./FRONTEND_EXTENSION_WORKFLOW.md)** - 从规划到发布的完整流程

### 📖 详细参考

深入学习拓展开发的各个方面：

1. **[完整开发指南](./FRONTEND_EXTENSION_GUIDE.md)** - 全面的 API 参考和最佳实践
2. **[快速参考](./FRONTEND_EXTENSION_QUICK_REFERENCE.md)** - 常用模式和命令速查
3. **[工作流程](./FRONTEND_EXTENSION_WORKFLOW.md)** - 从设计到发布的详细步骤

### 📦 示例项目

学习通过实际代码的示例：

- **[Example UI Extension](./public/scripts/extensions/example-ui-extension/)** - 完整功能的示例拓展
  - UI 面板管理
  - 设置保存和恢复
  - 事件监听
  - 数据导出/导入
  - 详细的代码注释

## 🎯 选择你的学习路径

### 路径 A：5 分钟快速入门（急于求成）

1. 阅读 [快速参考 - 最小模板](./FRONTEND_EXTENSION_QUICK_REFERENCE.md#最小模板)
2. 复制示例代码
3. 测试你的拓展
4. **完成！** 然后阅读其他部分深入学习

**时间**：5 分钟

### 路径 B：1 小时实践学习（最佳方式）

1. 阅读 [实践教程 - 第 1 步](./FRONTEND_EXTENSION_TUTORIAL.md#第-1-步创建基本骨架)
2. 逐步完成所有 6 个步骤
3. 运行 Example UI Extension 代码
4. 修改示例代码进行实验

**时间**：1 小时

**结果**：完全理解基础，能够创建功能拓展

### 路径 C：完整学习（成为专家）

1. 阅读 [项目结构](./FRONTEND_EXTENSION_GUIDE.md#项目结构)
2. 学习 [扩展 API](./FRONTEND_EXTENSION_GUIDE.md#扩展-api)
3. 研究 [高级主题](./FRONTEND_EXTENSION_GUIDE.md#高级主题)
4. 遵循 [最佳实践](./FRONTEND_EXTENSION_GUIDE.md#最佳实践)
5. 阅读 [工作流程](./FRONTEND_EXTENSION_WORKFLOW.md) 了解完整周期
6. 学习 [团队协作](./FRONTEND_EXTENSION_WORKFLOW.md#团队协作)

**时间**：4-8 小时

**结果**：精通拓展开发，能够处理复杂场景

## 📋 文档内容概览

### 1. 快速参考 (`FRONTEND_EXTENSION_QUICK_REFERENCE.md`)

**适合**：已有编程经验，想快速上手

**内容**：
- 项目结构速览
- 最小化模板
- 核心 API 调用
- 常见模式
- 调试技巧
- 发布清单

**时间**：10-15 分钟阅读

### 2. 实践教程 (`FRONTEND_EXTENSION_TUTORIAL.md`)

**适合**：想通过动手学习

**内容**：
- 示例拓展介绍
- 逐步解析每个部分
- 6 个递进式步骤
- 常见任务示例
- 扩展项目思路
- 问题排查

**时间**：1-2 小时学习

**示例项目**：`example-ui-extension`

### 3. 完整开发指南 (`FRONTEND_EXTENSION_GUIDE.md`)

**适合**：想全面了解所有可能性

**内容**：
- 快速开始
- 项目结构详解
- Manifest 完全指南
- 完整 API 参考
- 开发工作流
- 高级主题
  - 斜杠命令集成
  - 设置管理
  - 创建 UI 菜单
  - 异步操作
  - 与其他拓展通信
- 最佳实践
- 故障排除

**时间**：2-3 小时阅读

### 4. 工作流程指南 (`FRONTEND_EXTENSION_WORKFLOW.md`)

**适合**：想了解完整的开发生命周期

**内容**：
- 工作流概述
- 规划和设计阶段
- 开发阶段（详细步骤）
- 测试（单元、集成、手动）
- 优化和打磨
- 发布流程
- 团队协作
- 版本管理
- 维护和支持

**时间**：1-2 小时阅读

## 🔑 关键概念

### 拓展结构

```
my-extension/
├── manifest.json    # 元数据（必需）
├── index.js        # 主代码（必需）
├── style.css       # 样式（可选）
└── [name].html     # 模板（可选）
```

### 核心生命周期

```javascript
export async function setup() {
    // 初始化
    // - 创建 UI
    // - 附加事件
    // - 加载设置
}

// ... 拓展运行 ...

export async function cleanup() {
    // 清理
    // - 移除事件
    // - 清除定时器
    // - 释放资源
}
```

### 关键 API

```javascript
// 事件
eventSource.addEventListener(event_types.CHARACTER_LOADED, handler);

// 上下文
const ctx = getContext();
console.log(ctx.characterName);

// 设置
extension_settings.my_extension = { setting: 'value' };
await saveSettings();

// 模板
const html = await renderExtensionTemplateAsync('ext-name', 'template', data);

// UI
const popup = new Popup(html, POPUP_TYPE.TEXT);
popup.show();
```

## 🛠️ 常用命令

```bash
# 创建新拓展
mkdir -p public/scripts/extensions/my-extension

# 启动开发服务器
npm start

# 访问应用
# http://localhost:8000

# 查看控制台
# F12 → Console

# 测试拓展
# 在浏览器中打开 DevTools → Console
# 输入: console.log(extensionNames)
```

## ✅ 开发清单

### 创建拓展前

- [ ] 了解需求和功能
- [ ] 选择合适的拓展类型
- [ ] 检查依赖关系

### 开发期间

- [ ] 遵循代码风格指南
- [ ] 添加详细注释
- [ ] 处理错误
- [ ] 测试多个场景
- [ ] 检查浏览器兼容性

### 发布前

- [ ] 更新版本号
- [ ] 编写 CHANGELOG
- [ ] 代码审查
- [ ] 运行所有测试
- [ ] 验证没有控制台错误

## 🐛 常见问题

### Q: 拓展如何加载？

A: 应用启动时自动扫描 `public/scripts/extensions/` 目录，加载所有有效的拓展。

### Q: 如何调试拓展？

A: 使用浏览器开发者工具（F12）的 Console 标签。添加 `console.log()` 调用。

### Q: 如何保存拓展设置？

A: 使用 `extension_settings` 对象和 `saveSettings()` 函数。

### Q: 拓展可以访问哪些数据？

A: 通过 `getContext()` 可以访问当前角色、聊天、消息等数据。

### Q: 如何在拓展之间通信？

A: 使用 `extensionNames` 检查其他拓展是否加载，导入并调用其函数。

## 🎓 学习资源

### 官方资源
- [SillyTavernchat GitHub](https://github.com/SillyTavern/SillyTavernchat)
- [插件系统文档](./PLUGIN_DEVELOPMENT.md)

### 示例代码
- [Example UI Extension](./public/scripts/extensions/example-ui-extension/)
- [其他内置拓展](./public/scripts/extensions/)

### 相关文档
- [前端拓展指南](./FRONTEND_EXTENSION_GUIDE.md)
- [工作流程](./FRONTEND_EXTENSION_WORKFLOW.md)
- [API 参考](./FRONTEND_EXTENSION_GUIDE.md#扩展-api)

## 🚀 快速示例

### 最简单的拓展（复制即用）

**步骤 1**：创建目录和文件

```bash
mkdir -p public/scripts/extensions/hello-world
cd public/scripts/extensions/hello-world
touch manifest.json index.js
```

**步骤 2**：manifest.json

```json
{
    "display_name": "Hello World",
    "loading_order": 100,
    "js": "index.js",
    "author": "Your Name",
    "version": "1.0.0"
}
```

**步骤 3**：index.js

```javascript
export const MODULE_NAME = 'hello-world';

export async function setup() {
    console.log('Hello, World!');
    
    const button = $('<button>Say Hello</button>')
        .click(() => alert('Hello from my extension!'));
    
    $('#extensionsMenu').append(button);
}

export async function cleanup() {
    console.log('Goodbye, World!');
}
```

**步骤 4**：启动应用

```bash
npm start
# 访问 http://localhost:8000
```

**就这样！** 你现在有了一个工作的拓展。

## 📞 获取帮助

### 如果遇到问题

1. **查看故障排除部分**：
   - [指南中的故障排除](./FRONTEND_EXTENSION_GUIDE.md#故障排除)
   - [教程中的问题解决](./FRONTEND_EXTENSION_TUTORIAL.md#问题解决)

2. **检查浏览器控制台**：
   - 按 F12 打开开发者工具
   - 查看 Console 标签中的错误

3. **查看示例代码**：
   - [Example UI Extension](./public/scripts/extensions/example-ui-extension/)
   - 仔细阅读注释

4. **搜索相关文档**：
   - 使用 Ctrl+F 搜索关键词

5. **提交 Issue**：
   - 在 GitHub 上提交详细的 issue

## 📈 进阶主题

已掌握基础？这里是进阶内容：

### 高级主题（来自完整指南）
- [斜杠命令集成](./FRONTEND_EXTENSION_GUIDE.md#与斜杠命令集成)
- [拓展设置管理](./FRONTEND_EXTENSION_GUIDE.md#拓展设置管理)
- [创建拓展 UI 菜单](./FRONTEND_EXTENSION_GUIDE.md#创建拓展-ui-菜单)
- [处理异步操作](./FRONTEND_EXTENSION_GUIDE.md#处理异步操作和错误)
- [与其他拓展通信](./FRONTEND_EXTENSION_GUIDE.md#与其他拓展通信)

### 性能优化
- [延迟加载资源](./FRONTEND_EXTENSION_WORKFLOW.md#42-性能优化)
- [使用防抖和节流](./FRONTEND_EXTENSION_QUICK_REFERENCE.md#防抖和节流)
- [缓存计算结果](./FRONTEND_EXTENSION_QUICK_REFERENCE.md#缓存)

### 团队协作
- [代码审查流程](./FRONTEND_EXTENSION_WORKFLOW.md#代码审查流程)
- [版本管理](./FRONTEND_EXTENSION_WORKFLOW.md#版本管理)
- [文档编写](./FRONTEND_EXTENSION_WORKFLOW.md#51-准备发布)

## 📝 文档统计

| 文档 | 大小 | 阅读时间 |
|------|------|---------|
| 快速参考 | ~5KB | 10-15 分钟 |
| 实践教程 | ~20KB | 1-2 小时 |
| 完整指南 | ~40KB | 2-3 小时 |
| 工作流程 | ~30KB | 1-2 小时 |
| **总计** | **~95KB** | **4-8 小时** |

## 🎉 开始吧！

### 你应该：

1. **现在就开始**：跟随 [快速开始](./FRONTEND_EXTENSION_QUICK_REFERENCE.md#快速开始)
2. **深入学习**：完成 [实践教程](./FRONTEND_EXTENSION_TUTORIAL.md) 的所有步骤
3. **参考文档**：需要时查阅 [完整指南](./FRONTEND_EXTENSION_GUIDE.md)
4. **实践项目**：创建你自己的拓展
5. **分享知识**：帮助他人学习

---

**文档版本**：1.0.0
**最后更新**：2024 年
**维护者**：SillyTavernchat Development Team

如有疑问或建议，欢迎提交 Issue 或 Pull Request！
