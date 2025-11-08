/**
 * Example UI Extension
 * 
 * 这是一个简单的示例拓展，展示了如何：
 * 1. 创建拓展菜单项
 * 2. 渲染 HTML 模板
 * 3. 处理用户交互
 * 4. 管理拓展设置
 * 5. 监听全局事件
 */

import { eventSource, event_types, getRequestHeaders, saveSettings } from '../../../script.js';
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../extensions.js';
import { Popup, POPUP_TYPE } from '../../popup.js';
import { t } from '../../i18n.js';
import { accountStorage } from '../../util/AccountStorage.js';

export const MODULE_NAME = 'example-ui-extension';
const DEBUG_PREFIX = `[${MODULE_NAME}]`;

/**
 * 拓展初始化
 */
export async function setup() {
    console.log(DEBUG_PREFIX, 'Setting up...');
    
    try {
        // 初始化设置
        initializeSettings();
        
        // 创建菜单 UI
        createMenuButton();
        
        // 附加事件监听器
        attachEventListeners();
        
        console.log(DEBUG_PREFIX, 'Setup completed');
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Setup failed:', error);
    }
}

/**
 * 初始化拓展设置
 */
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

/**
 * 创建菜单按钮
 */
function createMenuButton() {
    // 检查按钮是否已存在
    if ($('#example-ui-extension-menu-btn').length > 0) {
        return;
    }
    
    const button = $(`
        <button id="example-ui-extension-menu-btn" class="menu-item" title="Example UI Extension">
            <i class="fa-solid fa-star"></i> Example
        </button>
    `);
    
    button.on('click', () => {
        showExtensionPanel();
    });
    
    $('#extensionsMenu').append(button);
    console.log(DEBUG_PREFIX, 'Menu button created');
}

/**
 * 显示拓展面板
 */
async function showExtensionPanel() {
    console.log(DEBUG_PREFIX, 'Showing extension panel');
    
    try {
        const context = getContext();
        const settings = extension_settings.example_ui_extension;
        
        // 获取模板数据
        const templateData = {
            title: t`Example UI Extension`,
            characterName: context.characterName || 'No Character',
            chatId: context.chatId || 'No Chat',
            settings: settings,
            timestamp: new Date().toLocaleString(),
        };
        
        // 渲染模板
        const html = await renderExtensionTemplateAsync('example-ui-extension', 'panel', templateData);
        
        // 创建并显示弹窗
        const popup = new Popup(html, POPUP_TYPE.TEXT);
        popup.show();
        
        // 附加事件处理
        attachPanelEventListeners();
        
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Failed to show panel:', error);
        alert('Failed to show extension panel');
    }
}

/**
 * 附加事件监听器
 */
function attachEventListeners() {
    // 监听角色加载事件
    eventSource.addEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
    
    // 监听消息发送事件
    eventSource.addEventListener(event_types.MESSAGE_SENT, onMessageSent);
    
    // 监听消息接收事件
    eventSource.addEventListener(event_types.MESSAGE_RECEIVED, onMessageReceived);
    
    console.log(DEBUG_PREFIX, 'Event listeners attached');
}

/**
 * 附加面板事件监听器
 */
function attachPanelEventListeners() {
    // 保存设置按钮
    $('#example-ui-extension-save-btn').on('click', saveExtensionSettings);
    
    // 重置按钮
    $('#example-ui-extension-reset-btn').on('click', resetExtensionSettings);
    
    // 主题选择
    $('#example-ui-extension-theme').on('change', function() {
        extension_settings.example_ui_extension.theme = $(this).val();
    });
    
    // 通知复选框
    $('#example-ui-extension-notifications').on('change', function() {
        extension_settings.example_ui_extension.notifications = $(this).is(':checked');
    });
    
    // 调试复选框
    $('#example-ui-extension-debug').on('change', function() {
        extension_settings.example_ui_extension.debug = $(this).is(':checked');
        console.log(DEBUG_PREFIX, 'Debug mode:', extension_settings.example_ui_extension.debug);
    });
    
    // 导出数据按钮
    $('#example-ui-extension-export-btn').on('click', exportExtensionData);
    
    // 加载保存的数据按钮
    $('#example-ui-extension-load-btn').on('click', loadSavedData);
    
    console.log(DEBUG_PREFIX, 'Panel event listeners attached');
}

/**
 * 保存拓展设置
 */
async function saveExtensionSettings() {
    console.log(DEBUG_PREFIX, 'Saving settings...');
    
    try {
        const settings = extension_settings.example_ui_extension;
        
        // 保存到账户存储
        accountStorage.setObject('example_ui_extension_settings', settings);
        
        // 保存全局设置
        await saveSettings();
        
        // 显示成功消息
        showNotification('Settings saved successfully', 'success');
        
        console.log(DEBUG_PREFIX, 'Settings saved:', settings);
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Failed to save settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

/**
 * 重置拓展设置
 */
function resetExtensionSettings() {
    console.log(DEBUG_PREFIX, 'Resetting settings...');
    
    const confirmed = confirm('Are you sure you want to reset all settings?');
    
    if (confirmed) {
        extension_settings.example_ui_extension = {
            enabled: true,
            theme: 'light',
            notifications: true,
            debug: false,
        };
        
        // 更新 UI
        $('#example-ui-extension-theme').val('light');
        $('#example-ui-extension-notifications').prop('checked', true);
        $('#example-ui-extension-debug').prop('checked', false);
        
        showNotification('Settings reset to default', 'success');
    }
}

/**
 * 导出拓展数据
 */
function exportExtensionData() {
    console.log(DEBUG_PREFIX, 'Exporting data...');
    
    try {
        const context = getContext();
        const settings = extension_settings.example_ui_extension;
        
        const data = {
            extension: MODULE_NAME,
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            settings: settings,
            context: {
                characterName: context.characterName,
                characterId: context.characterId,
                chatId: context.chatId,
            },
        };
        
        // 创建 JSON 字符串
        const jsonString = JSON.stringify(data, null, 2);
        
        // 创建 Blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${MODULE_NAME}-export-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
        console.log(DEBUG_PREFIX, 'Data exported:', data);
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Failed to export data:', error);
        showNotification('Failed to export data', 'error');
    }
}

/**
 * 加载保存的数据
 */
function loadSavedData() {
    console.log(DEBUG_PREFIX, 'Loading saved data...');
    
    try {
        const savedSettings = accountStorage.getObject('example_ui_extension_settings');
        
        if (savedSettings) {
            extension_settings.example_ui_extension = savedSettings;
            
            // 更新 UI
            $('#example-ui-extension-theme').val(savedSettings.theme);
            $('#example-ui-extension-notifications').prop('checked', savedSettings.notifications);
            $('#example-ui-extension-debug').prop('checked', savedSettings.debug);
            
            showNotification('Data loaded successfully', 'success');
            console.log(DEBUG_PREFIX, 'Data loaded:', savedSettings);
        } else {
            showNotification('No saved data found', 'info');
        }
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Failed to load data:', error);
        showNotification('Failed to load data', 'error');
    }
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    const notificationClass = `notification-${type}`;
    
    const notification = $(`
        <div class="example-ui-extension-notification ${notificationClass}">
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    // 3 秒后自动隐藏
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 3000);
    
    console.log(DEBUG_PREFIX, `Notification [${type}]:`, message);
}

/**
 * 角色加载事件处理
 */
async function onCharacterLoaded(event) {
    if (!extension_settings.example_ui_extension.debug) return;
    
    try {
        const context = getContext();
        console.log(DEBUG_PREFIX, 'Character loaded:', {
            name: context.characterName,
            id: context.characterId,
            description: context.characterDescription?.substring(0, 50),
        });
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Error in character load handler:', error);
    }
}

/**
 * 消息发送事件处理
 */
async function onMessageSent(event) {
    if (!extension_settings.example_ui_extension.debug) return;
    
    try {
        console.log(DEBUG_PREFIX, 'Message sent:', event.detail);
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Error in message sent handler:', error);
    }
}

/**
 * 消息接收事件处理
 */
async function onMessageReceived(event) {
    if (!extension_settings.example_ui_extension.debug) return;
    
    try {
        console.log(DEBUG_PREFIX, 'Message received:', event.detail);
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Error in message received handler:', error);
    }
}

/**
 * 拓展清理
 */
export async function cleanup() {
    console.log(DEBUG_PREFIX, 'Cleaning up...');
    
    try {
        // 移除事件监听器
        eventSource.removeEventListener(event_types.CHARACTER_LOADED, onCharacterLoaded);
        eventSource.removeEventListener(event_types.MESSAGE_SENT, onMessageSent);
        eventSource.removeEventListener(event_types.MESSAGE_RECEIVED, onMessageReceived);
        
        // 移除 UI 元素
        $('#example-ui-extension-menu-btn').remove();
        
        console.log(DEBUG_PREFIX, 'Cleanup completed');
    } catch (error) {
        console.error(DEBUG_PREFIX, 'Cleanup failed:', error);
    }
}
