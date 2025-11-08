# 前端拓展开发工作流指南

本文档提供了前端拓展开发的完整工作流程，包括设计、实现、测试和发布。

## 目录

1. [工作流概述](#工作流概述)
2. [第一阶段：规划和设计](#第一阶段规划和设计)
3. [第二阶段：开发](#第二阶段开发)
4. [第三阶段：测试](#第三阶段测试)
5. [第四阶段：优化和打磨](#第四阶段优化和打磨)
6. [第五阶段：发布](#第五阶段发布)
7. [团队协作](#团队协作)
8. [版本管理](#版本管理)

## 工作流概述

```
规划设计 → 开发 → 测试 → 优化 → 发布 → 维护
   ↑     ↓    ↓    ↓    ↓
   +-----+----+----+----+
```

完整流程从规划开始，贯穿整个开发周期。每个阶段都有特定的目标和检查点。

## 第一阶段：规划和设计

### 1.1 定义需求

在开始编码前，明确定义你的拓展目标：

```markdown
## 拓展需求文档

### 功能需求
- [ ] 功能 1：描述
- [ ] 功能 2：描述
- [ ] 功能 3：描述

### 非功能需求
- [ ] 性能指标
- [ ] 兼容性要求
- [ ] 安全要求

### 依赖项
- [ ] 需要的 API
- [ ] 依赖的其他拓展
- [ ] 外部服务

### 成功标准
- [ ] 所有功能正常工作
- [ ] 测试覆盖率 > 80%
- [ ] 零安全漏洞
```

### 1.2 架构设计

```
my-extension/
├── manifest.json           # 元数据
├── index.js               # 主入口
├── commands.js            # 斜杠命令
├── ui/
│   ├── panel.html        # 主面板模板
│   ├── settings.html     # 设置面板
│   └── styles.css        # UI 样式
├── handlers/
│   ├── eventHandlers.js  # 事件处理
│   ├── apiHandlers.js    # API 处理
│   └── commandHandlers.js # 命令处理
├── utils/
│   ├── storage.js        # 存储操作
│   ├── validators.js     # 数据验证
│   └── helpers.js        # 辅助函数
└── tests/
    ├── index.test.js
    ├── handlers.test.js
    └── utils.test.js
```

### 1.3 依赖关系映射

```javascript
// 记录拓展的依赖关系
{
    "display_name": "My Extension",
    "requires": ["module1"],              // Extras API 模块
    "dependencies": ["memory", "assets"], // 其他拓展
    "optional": ["tts"],                  // 可选模块
    "minimum_client_version": "1.0.0"
}
```

### 1.4 UI/UX 设计

创建 `DESIGN.md` 文档：

```markdown
# UI/UX 设计

## 用户界面

### 主面板
- 布局：垂直堆叠
- 颜色方案：遵循主应用
- 响应式设计：支持移动设备

### 交互流程
1. 用户点击拓展按钮
2. 面板打开并加载数据
3. 用户进行操作
4. 结果保存或实时反映

## 用户流
- [流程图]
- [原型]
```

## 第二阶段：开发

### 2.1 初始化拓展

```bash
#!/bin/bash

EXTENSION_NAME="my-extension"
mkdir -p "public/scripts/extensions/${EXTENSION_NAME}"
cd "public/scripts/extensions/${EXTENSION_NAME}"

# 创建基本文件结构
touch manifest.json index.js style.css

# 创建目录
mkdir -p ui handlers utils tests
```

### 2.2 编写 manifest.json

```json
{
    "display_name": "My Extension",
    "loading_order": 100,
    "requires": [],
    "optional": [],
    "js": "index.js",
    "css": "style.css",
    "author": "Your Name",
    "version": "1.0.0",
    "minimum_client_version": "1.0.0",
    "dependencies": [],
    "homePage": "https://github.com/yourname/my-extension"
}
```

### 2.3 核心开发

#### 步骤 1：基本骨架

```javascript
// index.js
import { eventSource, event_types } from '../../../script.js';
import { getContext } from '../../extensions.js';

export const MODULE_NAME = 'my-extension';
const DEBUG_PREFIX = '[my-extension]';

export async function setup() {
    console.log(DEBUG_PREFIX, 'Setting up...');
    
    try {
        initializeUI();
        attachEventListeners();
        loadSettings();
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Setup failed:', error);
    }
}

function initializeUI() {
    console.log(DEBUG_PREFIX, 'Initializing UI...');
}

function attachEventListeners() {
    console.log(DEBUG_PREFIX, 'Attaching event listeners...');
    eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}

function loadSettings() {
    console.log(DEBUG_PREFIX, 'Loading settings...');
}

async function onCharacterLoaded() {
    console.log(DEBUG_PREFIX, 'Character loaded');
}

export async function cleanup() {
    console.log(DEBUG_PREFIX, 'Cleaning up...');
    eventSource.removeEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}
```

#### 步骤 2：添加功能

```javascript
// handlers/eventHandlers.js
import { event_types } from '../../../../script.js';

export async function onCharacterLoaded() {
    const context = getContext();
    console.log('Character:', context.characterName);
}

export async function onMessageSent(event) {
    const message = event.detail.message;
    console.log('Message sent:', message);
}
```

#### 步骤 3：创建 UI

```html
<!-- ui/panel.html -->
<div class="my-extension-panel">
    <h3>{{title}}</h3>
    
    <div class="settings-section">
        <label>选项 1：</label>
        <input type="text" id="option1" placeholder="输入值" />
    </div>
    
    <div class="settings-section">
        <button id="save-btn" class="btn btn-primary">保存设置</button>
    </div>
    
    <div class="status-area" id="status"></div>
</div>
```

```css
/* style.css */
.my-extension-panel {
    padding: 15px;
    background: var(--bg-secondary);
    border-radius: 8px;
    max-width: 400px;
}

.my-extension-panel h3 {
    margin: 0 0 15px 0;
    color: var(--text-primary);
}

.settings-section {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.settings-section label {
    font-weight: 500;
    color: var(--text-secondary);
}

.settings-section input,
.settings-section select {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
}

.status-area {
    margin-top: 12px;
    padding: 8px;
    background: var(--bg-primary);
    border-radius: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    min-height: 20px;
}
```

### 2.4 实现功能

```javascript
// handlers/apiHandlers.js
import { getRequestHeaders } from '../../../../script.js';

export async function fetchExtensionData() {
    try {
        const response = await fetch('/api/my-extension/data', {
            method: 'GET',
            headers: getRequestHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}

export async function saveExtensionData(data) {
    try {
        const response = await fetch('/api/my-extension/data', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to save data:', error);
        throw error;
    }
}
```

## 第三阶段：测试

### 3.1 单元测试

创建 `tests/index.test.js`：

```javascript
import { setup, cleanup, MODULE_NAME } from '../index.js';

describe('My Extension', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    describe('Setup', () => {
        test('should initialize successfully', async () => {
            await expect(setup()).resolves.not.toThrow();
        });
        
        test('should handle errors gracefully', async () => {
            // 模拟错误场景
            jest.spyOn(console, 'error').mockImplementation();
            // 测试错误处理
        });
    });
    
    describe('Module exports', () => {
        test('should export MODULE_NAME', () => {
            expect(MODULE_NAME).toBe('my-extension');
        });
    });
});
```

运行测试：
```bash
npm test -- public/scripts/extensions/my-extension/tests/
```

### 3.2 集成测试

```javascript
// 在浏览器中手动测试
describe('Integration Tests', () => {
    test('Extension loads with application', async () => {
        // 打开应用
        // 检查拓展是否加载
        // 验证功能正常
    });
    
    test('Extension handles character switches', async () => {
        // 加载角色 A
        // 切换到角色 B
        // 验证拓展状态更新
    });
});
```

### 3.3 手动测试清单

创建 `TESTING_CHECKLIST.md`：

```markdown
# 测试清单

## 基本功能
- [ ] 拓展加载时没有错误
- [ ] 所有 UI 元素正确显示
- [ ] 按钮点击有反应
- [ ] 输入字段接收输入

## 事件处理
- [ ] CHARACTER_LOADED 事件正确处理
- [ ] MESSAGE_SENT 事件正确处理
- [ ] 切换角色时数据正确更新

## 存储
- [ ] 设置正确保存
- [ ] 设置在刷新后保持
- [ ] 数据导出功能正常

## 性能
- [ ] 初始化时间 < 1s
- [ ] UI 响应 < 100ms
- [ ] 没有内存泄漏

## 兼容性
- [ ] 在 Chrome 中工作
- [ ] 在 Firefox 中工作
- [ ] 移动设备响应式
- [ ] 黑暗模式支持

## 错误处理
- [ ] API 失败时优雅降级
- [ ] 显示有意义的错误消息
- [ ] 错误不会崩溃应用
```

## 第四阶段：优化和打磨

### 4.1 代码审查

创建 `CODE_REVIEW_CHECKLIST.md`：

```markdown
# 代码审查检查表

## 代码质量
- [ ] 遵循项目代码风格
- [ ] 没有未使用的变量
- [ ] 函数有 JSDoc 注释
- [ ] 错误处理完善

## 性能
- [ ] 没有 N+1 查询问题
- [ ] 使用防抖/节流适当的操作
- [ ] 异步操作正确处理
- [ ] 内存泄漏已检查

## 安全性
- [ ] 用户输入已清理
- [ ] API 端点已认证
- [ ] 没有硬编码的凭证
- [ ] CSRF 保护已实施

## 可维护性
- [ ] 代码清晰易懂
- [ ] 文件结构合理
- [ ] 函数职责单一
- [ ] 可测试性好
```

### 4.2 性能优化

```javascript
// 延迟加载资源
export async function setup() {
    // 关键初始化
    initializeCore();
    
    // 延迟非关键初始化
    setTimeout(() => {
        loadOptionalFeatures();
    }, 1000);
}

// 使用防抖处理频繁事件
import { debounce } from '../../utils.js';

const debouncedSave = debounce(async (data) => {
    await saveData(data);
}, 1000);

// 缓存计算结果
const cache = new Map();

function getCachedData(key) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    
    const data = expensiveCalculation(key);
    cache.set(key, data);
    return data;
}
```

### 4.3 用户体验改进

```javascript
// 添加加载状态
async function loadData() {
    showLoadingIndicator();
    
    try {
        const data = await fetchData();
        displayData(data);
    } catch (error) {
        showErrorMessage('Failed to load data');
    } finally {
        hideLoadingIndicator();
    }
}

// 提供反馈
function showSuccessNotification(message) {
    const notification = $('<div class="notification success"></div>')
        .text(message)
        .appendTo('body');
    
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 3000);
}
```

### 4.4 国际化

创建翻译文件：

```javascript
// locales/zh_CN.json
{
    "my-extension.title": "我的拓展",
    "my-extension.button.save": "保存",
    "my-extension.message.success": "操作成功",
    "my-extension.message.error": "发生错误"
}

// locales/en_US.json
{
    "my-extension.title": "My Extension",
    "my-extension.button.save": "Save",
    "my-extension.message.success": "Operation successful",
    "my-extension.message.error": "An error occurred"
}
```

在代码中使用：

```javascript
import { t } from '../../i18n.js';

export async function setup() {
    const title = t`my-extension.title`;
    console.log(title);
}
```

## 第五阶段：发布

### 5.1 准备发布

1. **更新版本号**：
```json
{
    "version": "1.0.0"
}
```

2. **创建 CHANGELOG.md**：
```markdown
# 更新日志

## [1.0.0] - 2024-01-15

### 新增
- 初始版本发布
- 功能 1
- 功能 2

### 修复
- Bug 修复 1
- Bug 修复 2

### 改进
- 性能优化
- UI 改进
```

3. **创建 README.md**：
```markdown
# My Extension

## 功能
- 功能 1
- 功能 2
- 功能 3

## 安装
1. 复制文件到 `public/scripts/extensions/my-extension/`
2. 重启应用

## 配置
[配置说明]

## 使用
[使用说明]

## 许可证
MIT
```

### 5.2 打包和分发

```bash
#!/bin/bash

# 打包拓展
EXTENSION_NAME="my-extension"
VERSION="1.0.0"

cd public/scripts/extensions/${EXTENSION_NAME}

# 创建发布包
zip -r "../../${EXTENSION_NAME}-${VERSION}.zip" . \
    -x "tests/*" "*.test.js"

# 或者生成 tarball
tar -czf "../../${EXTENSION_NAME}-${VERSION}.tar.gz" \
    --exclude=tests \
    --exclude="*.test.js" \
    .
```

### 5.3 发布到 GitHub

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: My Extension v1.0.0"

# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送到 GitHub
git remote add origin https://github.com/yourname/my-extension.git
git push origin main v1.0.0
```

### 5.4 注册到资源市场（可选）

编辑项目的资源列表：

```json
{
    "type": "extension",
    "name": "My Extension",
    "url": "https://github.com/yourname/my-extension",
    "author": "Your Name",
    "version": "1.0.0",
    "description": "My awesome extension",
    "tags": ["utility", "enhancement"]
}
```

## 团队协作

### 代码审查流程

```markdown
## 拓展审查流程

### 提交前
- [ ] 代码通过本地测试
- [ ] 遵循代码风格指南
- [ ] 更新文档
- [ ] 更新 CHANGELOG

### 审查期间
- [ ] 至少一个审查者同意
- [ ] 所有注释已解决
- [ ] CI/CD 检查通过

### 合并后
- [ ] 创建发布标签
- [ ] 更新资源市场
- [ ] 通知用户
```

### 沟通渠道

- **Issue 讨论**：用于功能请求和 Bug 报告
- **Pull Requests**：用于代码审查
- **Discussions**：用于一般讨论
- **Wiki**：用于文档

## 版本管理

### 语义版本控制

```
MAJOR.MINOR.PATCH
1.0.0

MAJOR：破坏性变更
MINOR：新功能（向后兼容）
PATCH：Bug 修复
```

### 版本发布流程

```bash
# 1. 更新版本号
# manifest.json 中更新 "version": "1.1.0"

# 2. 更新 CHANGELOG
# 记录所有变更

# 3. 创建发布分支
git checkout -b release/1.1.0

# 4. 提交变更
git commit -m "Release: v1.1.0"

# 5. 创建标签
git tag -a v1.1.0 -m "Release version 1.1.0"

# 6. 推送到远程
git push origin release/1.1.0 v1.1.0

# 7. 创建 Release Notes
# 在 GitHub 中创建 Release
```

### 兼容性维护

```javascript
// 在 manifest.json 中指定最小客户端版本
{
    "minimum_client_version": "1.0.0",
    "version": "2.0.0"
}

// 在代码中检查兼容性
export async function setup() {
    const clientVersion = window.CLIENT_VERSION.split(':')[1];
    
    if (clientVersion < '1.0.0') {
        console.warn('Extension requires client version 1.0.0 or higher');
        return;
    }
}
```

## 维护和支持

### 定期维护任务

- 每月检查依赖更新
- 季度性能审计
- 年度代码审查和重构

### 用户支持

1. 监视 Issue 和讨论
2. 及时回应用户问题
3. 提供清晰的文档
4. 定期发布更新

### 已知问题跟踪

创建 `KNOWN_ISSUES.md`：

```markdown
# 已知问题

## 版本 1.0.0

### 问题 1：[描述]
- 影响范围：[描述]
- 解决方案：[临时解决方案]
- 修复计划：[何时修复]

### 问题 2：[描述]
- 影响范围：[描述]
- 解决方案：[临时解决方案]
- 修复计划：[何时修复]
```

---

**最后更新**：2024 年
**维护者**：[你的名字]
