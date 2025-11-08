# 前端拓展开发实践教程

本教程通过一个完整的示例拓展来教学如何开发前端拓展。示例拓展位于 `public/scripts/extensions/example-ui-extension/`。

## 目录

1. [教程概述](#教程概述)
2. [示例拓展介绍](#示例拓展介绍)
3. [项目结构](#项目结构)
4. [逐步解析](#逐步解析)
5. [常见任务](#常见任务)
6. [扩展示例](#扩展示例)
7. [问题解决](#问题解决)

## 教程概述

这个教程通过学习 `example-ui-extension` 来理解如何：

- ✓ 创建拓展的基本结构
- ✓ 添加菜单按钮
- ✓ 创建并渲染 UI 面板
- ✓ 处理用户交互
- ✓ 管理拓展设置
- ✓ 监听全局事件
- ✓ 显示通知消息
- ✓ 导出和导入数据

## 示例拓展介绍

### 功能特性

`example-ui-extension` 是一个功能完整的示例拓展，包含：

1. **菜单集成** - 在拓展菜单中添加按钮
2. **面板 UI** - 展示信息和设置的面板
3. **设置管理** - 保存、加载和重置设置
4. **数据导出/导入** - 导出设置为 JSON 文件
5. **事件监听** - 监听角色加载和消息事件
6. **调试模式** - 可选的调试日志
7. **通知系统** - 显示成功/错误消息

### 文件列表

```
example-ui-extension/
├── manifest.json    # 拓展元数据
├── index.js        # 主要拓展代码 (超详细注释)
├── panel.html      # 面板 UI 模板
└── style.css       # 面板样式
```

## 项目结构

### manifest.json

这是拓展的元数据文件，告诉应用如何加载拓展。

```json
{
    "display_name": "Example UI Extension",     // 显示名称
    "loading_order": 100,                        // 加载顺序
    "requires": [],                              // 依赖的 API 模块
    "optional": [],                              // 可选的 API 模块
    "js": "index.js",                           // 主要 JS 文件
    "css": "style.css",                         // 样式文件
    "author": "Development Team",               // 作者
    "version": "1.0.0",                         // 版本
    "minimum_client_version": "1.0.0",          // 最小客户端版本
    "homePage": "https://..."                   // 主页
}
```

**关键字段说明**：

| 字段 | 说明 | 示例 |
|------|------|------|
| display_name | 用户看到的拓展名称 | "My Extension" |
| loading_order | 加载顺序（小优先） | 100 |
| js | 主要 JS 文件路径 | "index.js" |
| css | 样式文件路径 | "style.css" |
| author | 拓展作者 | "Your Name" |
| version | 语义版本号 | "1.0.0" |

### index.js

主要拓展代码文件。

#### 导入部分

```javascript
import { eventSource, event_types, saveSettings } from '../../../script.js';
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../extensions.js';
```

这些导入提供了访问应用的核心功能，如事件系统、上下文管理和设置。

#### 导出部分

```javascript
export const MODULE_NAME = 'example-ui-extension';  // 必需：模块名称
export async function setup() { }                   // 必需：初始化函数
export async function cleanup() { }                 // 可选：清理函数
```

#### setup() 函数

这是拓展的初始化入口点。应用加载时会自动调用这个函数。

```javascript
export async function setup() {
    // 1. 初始化设置
    initializeSettings();
    
    // 2. 创建 UI
    createMenuButton();
    
    // 3. 附加事件监听器
    attachEventListeners();
}
```

#### 关键函数解析

**1. initializeSettings() - 初始化设置**

```javascript
function initializeSettings() {
    if (!extension_settings.example_ui_extension) {
        extension_settings.example_ui_extension = {
            enabled: true,
            theme: 'light',
            notifications: true,
            debug: false,
        };
    }
}
```

- 检查拓展设置是否存在
- 如果不存在，创建默认设置
- 这确保拓展总是有有效的配置

**2. createMenuButton() - 创建菜单按钮**

```javascript
function createMenuButton() {
    // 检查按钮是否已存在（避免重复）
    if ($('#example-ui-extension-menu-btn').length > 0) {
        return;
    }
    
    // 创建按钮 HTML
    const button = $(`
        <button id="example-ui-extension-menu-btn" 
                class="menu-item" 
                title="Example UI Extension">
            <i class="fa-solid fa-star"></i> Example
        </button>
    `);
    
    // 附加点击事件处理
    button.on('click', () => {
        showExtensionPanel();
    });
    
    // 添加到菜单
    $('#extensionsMenu').append(button);
}
```

- 创建一个按钮元素
- 附加点击事件处理
- 将按钮添加到 UI

**3. showExtensionPanel() - 显示面板**

```javascript
async function showExtensionPanel() {
    try {
        // 获取当前上下文（角色、聊天等）
        const context = getContext();
        
        // 准备模板数据
        const templateData = {
            title: t`Example UI Extension`,
            characterName: context.characterName || 'No Character',
            chatId: context.chatId || 'No Chat',
            settings: settings,
            timestamp: new Date().toLocaleString(),
        };
        
        // 异步渲染 HTML 模板
        const html = await renderExtensionTemplateAsync(
            'example-ui-extension',  // 拓展名
            'panel',                 // 模板文件 (panel.html)
            templateData             // 模板变量
        );
        
        // 创建弹窗并显示
        const popup = new Popup(html, POPUP_TYPE.TEXT);
        popup.show();
        
        // 附加面板事件处理
        attachPanelEventListeners();
        
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Failed to show panel:', error);
        alert('Failed to show extension panel');
    }
}
```

**4. attachPanelEventListeners() - 附加面板事件**

```javascript
function attachPanelEventListeners() {
    // 保存按钮
    $('#example-ui-extension-save-btn').on('click', saveExtensionSettings);
    
    // 重置按钮
    $('#example-ui-extension-reset-btn').on('click', resetExtensionSettings);
    
    // 主题下拉框
    $('#example-ui-extension-theme').on('change', function() {
        extension_settings.example_ui_extension.theme = $(this).val();
    });
    
    // 其他事件...
}
```

这将事件处理绑定到面板中的 UI 元素。

### panel.html

这是面板的 HTML 模板。

```html
<div class="example-ui-extension-panel">
    <!-- 标题 -->
    <div class="panel-header">
        <h2>{{title}}</h2>
        <button class="close-btn" onclick="...">...</button>
    </div>
    
    <!-- 内容 -->
    <div class="panel-content">
        <!-- 信息部分 -->
        <div class="info-section">
            <div class="info-item">
                <label>角色：</label>
                <span>{{characterName}}</span>
            </div>
        </div>
        
        <!-- 设置部分 -->
        <div class="settings-section">
            <select id="example-ui-extension-theme">...</select>
            <label>
                <input type="checkbox" id="example-ui-extension-notifications" />
                启用通知
            </label>
        </div>
        
        <!-- 操作部分 -->
        <div class="actions-section">
            <button id="example-ui-extension-save-btn">保存设置</button>
            <button id="example-ui-extension-reset-btn">重置设置</button>
        </div>
    </div>
</div>
```

**模板变量说明**：

- `{{title}}` - 面板标题
- `{{characterName}}` - 当前角色名
- `{{chatId}}` - 当前聊天 ID
- `{{timestamp}}` - 当前时间戳

### style.css

面板的样式文件。包含：

- 菜单按钮样式
- 面板容器样式
- 表单元素样式
- 按钮样式
- 通知样式
- 响应式布局
- 深色模式支持

## 逐步解析

### 第 1 步：创建基本骨架

这是最小的工作拓展：

```javascript
// public/scripts/extensions/my-extension/index.js

export const MODULE_NAME = 'my-extension';

export async function setup() {
    console.log('Extension initialized!');
}

export async function cleanup() {
    console.log('Extension cleaned up!');
}
```

```json
{
    "display_name": "My Extension",
    "loading_order": 100,
    "js": "index.js",
    "author": "Your Name",
    "version": "1.0.0"
}
```

**你会看到**：拓展在启动时初始化，控制台中输出日志。

### 第 2 步：添加菜单按钮

```javascript
export async function setup() {
    // 创建按钮
    const button = $('<button>My Extension</button>')
        .attr('id', 'my-extension-btn')
        .on('click', () => {
            alert('Button clicked!');
        });
    
    // 添加到菜单
    $('#extensionsMenu').append(button);
}
```

**你会看到**：一个新按钮出现在拓展菜单中，点击时显示警告。

### 第 3 步：显示面板

创建模板文件 `panel.html`：

```html
<div class="my-extension-panel">
    <h2>My Extension Panel</h2>
    <p>Hello {{name}}!</p>
</div>
```

更新 `index.js`：

```javascript
import { renderExtensionTemplateAsync } from '../../extensions.js';
import { Popup, POPUP_TYPE } from '../../popup.js';

async function showPanel() {
    const html = await renderExtensionTemplateAsync('my-extension', 'panel', {
        name: 'World'
    });
    
    const popup = new Popup(html, POPUP_TYPE.TEXT);
    popup.show();
}
```

**你会看到**：点击按钮时打开一个面板。

### 第 4 步：处理用户输入

在 `panel.html` 中添加表单：

```html
<div class="my-extension-panel">
    <h2>My Extension</h2>
    <input type="text" id="my-input" placeholder="Enter text" />
    <button id="my-button">Submit</button>
    <p id="result"></p>
</div>
```

在 `index.js` 中处理事件：

```javascript
async function showPanel() {
    // ...显示面板...
    
    // 附加事件处理
    $('#my-button').on('click', () => {
        const value = $('#my-input').val();
        $('#result').text(`You entered: ${value}`);
    });
}
```

**你会看到**：用户输入被处理并显示结果。

### 第 5 步：管理设置

```javascript
import { extension_settings, saveSettings } from '../../extensions.js';

export async function setup() {
    // 初始化设置
    if (!extension_settings.my_extension) {
        extension_settings.my_extension = {
            username: 'Guest',
            notifications: true
        };
    }
}

async function saveUserSettings() {
    // 更新设置
    extension_settings.my_extension.username = $('#username-input').val();
    
    // 保存到存储
    await saveSettings();
    
    alert('Settings saved!');
}
```

**你会看到**：设置被保存并在应用重启后恢复。

### 第 6 步：监听事件

```javascript
import { eventSource, event_types } from '../../../script.js';

export async function setup() {
    // 监听角色加载
    eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}

async function onCharacterLoaded() {
    const context = getContext();
    console.log('Character loaded:', context.characterName);
}

export async function cleanup() {
    // 移除事件监听
    eventSource.removeEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
}
```

**你会看到**：当加载角色时，控制台输出角色名称。

## 常见任务

### 任务 1：显示通知

```javascript
function showNotification(message, type = 'success') {
    const notification = $(`
        <div class="notification notification-${type}">
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 3000);
}

// 使用
showNotification('Operation successful!', 'success');
showNotification('An error occurred!', 'error');
```

### 任务 2：获取当前角色信息

```javascript
import { getContext } from '../../extensions.js';

function displayCharacterInfo() {
    const context = getContext();
    
    console.log('Character Name:', context.characterName);
    console.log('Character ID:', context.characterId);
    console.log('Character Description:', context.characterDescription);
    console.log('Chat ID:', context.chatId);
    console.log('Current Character Object:', context.currentCharacter);
}
```

### 任务 3：发送 API 请求

```javascript
import { getRequestHeaders } from '../../../script.js';

async function fetchData() {
    try {
        const response = await fetch('/api/my-extension/data', {
            method: 'GET',
            headers: getRequestHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch:', error);
        throw error;
    }
}

// 使用
async function loadData() {
    try {
        const data = await fetchData();
        console.log('Data:', data);
    } catch (error) {
        showNotification('Failed to load data', 'error');
    }
}
```

### 任务 4：本地数据存储

```javascript
import { accountStorage } from '../../util/AccountStorage.js';

// 保存数据
function saveData() {
    const myData = {
        setting1: 'value1',
        setting2: 'value2'
    };
    
    accountStorage.setObject('my-extension-data', myData);
}

// 读取数据
function loadData() {
    const myData = accountStorage.getObject('my-extension-data');
    return myData || { setting1: 'default1', setting2: 'default2' };
}

// 删除数据
function clearData() {
    accountStorage.removeObject('my-extension-data');
}
```

### 任务 5：处理切换角色

```javascript
import { eventSource, event_types } from '../../../script.js';
import { getContext } from '../../extensions.js';

export async function setup() {
    eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterChanged);
}

async function onCharacterChanged() {
    const context = getContext();
    
    // 重置拓展状态
    resetExtensionState();
    
    // 加载角色特定数据
    loadCharacterData(context.characterId);
    
    console.log('Character switched to:', context.characterName);
}

function resetExtensionState() {
    // 清除临时状态
    // 重置 UI
}

function loadCharacterData(characterId) {
    // 为新角色加载数据
}
```

## 扩展示例

### 扩展 1：添加斜杠命令

创建 `commands.js`：

```javascript
import { registerSlashCommand } from '../../slash-commands.js';

export function setupCommands() {
    registerSlashCommand({
        name: 'mycommand',
        aliases: ['mc'],
        description: 'My custom command',
        args: true,
        usage: '/mycommand <text>',
        callback: async (args) => {
            console.log('Command called with:', args);
            return { isQuote: false, isError: false };
        }
    });
}
```

在 `index.js` 中调用：

```javascript
import { setupCommands } from './commands.js';

export async function setup() {
    setupCommands();
}
```

### 扩展 2：添加多个面板

```javascript
async function showSettingsPanel() {
    const html = await renderExtensionTemplateAsync('my-extension', 'settings');
    const popup = new Popup(html, POPUP_TYPE.TEXT);
    popup.show();
}

async function showHelpPanel() {
    const html = await renderExtensionTemplateAsync('my-extension', 'help');
    const popup = new Popup(html, POPUP_TYPE.TEXT);
    popup.show();
}

function createMenuButton() {
    const settingsBtn = $('<button>Settings</button>')
        .on('click', showSettingsPanel);
    
    const helpBtn = $('<button>Help</button>')
        .on('click', showHelpPanel);
    
    $('#extensionsMenu').append(settingsBtn, helpBtn);
}
```

### 扩展 3：实时数据同步

```javascript
import { eventSource, event_types } from '../../../script.js';

let syncInterval;

export async function setup() {
    // 每 5 秒同步一次数据
    syncInterval = setInterval(syncData, 5000);
}

async function syncData() {
    try {
        const response = await fetch('/api/my-extension/sync', {
            headers: getRequestHeaders()
        });
        const data = await response.json();
        
        // 更新 UI
        updateUIWithData(data);
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

export async function cleanup() {
    clearInterval(syncInterval);
}
```

## 问题解决

### 问题 1：拓展没有出现在菜单中

**症状**：创建了拓展但菜单按钮没有显示。

**解决方案**：

1. 检查 manifest.json 文件是否有效 JSON
2. 验证文件路径和名称是否正确
3. 打开浏览器控制台检查错误
4. 刷新页面

```javascript
// 在控制台中调试
console.log(extensionNames);  // 检查拓展是否被加载
console.log(extension_settings);  // 检查设置
```

### 问题 2：事件处理器没有执行

**症状**：添加了事件监听但没有被触发。

**解决方案**：

1. 检查事件名称是否正确
2. 使用正确的事件常量
3. 验证监听器在适当的时刻被附加

```javascript
// ✓ 正确
eventSource.addEventListener(event_types.CHARACTER_LOADED, handler);

// ✗ 错误
eventSource.addEventListener('CHARACTER_LOADED', handler);
```

### 问题 3：UI 样式没有应用

**症状**：CSS 文件被加载但样式没有显示。

**解决方案**：

1. 检查 CSS 选择器的特异性
2. 验证 CSS 文件在 manifest.json 中被指定
3. 使用开发者工具检查计算样式
4. 检查是否被其他样式覆盖

```css
/* 增加特异性 */
.example-ui-extension-panel .my-element {
    color: red !important;  /* 最后的手段 */
}
```

### 问题 4：模板变量没有被替换

**症状**：HTML 模板中的 {{variable}} 没有被替换。

**解决方案**：

1. 检查模板文件名是否正确
2. 验证传递的数据对象包含所需的键
3. 检查是否使用了错误的模板渲染函数

```javascript
// ✓ 正确：异步渲染
const html = await renderExtensionTemplateAsync('my-ext', 'template', data);

// ✗ 错误：同步渲染（已弃用）
const html = renderExtensionTemplate('my-ext', 'template', data);
```

### 问题 5：设置没有被保存

**症状**：修改了设置但刷新后丢失。

**解决方案**：

1. 确保调用了 `saveSettings()`
2. 检查拓展设置对象的结构
3. 验证没有错误发生

```javascript
// ✓ 正确
async function saveSetting() {
    extension_settings.my_ext.setting = 'value';
    await saveSettings();  // 必需！
}

// ✗ 错误
extension_settings.my_ext.setting = 'value';
// 忘记了 await saveSettings()
```

### 问题 6：内存泄漏

**症状**：应用变得缓慢，使用过程中内存持续增加。

**解决方案**：

1. 在 cleanup() 中移除所有事件监听器
2. 清除定时器
3. 清理大型对象引用

```javascript
// ✓ 正确的清理
export async function cleanup() {
    eventSource.removeEventListener(event_types.CHARACTER_LOADED, handler);
    clearInterval(syncInterval);
    cache.clear();
}
```

## 更多资源

- **完整指南**：[FRONTEND_EXTENSION_GUIDE.md](./FRONTEND_EXTENSION_GUIDE.md)
- **工作流程**：[FRONTEND_EXTENSION_WORKFLOW.md](./FRONTEND_EXTENSION_WORKFLOW.md)
- **快速参考**：[FRONTEND_EXTENSION_QUICK_REFERENCE.md](./FRONTEND_EXTENSION_QUICK_REFERENCE.md)
- **示例代码**：`public/scripts/extensions/example-ui-extension/`

---

**最后更新**：2024 年
**难度等级**：初级 → 中级
