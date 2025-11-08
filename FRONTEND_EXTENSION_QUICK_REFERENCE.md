# 前端拓展快速参考

快速速查表，适合已有基础的开发者。

## 项目结构

```
public/scripts/extensions/
├── my-extension/
│   ├── manifest.json      # 必需：元数据
│   ├── index.js           # 必需：主代码
│   ├── style.css          # 可选：样式
│   ├── [name].html        # 可选：HTML 模板
│   ├── commands.js        # 可选：斜杠命令
│   └── ...
```

## 最小模板

### manifest.json
```json
{
    "display_name": "My Extension",
    "loading_order": 100,
    "js": "index.js",
    "css": "style.css",
    "author": "Your Name",
    "version": "1.0.0"
}
```

### index.js
```javascript
export const MODULE_NAME = 'my-extension';

export async function setup() {
    // 初始化代码
}

export async function cleanup() {
    // 清理代码
}
```

## 核心 API

### 导入

```javascript
// 事件和应用
import { eventSource, event_types, saveSettings } from '../../../script.js';
import { getContext, extension_settings } from '../../extensions.js';
import { t } from '../../i18n.js';
import { DOMPurify } from '../../../lib.js';
import { accountStorage } from '../../util/AccountStorage.js';
```

### 事件监听

```javascript
// 监听事件
eventSource.addEventListener(event_types.CHARACTER_LOADED, handler);

// 移除监听
eventSource.removeEventListener(event_types.CHARACTER_LOADED, handler);

// 常见事件
event_types.CHARACTER_LOADED
event_types.MESSAGE_SENT
event_types.MESSAGE_RECEIVED
event_types.CHAT_CHANGED
```

### 上下文访问

```javascript
const ctx = getContext();
ctx.characterName          // 角色名
ctx.characterDescription   // 角色描述
ctx.characterId           // 角色 ID
ctx.chatId                // 聊天 ID
ctx.chat                  // 消息数组
ctx.currentCharacter      // 当前角色对象
await ctx.saveMetadata(); // 保存元数据
```

### 设置管理

```javascript
// 访问设置
extension_settings.my_extension = { /* 设置 */ };

// 保存设置
await saveSettings();

// 账户存储
accountStorage.setObject('key', { data: 'value' });
const data = accountStorage.getObject('key');
accountStorage.removeObject('key');
```

### 模板渲染

```javascript
// 异步渲染
const html = await renderExtensionTemplateAsync('my-extension', 'template-name', {
    variable: 'value'
});

// 在 HTML 中使用变量
// {{variable}} - 转义输出
// {{{unescapedVariable}}} - 不转义
```

### 网络请求

```javascript
import { getRequestHeaders } from '../../../script.js';

// 获取数据
const response = await fetch('/api/endpoint', {
    method: 'GET',
    headers: getRequestHeaders()
});

// 发送数据
await fetch('/api/endpoint', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ data: 'value' })
});
```

### HTML 清理

```javascript
import { DOMPurify } from '../../../lib.js';

const dirtyHtml = '<img src=x onerror="alert(1)">';
const cleanHtml = DOMPurify.sanitize(dirtyHtml);
$('#container').html(cleanHtml);
```

### 国际化

```javascript
import { t, translate } from '../../i18n.js';

// 标记字符串
const message = t`Hello`;

// 翻译文本
const translated = translate('hello', 'es');
```

## 常见模式

### 初始化

```javascript
export async function setup() {
    try {
        initializeUI();
        attachEventListeners();
        loadSettings();
        console.log('[my-extension] Initialized');
    } catch (error) {
        console.error('[my-extension] Setup failed:', error);
    }
}
```

### 事件处理

```javascript
async function onCharacterLoaded() {
    try {
        const ctx = getContext();
        // 处理逻辑
    } catch (error) {
        console.error('[my-extension] Error:', error);
    }
}

eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
```

### 菜单项

```javascript
function initializeUI() {
    const button = $('<button>My Extension</button>')
        .click(() => showPanel());
    
    $('#extensionsMenu').append(button);
}
```

### 防抖保存

```javascript
import { debounce_timeout } from '../../constants.js';

let saveTimeout;

function onSettingChange() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        await saveSettings();
    }, debounce_timeout.relaxed);
}
```

### 错误处理

```javascript
async function riskyOperation() {
    try {
        // 操作
    } catch (error) {
        console.error('[my-extension] Error:', error);
        showErrorNotification('Operation failed');
        return null;
    }
}
```

## 调试

### 浏览器控制台命令

```javascript
// 获取所有拓展
Object.keys(window.extensionTypes)

// 检查拓展设置
console.log(window.extension_settings)

// 获取上下文
console.log(window.getContext())

// 监视事件
eventSource.addEventListener('*', (e) => console.log(e))
```

### 日志最佳实践

```javascript
const DEBUG_PREFIX = '[my-extension]';

export async function setup() {
    console.log(DEBUG_PREFIX, 'Initializing...');
    console.log(DEBUG_PREFIX, 'Config:', config);
    console.error(DEBUG_PREFIX, 'Error:', error);
}
```

## 命令行操作

### 创建新拓展

```bash
mkdir -p public/scripts/extensions/my-extension
cd public/scripts/extensions/my-extension

# 创建文件
touch manifest.json index.js style.css
```

### 开发服务器

```bash
# 启动开发服务器
npm start

# 访问应用
# http://localhost:8000
```

### 打包发布

```bash
# 打包为 ZIP
cd public/scripts/extensions/my-extension
zip -r my-extension.zip . -x "tests/*" "*.test.js"
```

## 性能优化

### 异步加载

```javascript
// ✓ 好的
export async function setup() {
    // 关键初始化
    initializeCore();
    
    // 延迟非关键部分
    setTimeout(initializeOptional, 1000);
}
```

### 防抖和节流

```javascript
import { debounce } from '../../utils.js';

const debouncedUpdate = debounce(updateUI, 500);

eventSource.addEventListener(event_types.MESSAGE_RECEIVED, debouncedUpdate);
```

### 缓存

```javascript
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

## 安全性清单

- [ ] 清理所有用户输入：`DOMPurify.sanitize(userInput)`
- [ ] 使用 `getRequestHeaders()` 获取认证头
- [ ] 不要硬编码凭证或 API 密钥
- [ ] 验证所有 API 响应
- [ ] 正确处理错误，不暴露敏感信息

## 常见错误

### ✗ 忘记导出 MODULE_NAME
```javascript
// 错误
function setup() { }

// 正确
export const MODULE_NAME = 'my-extension';
export async function setup() { }
```

### ✗ 忘记清理事件监听器
```javascript
// 错误
export async function setup() {
    eventSource.addEventListener(...handler);
}

// 正确
export async function cleanup() {
    eventSource.removeEventListener(...handler);
}
```

### ✗ 直接使用用户输入的 HTML
```javascript
// 错误
$('#container').html(userInput);

// 正确
$('#container').html(DOMPurify.sanitize(userInput));
```

### ✗ 忽略异步错误
```javascript
// 错误
const data = await fetchData();

// 正确
try {
    const data = await fetchData();
} catch (error) {
    console.error('Failed to fetch:', error);
}
```

## 依赖关系

### 检查依赖是否已加载

```javascript
import { extensionNames } from '../../extensions.js';

if (extensionNames.includes('other-extension')) {
    // 其他拓展已加载
}
```

### 指定依赖项

```json
{
    "requires": ["module1"],
    "dependencies": ["other-extension"],
    "optional": ["optional-module"]
}
```

## 版本控制

### 版本号格式

```
MAJOR.MINOR.PATCH
1.0.0

1 = Major (破坏性变更)
0 = Minor (新功能)
0 = Patch (Bug 修复)
```

### 检查客户端版本

```javascript
const clientVersion = window.CLIENT_VERSION.split(':')[1];

if (clientVersion < '1.0.0') {
    console.warn('Extension requires v1.0.0+');
    return;
}
```

## 测试

### 基本测试模板

```javascript
// tests/index.test.js
import { setup, cleanup, MODULE_NAME } from '../index.js';

describe('My Extension', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        cleanup();
    });
    
    test('setup completes without error', async () => {
        await expect(setup()).resolves.not.toThrow();
    });
});
```

### 运行测试

```bash
npm test -- my-extension
```

## 发布清单

- [ ] 更新 `version` 在 manifest.json
- [ ] 更新 CHANGELOG.md
- [ ] 代码审查通过
- [ ] 测试覆盖率 > 80%
- [ ] 创建 Git 标签：`git tag -a v1.0.0`
- [ ] 推送到 GitHub
- [ ] 创建 Release Notes

## 资源链接

| 资源 | 链接 |
|------|------|
| 完整指南 | [FRONTEND_EXTENSION_GUIDE.md](./FRONTEND_EXTENSION_GUIDE.md) |
| 工作流程 | [FRONTEND_EXTENSION_WORKFLOW.md](./FRONTEND_EXTENSION_WORKFLOW.md) |
| 项目主页 | https://github.com/SillyTavern/SillyTavernchat |
| 问题追踪 | https://github.com/SillyTavern/SillyTavernchat/issues |

---

**最后更新**：2024 年
