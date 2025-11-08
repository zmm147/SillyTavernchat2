# 前端拓展开发指南

本指南详细说明了如何为 SillyTavernchat 开发和集成前端拓展。

## 目录

1. [快速开始](#快速开始)
2. [项目结构](#项目结构)
3. [Manifest 文件](#manifest-文件)
4. [扩展 API](#扩展-api)
5. [开发工作流](#开发工作流)
6. [高级主题](#高级主题)
7. [最佳实践](#最佳实践)
8. [故障排除](#故障排除)

## 快速开始

### 最小化扩展示例

所有前端拓展都存储在 `/public/scripts/extensions/` 目录中。一个最小的拓展需要：

```
my-extension/
├── manifest.json      # 拓展元数据
├── index.js          # 主要拓展代码
└── [其他资源]        # CSS、HTML 模板等
```

### 创建你的第一个拓展

1. **创建目录结构**：
```bash
mkdir -p public/scripts/extensions/my-extension
```

2. **创建 manifest.json**：
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
    "homePage": "https://github.com/yourname/my-extension"
}
```

3. **创建 index.js**：
```javascript
// 导入所需的模块
import { eventSource, event_types, getRequestHeaders } from '../../../script.js';
import { getContext } from '../../extensions.js';

// 定义模块名称（必需）
export const MODULE_NAME = 'my-extension';

// 初始化拓展
export async function setup() {
    console.log('My extension initialized!');
    
    // 添加事件监听器
    eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}

async function onCharacterLoaded() {
    const context = getContext();
    console.log('Loaded character:', context.characterName);
}

// 清理函数（可选）
export async function cleanup() {
    console.log('My extension cleanup');
}
```

4. **加载拓展**：
在 `/public/index.html` 中，拓展会被自动发现和加载。

## 项目结构

### 拓展目录布局

```
public/
├── scripts/
│   ├── extensions.js              # 主要拓展系统代码
│   ├── extensions-slashcommands.js # 斜杠命令集成
│   ├── extensions/
│   │   ├── assets/                # 资源管理拓展
│   │   ├── expressions/           # 表情拓展
│   │   ├── memory/                # 内存/笔记拓展
│   │   ├── quick-reply/           # 快速回复拓展
│   │   ├── tts/                   # 文本转语音拓展
│   │   ├── shared.js              # 共享工具函数
│   │   └── [其他拓展]/
│   ├── script.js                  # 主应用脚本
│   ├── utils.js                   # 工具函数
│   ├── i18n.js                    # 国际化支持
│   └── st-context.js              # 上下文管理
├── index.html                     # 主 HTML 文件
├── login.html                     # 登录页面
├── style.css                      # 全局样式
└── lib.js                         # Webpack 打包库
```

### 拓展文件说明

| 文件 | 必需 | 说明 |
|------|------|------|
| manifest.json | ✓ | 拓展元数据和配置 |
| index.js | ✓ | 主要拓展代码 |
| style.css | ✗ | 拓展样式 |
| *.html | ✗ | HTML 模板 |

## Manifest 文件

### 完整的 Manifest 示例

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

### Manifest 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| display_name | string | ✓ | 拓展显示名称 |
| loading_order | number | ✓ | 加载顺序（小优先） |
| requires | string[] | ✗ | 依赖的 Extras API 模块 |
| optional | string[] | ✗ | 可选的 Extras API 模块 |
| js | string | ✓ | 主要 JavaScript 文件 |
| css | string | ✗ | CSS 样式文件 |
| author | string | ✓ | 作者名称 |
| version | string | ✓ | 版本号（语义版本） |
| minimum_client_version | string | ✗ | 最小客户端版本 |
| dependencies | string[] | ✗ | 依赖的其他拓展 |
| homePage | string | ✗ | 项目主页 URL |

### 加载顺序指南

```javascript
// 推荐的加载顺序
const LOADING_ORDERS = {
    'core-dependencies': 10,        // 其他拓展的基础
    'assets': 15,                   // 资源加载
    'expressions': 20,              // 表情系统
    'memory': 25,                   // 内存系统
    'quick-reply': 30,              // 快速回复
    'tts': 35,                      // 文本转语音
    'custom-extension': 100,        // 自定义拓展（默认值）
    'ui-overlays': 200,             // UI 覆盖层
};
```

## 扩展 API

### 核心导入

```javascript
// 从 script.js 导入
import {
    eventSource,           // 事件系统
    event_types,          // 事件类型
    getRequestHeaders,    // 获取请求头
    saveSettings,         // 保存设置
    saveSettingsDebounced, // 防抖保存
    animation_duration,   // 动画持续时间
    CLIENT_VERSION       // 客户端版本
} from '../../../script.js';

// 从 extensions.js 导入
import {
    getContext,                    // 获取当前上下文
    renderExtensionTemplate,       // 同步渲染模板
    renderExtensionTemplateAsync,  // 异步渲染模板
    extensionNames,               // 所有拓展名称列表
    installExtension,             // 安装拓展
    deleteExtension,              // 删除拓展
} from '../../extensions.js';

// 从其他模块导入
import { t, translate } from '../../i18n.js';           // 国际化
import { DOMPurify } from '../../../lib.js';            // HTML 清理
import { accountStorage } from '../../util/AccountStorage.js'; // 账户存储
```

### 事件系统

拓展可以监听全局事件：

```javascript
import { eventSource, event_types } from '../../../script.js';

// 监听事件
eventSource.addEventListener(event_types.CHARACTER_LOADED, async (event) => {
    const context = getContext();
    console.log('Character loaded:', context.characterName);
});

// 触发自定义事件
eventSource.dispatchEvent(new CustomEvent('my-extension-event', {
    detail: { data: 'some value' }
}));
```

#### 常见事件类型

| 事件 | 触发时机 | 用途 |
|------|---------|------|
| CHARACTER_LOADED | 角色加载 | 初始化角色相关功能 |
| MESSAGE_SENT | 消息发送 | 处理用户消息 |
| MESSAGE_RECEIVED | 消息接收 | 处理 AI 响应 |
| CHAT_CHANGED | 聊天切换 | 切换聊天时的处理 |
| GROUP_CHAT_LOADED | 群聊加载 | 群聊特定逻辑 |

### 上下文 API

```javascript
import { getContext } from '../../extensions.js';

const context = getContext();

// 访问当前角色信息
console.log(context.characterName);
console.log(context.characterDescription);
console.log(context.characterId);

// 访问聊天信息
console.log(context.chatId);
console.log(context.chat);
console.log(context.currentCharacter);

// 访问消息
console.log(context.chat[0].mes);  // 第一条消息

// 保存元数据
await context.saveMetadata();

// 保存聊天
await context.saveChat();
```

### 模板渲染

```javascript
import { renderExtensionTemplateAsync } from '../../extensions.js';

// 异步渲染模板
const html = await renderExtensionTemplateAsync('my-extension', 'my-template', {
    data1: 'value1',
    data2: 'value2'
});

// 将渲染结果插入 DOM
$('#container').html(html);
```

对应的 HTML 模板文件 `my-template.html`：
```html
<div class="my-template">
    <p>{{data1}}</p>
    <p>{{data2}}</p>
</div>
```

### 国际化支持

```javascript
import { t, translate } from '../../i18n.js';

// 标记字符串以供翻译
const message = t`Hello, World!`;

// 翻译文本
const translatedText = translate('Hello', 'es'); // 西班牙语

// 在模板中使用 {{t 'key'}}
```

### 本地存储

```javascript
import { accountStorage } from '../../util/AccountStorage.js';

// 保存数据（特定于当前账户和角色）
accountStorage.setObject('my-extension', { key: 'value' });

// 读取数据
const data = accountStorage.getObject('my-extension');

// 删除数据
accountStorage.removeObject('my-extension');
```

## 开发工作流

### 1. 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/SillyTavern/SillyTavernchat.git
cd SillyTavernchat

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 2. 创建拓展

```bash
# 创建拓展目录
mkdir -p public/scripts/extensions/my-extension

# 创建基本文件
touch public/scripts/extensions/my-extension/manifest.json
touch public/scripts/extensions/my-extension/index.js
touch public/scripts/extensions/my-extension/style.css
```

### 3. 本地开发

在 `index.js` 中添加调试代码：

```javascript
const DEBUG_PREFIX = '[my-extension]';

export async function setup() {
    console.log(DEBUG_PREFIX, 'Initializing...');
    
    try {
        // 你的初始化代码
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Error:', error);
    }
}
```

### 4. 测试拓展

1. **启动应用**：`npm start`
2. **打开浏览器**：访问 `http://localhost:8000`
3. **打开开发者工具**：按 F12
4. **在控制台中查看日志**
5. **测试拓展功能**

### 5. 热重载开发

编辑拓展文件后，使用以下方式快速测试：

```javascript
// 在浏览器控制台中
location.reload();  // 刷新页面重新加载拓展
```

### 6. 调试技巧

```javascript
// 添加详细的日志记录
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[my-extension]', ...args);

export async function setup() {
    log('Setup started');
    
    try {
        const context = getContext();
        log('Context:', context);
    } catch (error) {
        console.error('[my-extension] Error:', error);
        console.trace();  // 打印堆栈跟踪
    }
}
```

## 高级主题

### 与斜杠命令集成

创建 `commands.js`：

```javascript
// public/scripts/extensions/my-extension/commands.js
import { SlashCommand } from '../../slash-commands.js';

export function registerCommands() {
    SlashCommand.create({
        name: 'mycommand',
        aliases: ['mc'],
        description: 'My custom command',
        args: true,
        usage: '/mycommand <argument>',
        callback: myCommandHandler
    });
}

async function myCommandHandler(args) {
    console.log('Command executed with args:', args);
    return { isQuote: false, isError: false };
}
```

在 `index.js` 中导入：

```javascript
import { registerCommands } from './commands.js';

export async function setup() {
    registerCommands();
}
```

### 拓展设置管理

```javascript
import { extension_settings } from '../../extensions.js';
import { saveSettings } from '../../../script.js';

// 初始化拓展设置
if (!extension_settings.my_extension) {
    extension_settings.my_extension = {
        enabled: true,
        option1: 'default',
        option2: 42
    };
}

// 修改设置
extension_settings.my_extension.option1 = 'new value';

// 保存设置
await saveSettings();
```

### 创建拓展 UI 菜单

```javascript
export async function setup() {
    // 创建菜单项
    const menuButton = $('<button>My Extension</button>')
        .attr('id', 'my-extension-menu-button')
        .click(() => showExtensionPanel());
    
    $('#extensionsMenu').append(menuButton);
}

async function showExtensionPanel() {
    const html = await renderExtensionTemplateAsync('my-extension', 'panel');
    
    const panel = new Popup(html, POPUP_TYPE.TEXT);
    panel.show();
}
```

### 处理异步操作和错误

```javascript
export async function setup() {
    try {
        // 加载数据
        const data = await fetchMyData();
        processData(data);
    } catch (error) {
        console.error('Failed to load data:', error);
        // 用户友好的错误处理
        showErrorMessage('Failed to initialize extension');
    }
}

async function fetchMyData() {
    const response = await fetch('/api/my-extension/data', {
        headers: getRequestHeaders()
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}
```

### 与其他拓展通信

```javascript
// 检查其他拓展是否已加载
import { extensionNames } from '../../extensions.js';

export async function setup() {
    if (extensionNames.includes('other-extension')) {
        // 访问其他拓展的导出内容
        const module = await import('./other-extension/index.js');
        module.someFunction();
    }
}
```

## 最佳实践

### 1. 命名约定

```javascript
// ✓ 好的
const MODULE_NAME = 'my-extension';
const DEBUG_PREFIX = '[my-extension]';
function onCharacterLoaded() { }

// ✗ 不好的
const moduleName = 'myExtension';
function onCharLoaded() { }
```

### 2. 错误处理

```javascript
// ✓ 好的：始终使用 try-catch
export async function setup() {
    try {
        await initializeExtension();
    } catch (error) {
        console.error(`${DEBUG_PREFIX} Failed to initialize:`, error);
    }
}

// ✗ 不好的：忽略错误
export async function setup() {
    await initializeExtension();
}
```

### 3. 内存管理

```javascript
// ✓ 好的：清理事件监听器
export async function cleanup() {
    eventSource.removeEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}

// ✗ 不好的：留下悬挂的监听器
// 没有清理函数
```

### 4. 性能优化

```javascript
// ✓ 好的：防抖操作
const debouncedSave = debounce(async () => {
    await saveSettings();
}, 1000);

// ✓ 好的：异步加载资源
export async function setup() {
    const html = await renderExtensionTemplateAsync('my-extension', 'panel');
    // 使用 html
}
```

### 5. 安全性

```javascript
// ✓ 好的：清理用户输入
import { DOMPurify } from '../../../lib.js';

const userInput = getUserInput();
const cleanHtml = DOMPurify.sanitize(userInput);
$('#container').html(cleanHtml);

// ✗ 不好的：直接使用用户输入
$('#container').html(userInput);  // XSS 安全问题！
```

### 6. 代码文档

```javascript
/**
 * 处理角色加载事件
 * @returns {Promise<void>}
 */
async function onCharacterLoaded() {
    // 实现
}

/**
 * 从 API 获取数据
 * @param {string} characterId - 角色 ID
 * @returns {Promise<Object>} 返回的数据对象
 * @throws {Error} 如果 API 请求失败
 */
async function fetchCharacterData(characterId) {
    // 实现
}
```

## 故障排除

### 常见问题

#### Q: 拓展没有加载？

1. **检查 manifest.json**：
   - 确认文件名正确
   - 验证 JSON 格式有效
   - 检查所有必需字段

2. **查看控制台日志**：
   ```javascript
   // 添加调试代码
   export async function setup() {
       console.log('Setup called');
   }
   ```

3. **验证文件路径**：
   ```
   public/scripts/extensions/my-extension/
   ├── manifest.json
   └── index.js
   ```

#### Q: JavaScript 错误？

1. **查看浏览器控制台**（F12）
2. **检查导入语句**是否正确
3. **验证依赖项**是否已安装

#### Q: 样式没有应用？

1. **检查 CSS 文件名**在 manifest.json 中
2. **检查 CSS 选择器**的特异性
3. **使用开发者工具**检查计算样式

#### Q: 拓展依赖项缺失？

```json
{
    "requires": ["module1", "module2"],
    "dependencies": ["other-extension"]
}
```

确保依赖的模块/拓展已启用。

### 调试工具

```javascript
// 在浏览器控制台中使用
// 列出所有活跃拓展
Object.keys(window.extensionTypes);

// 检查拓展设置
console.log(window.extension_settings);

// 获取当前上下文
console.log(window.getContext());
```

## 资源链接

- [项目主页](https://github.com/SillyTavern/SillyTavernchat)
- [插件开发指南](./PLUGIN_DEVELOPMENT.md)
- [前端扩展工作流](./FRONTEND_EXTENSION_WORKFLOW.md)
- [API 文档](./docs/API.md)

## 许可证

按项目许可证使用。

---

**最后更新**：2024 年
