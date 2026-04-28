import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import {
    characters,
    chat,
    default_avatar,
    default_user_avatar,
    getCurrentChatId,
    messageFormatting,
    name1,
    name2,
    saveSettingsDebounced,
    system_avatar,
    systemUserName,
    this_chid,
} from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { groups, selected_group } from '../../../group-chats.js';
import { user_avatar } from '../../../personas.js';

const MODULE_NAME = 'html_export';
const EXTENSION_NAME = 'SillyTavern-HTML-Export';
const BUTTON_ID = 'html_export_extension_button';
const TXT_BUTTON_ID = 'html_export_extension_txt_button';
const SETTINGS_CONTAINER_ID = 'html_export_settings';
const PROGRESS_OVERLAY_ID = 'html_export_progress_overlay';
const EXPORT_BATCH_SIZE = 50;

const STYLE_PRESETS = Object.freeze({
    dark: {
        label: '深色簡潔',
        style: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '16px',
            lineHeight: '1.65',
            pageBackground: '#111111',
            pageText: '#f0f0f0',
            contentMaxWidth: '1100px',
            messageGap: '12px',
            userBackground: 'rgba(70, 120, 210, 0.28)',
            userText: '#f7f7f7',
            characterBackground: 'rgba(255, 255, 255, 0.10)',
            characterText: '#f0f0f0',
            systemBackground: 'rgba(180, 180, 180, 0.16)',
            systemText: '#eeeeee',
            borderColor: 'rgba(255, 255, 255, 0.16)',
            borderRadius: '8px',
            avatarSize: '48px',
            quoteBackground: 'rgba(255, 255, 255, 0.85)',
            quoteText: '#4a3428',
            quoteBlockBackground: 'rgba(255, 255, 255, 0.10)',
            quoteBlockText: '#f0f0f0',
            quoteBlockBorderColor: '#d79a50',
            quoteBlockBorderWidth: '4px',
            codeBackground: 'rgba(0, 0, 0, 0.32)',
        },
    },
    light: {
        label: '淺色簡潔',
        style: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '16px',
            lineHeight: '1.65',
            pageBackground: '#f4f4f4',
            pageText: '#202020',
            contentMaxWidth: '1100px',
            messageGap: '12px',
            userBackground: '#dbeafe',
            userText: '#111827',
            characterBackground: '#ffffff',
            characterText: '#202020',
            systemBackground: '#eeeeee',
            systemText: '#303030',
            borderColor: '#d0d0d0',
            borderRadius: '8px',
            avatarSize: '48px',
            quoteBackground: '#f6eadf',
            quoteText: '#5a3826',
            quoteBlockBackground: '#fff7ec',
            quoteBlockText: '#2f241d',
            quoteBlockBorderColor: '#b87333',
            quoteBlockBorderWidth: '4px',
            codeBackground: '#eeeeee',
        },
    },
    bubble: {
        label: '氣泡聊天',
        style: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '16px',
            lineHeight: '1.6',
            pageBackground: '#16181d',
            pageText: '#f2f2f2',
            contentMaxWidth: '980px',
            messageGap: '14px',
            userBackground: '#28547a',
            userText: '#ffffff',
            characterBackground: '#2e3138',
            characterText: '#f2f2f2',
            systemBackground: '#3a3a3a',
            systemText: '#f0f0f0',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            avatarSize: '44px',
            quoteBackground: 'rgba(255, 255, 255, 0.9)',
            quoteText: '#4a3428',
            quoteBlockBackground: 'rgba(255, 255, 255, 0.12)',
            quoteBlockText: '#f2f2f2',
            quoteBlockBorderColor: '#7cc0ff',
            quoteBlockBorderWidth: '4px',
            codeBackground: 'rgba(0, 0, 0, 0.35)',
        },
    },
    document: {
        label: '文件閱讀',
        style: {
            fontFamily: 'Georgia, "Noto Serif TC", serif',
            fontSize: '17px',
            lineHeight: '1.9',
            pageBackground: '#f7f3ea',
            pageText: '#27211c',
            contentMaxWidth: '880px',
            messageGap: '18px',
            userBackground: 'transparent',
            userText: '#27211c',
            characterBackground: 'transparent',
            characterText: '#27211c',
            systemBackground: '#eee5d4',
            systemText: '#41382e',
            borderColor: 'transparent',
            borderRadius: '0',
            avatarSize: '0px',
            quoteBackground: '#fff7ec',
            quoteText: '#67401f',
            quoteBlockBackground: '#efe4d1',
            quoteBlockText: '#342820',
            quoteBlockBorderColor: '#9a6b42',
            quoteBlockBorderWidth: '4px',
            codeBackground: '#eee5d4',
        },
    },
    card: {
        label: '角色卡風格',
        style: {
            fontFamily: '"Noto Sans TC", system-ui, sans-serif',
            fontSize: '16px',
            lineHeight: '1.75',
            pageBackground: '#101014',
            pageText: '#f4f0ea',
            contentMaxWidth: '1000px',
            messageGap: '16px',
            userBackground: '#263a52',
            userText: '#f8fbff',
            characterBackground: '#302923',
            characterText: '#fff8ed',
            systemBackground: '#3a3642',
            systemText: '#f6f1ff',
            borderColor: 'rgba(255, 220, 180, 0.22)',
            borderRadius: '8px',
            avatarSize: '52px',
            quoteBackground: '#fff1df',
            quoteText: '#704522',
            quoteBlockBackground: '#3a3028',
            quoteBlockText: '#fff8ed',
            quoteBlockBorderColor: '#d2a46f',
            quoteBlockBorderWidth: '4px',
            codeBackground: '#191719',
        },
    },
});

const STYLE_FIELDS = Object.freeze([
    ['fontFamily', '字體'],
    ['fontSize', '字體大小'],
    ['lineHeight', '行高'],
    ['pageBackground', '頁面背景'],
    ['pageText', '頁面文字'],
    ['contentMaxWidth', '內容最大寬度'],
    ['messageGap', '訊息間距'],
    ['userBackground', '使用者氣泡背景'],
    ['userText', '使用者文字'],
    ['characterBackground', '角色氣泡背景'],
    ['characterText', '角色文字'],
    ['systemBackground', '系統訊息背景'],
    ['systemText', '系統訊息文字'],
    ['borderColor', '邊框顏色'],
    ['borderRadius', '訊息圓角'],
    ['avatarSize', '頭像大小'],
    ['quoteBackground', '引號背景'],
    ['quoteText', '引號文字'],
    ['quoteBlockBackground', '引用區塊背景'],
    ['quoteBlockText', '引用區塊文字'],
    ['quoteBlockBorderColor', '引用左線顏色'],
    ['quoteBlockBorderWidth', '引用左線寬度'],
    ['codeBackground', '程式碼背景'],
]);

const COLOR_STYLE_KEYS = Object.freeze(new Set([
    'pageBackground',
    'pageText',
    'userBackground',
    'userText',
    'characterBackground',
    'characterText',
    'systemBackground',
    'systemText',
    'borderColor',
    'quoteBackground',
    'quoteText',
    'quoteBlockBackground',
    'quoteBlockText',
    'quoteBlockBorderColor',
    'codeBackground',
]));

const NON_COLOR_STYLE_FIELDS = Object.freeze(STYLE_FIELDS.filter(([key]) => !COLOR_STYLE_KEYS.has(key)));
const COLOR_STYLE_FIELDS = Object.freeze(STYLE_FIELDS.filter(([key]) => COLOR_STYLE_KEYS.has(key)));

const DEFAULT_EXPORT_PROFILE_KEY = 'dark';

const EXPORT_PROFILE_SETTING_KEYS = Object.freeze([
    'exportMode',
    'alignment',
    'showAvatars',
    'embedMessageImages',
    'embedExternalImages',
    'includeBackgroundImage',
    'maxEmbeddedAssetSizeMb',
    'lazyRenderMessages',
    'lazyRenderBatchSize',
    'paginateMessages',
    'messagesPerPage',
    'applyCurrentTheme',
    'customCss',
    'style',
]);

function buildBuiltinExportProfileSettings(styleKey, overrides = {}) {
    return {
        exportMode: 'complete',
        alignment: 'left',
        showAvatars: true,
        embedMessageImages: false,
        embedExternalImages: false,
        includeBackgroundImage: false,
        maxEmbeddedAssetSizeMb: 8,
        lazyRenderMessages: true,
        lazyRenderBatchSize: 80,
        paginateMessages: true,
        messagesPerPage: 200,
        applyCurrentTheme: false,
        customCss: '',
        style: structuredClone(STYLE_PRESETS[styleKey]?.style ?? STYLE_PRESETS.dark.style),
        ...structuredClone(overrides),
    };
}

const BUILTIN_EXPORT_PROFILES = Object.freeze({
    dark: {
        label: '深色簡潔',
        settings: buildBuiltinExportProfileSettings('dark'),
    },
    light: {
        label: '淺色簡潔',
        settings: buildBuiltinExportProfileSettings('light'),
    },
    bubble: {
        label: '氣泡聊天',
        settings: buildBuiltinExportProfileSettings('bubble'),
    },
    document: {
        label: '文件閱讀',
        settings: buildBuiltinExportProfileSettings('document'),
    },
    card: {
        label: '普通ST樣式',
        settings: buildBuiltinExportProfileSettings('card', {
            includeBackgroundImage: true,
            applyCurrentTheme: true,
        }),
    },
    special: {
        label: '特殊ST樣式',
        settings: buildBuiltinExportProfileSettings('card', {
            exportMode: 'visibleDom',
            includeBackgroundImage: true,
            applyCurrentTheme: true,
        }),
    },
});

const defaultSettings = Object.freeze({
    exportProfile: DEFAULT_EXPORT_PROFILE_KEY,
    exportProfiles: {},
    exportMode: 'complete',
    stylePreset: 'dark',
    alignment: 'left',
    includeSystemMessages: true,
    includeHiddenMessages: true,
    includeReasoning: true,
    includeTimestamps: true,
    showMetadata: true,
    showAvatars: true,
    embedAvatars: true,
    embedMessageImages: false,
    embedExternalImages: false,
    includeBackgroundImage: false,
    maxEmbeddedAssetSizeMb: 8,
    lazyRenderMessages: true,
    lazyRenderBatchSize: 80,
    paginateMessages: true,
    messagesPerPage: 200,
    applyCurrentTheme: false,
    includeVisibleDomExtensionCss: true,
    customCss: '',
    styleOverrides: {},
    style: structuredClone(STYLE_PRESETS.dark.style),
});

const assetDataUrlCache = new Map();
let activeExportController = null;

function cloneDefaultSettings() {
    return structuredClone(defaultSettings);
}

function isBuiltinExportProfile(profileKey) {
    return Object.prototype.hasOwnProperty.call(BUILTIN_EXPORT_PROFILES, profileKey);
}

function normalizeExportProfileKey(profileKey) {
    const text = String(profileKey ?? '').trim();
    return text || DEFAULT_EXPORT_PROFILE_KEY;
}

function getProfileFallbackStyle(profileKey) {
    if (isBuiltinExportProfile(profileKey)) {
        return BUILTIN_EXPORT_PROFILES[profileKey].settings.style;
    }

    return STYLE_PRESETS.dark.style;
}

function normalizeExportProfileSettings(profileKey, profileSettings = {}) {
    const fallbackStyle = getProfileFallbackStyle(profileKey);
    const fallbackSettings = BUILTIN_EXPORT_PROFILES[profileKey]?.settings
        ?? BUILTIN_EXPORT_PROFILES[DEFAULT_EXPORT_PROFILE_KEY].settings;
    const sourceSettings = {
        ...structuredClone(fallbackSettings),
        ...(profileSettings && typeof profileSettings === 'object' ? structuredClone(profileSettings) : {}),
    };
    const normalized = {};

    for (const key of EXPORT_PROFILE_SETTING_KEYS) {
        if (key === 'style') {
            normalized.style = normalizeStyleForProfile(profileKey, sourceSettings.style);
        } else if (sourceSettings[key] !== undefined) {
            normalized[key] = structuredClone(sourceSettings[key]);
        }
    }

    if (!normalized.exportMode || !['complete', 'visibleDom'].includes(normalized.exportMode)) {
        normalized.exportMode = 'complete';
    }

    normalized.alignment = normalized.alignment === 'split' ? 'split' : 'left';
    normalized.showAvatars = normalized.showAvatars !== false;
    normalized.embedMessageImages = normalized.embedMessageImages !== false;
    normalized.embedExternalImages = !!normalized.embedExternalImages;
    normalized.includeBackgroundImage = normalized.includeBackgroundImage !== false;
    normalized.maxEmbeddedAssetSizeMb = Math.max(0, Number(normalized.maxEmbeddedAssetSizeMb) || 0);
    normalized.lazyRenderMessages = true;
    normalized.lazyRenderBatchSize = Math.max(1, Number(normalized.lazyRenderBatchSize) || 80);
    normalized.paginateMessages = !!normalized.paginateMessages;
    normalized.messagesPerPage = Math.max(1, Number(normalized.messagesPerPage) || 200);
    normalized.applyCurrentTheme = !!normalized.applyCurrentTheme;
    normalized.customCss = String(normalized.customCss ?? '');
    normalized.style = {
        ...structuredClone(fallbackStyle),
        ...normalized.style,
    };

    return normalized;
}

function createExportProfileSnapshot(settings = getSettings()) {
    readStyleFieldsIntoSettings(settings);

    const snapshot = {};
    for (const key of EXPORT_PROFILE_SETTING_KEYS) {
        if (key === 'style') {
            snapshot.style = normalizeStyleForProfile(settings.exportProfile, settings.style);
        } else {
            snapshot[key] = structuredClone(settings[key]);
        }
    }

    snapshot.lazyRenderMessages = true;
    return normalizeExportProfileSettings(settings.exportProfile, snapshot);
}

function getSavedExportProfile(settings, profileKey) {
    const profiles = settings.exportProfiles && typeof settings.exportProfiles === 'object'
        ? settings.exportProfiles
        : {};

    return profiles[profileKey] && typeof profiles[profileKey] === 'object'
        ? profiles[profileKey]
        : null;
}

function getExportProfileLabel(settings, profileKey) {
    const savedProfile = getSavedExportProfile(settings, profileKey);
    if (savedProfile?.label) {
        return String(savedProfile.label);
    }

    return BUILTIN_EXPORT_PROFILES[profileKey]?.label ?? profileKey;
}

function getExportProfileSettings(settings, profileKey) {
    const savedProfile = getSavedExportProfile(settings, profileKey);
    const builtinSettings = BUILTIN_EXPORT_PROFILES[profileKey]?.settings ?? {};

    return normalizeExportProfileSettings(profileKey, {
        ...structuredClone(builtinSettings),
        ...(savedProfile?.settings && typeof savedProfile.settings === 'object'
            ? structuredClone(savedProfile.settings)
            : {}),
    });
}

function getExportProfileEntries(settings = getSettings()) {
    const builtinEntries = Object.entries(BUILTIN_EXPORT_PROFILES).map(([value, profile]) => ({
        value,
        label: profile.label,
        builtin: true,
    }));
    const customEntries = Object.entries(settings.exportProfiles ?? {})
        .filter(([value]) => !isBuiltinExportProfile(value))
        .map(([value, profile]) => ({
            value,
            label: profile?.label ? String(profile.label) : value,
            builtin: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));

    return [...builtinEntries, ...customEntries];
}

function applyExportProfile(settings, profileKey) {
    const selectedProfile = getExportProfileEntries(settings).some(entry => entry.value === profileKey)
        ? profileKey
        : DEFAULT_EXPORT_PROFILE_KEY;
    const profileSettings = getExportProfileSettings(settings, selectedProfile);

    for (const [key, value] of Object.entries(profileSettings)) {
        settings[key] = structuredClone(value);
    }

    settings.exportProfile = selectedProfile;
    settings.stylePreset = STYLE_PRESETS[selectedProfile] ? selectedProfile : 'dark';
    settings.style = normalizeStyleForProfile(selectedProfile, settings.style);
}

function saveCurrentExportProfile(settings = getSettings(), label = null) {
    const profileKey = normalizeExportProfileKey(settings.exportProfile);
    const profileLabel = String(label ?? getExportProfileLabel(settings, profileKey) ?? profileKey).trim() || profileKey;

    if (!settings.exportProfiles || typeof settings.exportProfiles !== 'object') {
        settings.exportProfiles = {};
    }

    settings.exportProfiles[profileKey] = {
        label: profileLabel,
        settings: createExportProfileSnapshot(settings),
    };
}

function createProfileKeyFromLabel(label, profiles = {}) {
    const base = String(label ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        || 'profile';
    let key = base;
    let index = 2;

    while (isBuiltinExportProfile(key) || profiles[key]) {
        key = `${base}-${index}`;
        index += 1;
    }

    return key;
}

function saveCurrentExportProfileAs(settings = getSettings(), label) {
    const profileLabel = String(label ?? '').trim();
    if (!profileLabel) {
        return null;
    }

    if (!settings.exportProfiles || typeof settings.exportProfiles !== 'object') {
        settings.exportProfiles = {};
    }

    const profileKey = createProfileKeyFromLabel(profileLabel, settings.exportProfiles);
    settings.exportProfile = profileKey;
    settings.exportProfiles[profileKey] = {
        label: profileLabel,
        settings: createExportProfileSnapshot(settings),
    };

    return profileKey;
}

function resetCurrentExportProfile(settings = getSettings()) {
    const profileKey = normalizeExportProfileKey(settings.exportProfile);

    if (isBuiltinExportProfile(profileKey)) {
        delete settings.exportProfiles?.[profileKey];
    }

    applyExportProfile(settings, profileKey);
}

function deleteCurrentExportProfile(settings = getSettings()) {
    const profileKey = normalizeExportProfileKey(settings.exportProfile);

    if (isBuiltinExportProfile(profileKey)) {
        return false;
    }

    delete settings.exportProfiles?.[profileKey];
    applyExportProfile(settings, DEFAULT_EXPORT_PROFILE_KEY);
    return true;
}

function getSettings() {
    if (extension_settings[MODULE_NAME] === undefined) {
        extension_settings[MODULE_NAME] = cloneDefaultSettings();
    }

    const settings = extension_settings[MODULE_NAME];
    const hadExportProfile = settings.exportProfile !== undefined;

    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined) {
            settings[key] = structuredClone(value);
        }
    }

    if (!settings.exportProfiles || typeof settings.exportProfiles !== 'object') {
        settings.exportProfiles = {};
    }

    if (!hadExportProfile && STYLE_PRESETS[settings.stylePreset]) {
        settings.exportProfile = settings.stylePreset;
    }

    if (!settings.styleOverrides || typeof settings.styleOverrides !== 'object') {
        settings.styleOverrides = {};
    }

    for (const [presetKey, savedStyle] of Object.entries(settings.styleOverrides)) {
        if (!STYLE_PRESETS[presetKey] || settings.exportProfiles[presetKey] || !savedStyle || typeof savedStyle !== 'object') {
            continue;
        }

        settings.exportProfiles[presetKey] = {
            label: BUILTIN_EXPORT_PROFILES[presetKey]?.label ?? STYLE_PRESETS[presetKey].label,
            settings: normalizeExportProfileSettings(presetKey, {
                ...getExportProfileSettings(settings, presetKey),
                style: savedStyle,
            }),
        };
    }

    if (!getExportProfileEntries(settings).some(entry => entry.value === settings.exportProfile)) {
        settings.exportProfile = DEFAULT_EXPORT_PROFILE_KEY;
    }

    if (!settings.style || typeof settings.style !== 'object') {
        settings.style = getExportProfileSettings(settings, settings.exportProfile).style;
    }

    settings.style = normalizeStyleForProfile(settings.exportProfile, settings.style);

    return settings;
}

function getExportOptions() {
    const settings = getSettings();

    return {
        ...settings,
        includeSystemMessages: true,
        includeHiddenMessages: true,
        includeReasoning: true,
        includeTimestamps: true,
        showMetadata: true,
        embedAvatars: true,
        lazyRenderMessages: true,
        includeVisibleDomExtensionCss: true,
        style: {
            ...getProfileFallbackStyle(settings.exportProfile),
            ...settings.style,
        },
    };
}

function normalizeStyleForProfile(profileKey, style = {}) {
    const presetStyle = getProfileFallbackStyle(profileKey);

    return {
        ...structuredClone(presetStyle),
        ...(style && typeof style === 'object' ? structuredClone(style) : {}),
    };
}

function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    saveSettingsDebounced();
}

function updateStyleSetting(key, value) {
    const settings = getSettings();
    settings.style[key] = value;
    saveSettingsDebounced();
}

function isZeroCssSize(value) {
    return /^0(?:px|rem|em|%)?$/.test(String(value ?? '').trim());
}

function shouldRenderAvatars(options) {
    return !!options.showAvatars && !isZeroCssSize(options.style?.avatarSize);
}

function createAssetRegistry() {
    return {
        urlToId: new Map(),
        entries: [],
    };
}

function registerEmbeddedAsset(registry, sourceUrl, dataUrl) {
    if (!registry || !String(dataUrl ?? '').startsWith('data:')) {
        return null;
    }

    const key = toExportUrl(sourceUrl);
    const existingId = registry.urlToId.get(key);
    if (existingId) {
        return existingId;
    }

    const id = `asset-${registry.entries.length + 1}`;
    registry.urlToId.set(key, id);
    registry.entries.push([id, dataUrl]);
    return id;
}

function buildAssetRegistryHtml(registry) {
    if (!registry?.entries?.length) {
        return '';
    }

    const assetsJson = JSON.stringify(Object.fromEntries(registry.entries)).replace(/</g, '\\u003c');

    return `
    <script type="application/json" id="html-export-assets">${assetsJson}</script>
    <script>
        (() => {
            const assetsElement = document.getElementById('html-export-assets');
            if (!assetsElement) return;

            const assets = JSON.parse(assetsElement.textContent || '{}');
            window.htmlExportResolveAsset = id => assets[id] || '';
            window.htmlExportApplyAssets = () => {
                document.querySelectorAll('[data-html-export-asset]').forEach(element => {
                    const asset = window.htmlExportResolveAsset(element.dataset.htmlExportAsset);
                    if (asset) {
                        element.setAttribute('src', asset);
                        element.removeAttribute('data-html-export-asset');
                    }
                });

                document.querySelectorAll('[data-html-export-poster-asset]').forEach(element => {
                    const asset = window.htmlExportResolveAsset(element.dataset.htmlExportPosterAsset);
                    if (asset) {
                        element.setAttribute('poster', asset);
                        element.removeAttribute('data-html-export-poster-asset');
                    }
                });

                document.querySelectorAll('style[data-html-export-style-assets]').forEach(element => {
                    element.textContent = element.textContent.replace(/var\\(--html-export-asset-([^)]+)\\)/g, (_, id) => {
                        return \`url("\${window.htmlExportResolveAsset(id)}")\`;
                    });
                    element.removeAttribute('data-html-export-style-assets');
                });

                document.querySelectorAll('[data-html-export-style-assets]:not(style)').forEach(element => {
                    element.setAttribute('style', element.getAttribute('style').replace(/var\\(--html-export-asset-([^)]+)\\)/g, (_, id) => {
                        return \`url("\${window.htmlExportResolveAsset(id)}")\`;
                    }));
                    element.removeAttribute('data-html-export-style-assets');
                });
            };
            window.htmlExportApplyAssets();
        })();
    </script>`;
}

function waitForNextFrame() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function isAbortError(error) {
    return error?.name === 'AbortError' || error?.message === 'HTML export cancelled';
}

function throwIfExportCancelled(signal) {
    if (signal?.aborted) {
        throw new DOMException('HTML export cancelled', 'AbortError');
    }
}

function createProgressController(totalMessages, abortController) {
    document.getElementById(PROGRESS_OVERLAY_ID)?.remove();

    const overlay = document.createElement('div');
    overlay.id = PROGRESS_OVERLAY_ID;

    const panel = document.createElement('div');
    panel.classList.add('html_export_progress_panel');

    const title = document.createElement('div');
    title.classList.add('html_export_progress_title');
    title.textContent = 'HTML Export 匯出中';

    const status = document.createElement('div');
    status.classList.add('html_export_progress_status');
    status.textContent = '正在準備匯出...';

    const progress = document.createElement('progress');
    progress.max = Math.max(totalMessages, 1);
    progress.value = 0;

    const actions = document.createElement('div');
    actions.classList.add('html_export_progress_actions');

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.classList.add('menu_button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        cancelButton.disabled = true;
        status.textContent = '正在取消匯出...';
        abortController.abort();
    });

    actions.append(cancelButton);
    panel.append(title, status, progress, actions);
    overlay.append(panel);
    document.body.append(overlay);

    return {
        update(done, total, text = '') {
            progress.max = Math.max(total, 1);
            progress.value = Math.min(done, total);
            status.textContent = text || `已處理 ${done} / ${total} 則訊息`;
        },
        close() {
            overlay.remove();
        },
    };
}

function createSelect(id, label, options, value) {
    const wrapper = document.createElement('label');
    wrapper.classList.add('html_export_setting_row');
    wrapper.htmlFor = id;

    const labelText = document.createElement('span');
    labelText.textContent = label;

    const select = document.createElement('select');
    select.id = id;
    select.classList.add('text_pole');

    for (const option of options) {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        optionElement.selected = option.value === value;
        select.append(optionElement);
    }

    wrapper.append(labelText, select);
    return { wrapper, select };
}

function createCheckbox(id, label, checked) {
    const wrapper = document.createElement('label');
    wrapper.classList.add('checkbox_label', 'html_export_checkbox');
    wrapper.htmlFor = id;

    const input = document.createElement('input');
    input.id = id;
    input.type = 'checkbox';
    input.checked = checked;

    const text = document.createElement('span');
    text.textContent = label;

    wrapper.append(input, text);
    return { wrapper, input };
}

function createStyleField(key, label, value) {
    const wrapper = document.createElement('label');
    wrapper.classList.add('html_export_setting_row');
    wrapper.htmlFor = `html_export_style_${key}`;

    const labelText = document.createElement('span');
    labelText.textContent = label;

    const input = document.createElement('input');
    input.id = `html_export_style_${key}`;
    input.classList.add('text_pole', 'html_export_style_input');
    input.dataset.styleKey = key;
    input.value = value ?? '';

    wrapper.append(labelText, input);
    return { wrapper, input };
}

function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return min;
    }

    return Math.min(Math.max(number, min), max);
}

function normalizeHexColor(value) {
    const hex = String(value ?? '').trim();
    const match = hex.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
    if (!match) {
        return null;
    }

    const raw = match[1];
    if (raw.length === 3 || raw.length === 4) {
        return {
            hex: `#${raw.slice(0, 3).split('').map(char => char + char).join('')}`.toLowerCase(),
            alpha: raw.length === 4 ? parseInt(raw[3] + raw[3], 16) / 255 : 1,
        };
    }

    return {
        hex: `#${raw.slice(0, 6)}`.toLowerCase(),
        alpha: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1,
    };
}

function parseRgbChannel(value) {
    const text = String(value ?? '').trim();
    if (text.endsWith('%')) {
        return Math.round(clampNumber(parseFloat(text), 0, 100) * 2.55);
    }

    return Math.round(clampNumber(parseFloat(text), 0, 255));
}

function parseCssAlpha(value) {
    const text = String(value ?? '').trim();
    if (!text) {
        return 1;
    }

    if (text.endsWith('%')) {
        return clampNumber(parseFloat(text) / 100, 0, 1);
    }

    return clampNumber(parseFloat(text), 0, 1);
}

function rgbToHex(red, green, blue) {
    return `#${[red, green, blue].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function parseStyleEditorColor(value) {
    const text = String(value ?? '').trim();
    if (!text) {
        return null;
    }

    if (text.toLowerCase() === 'transparent') {
        return { hex: '#000000', alpha: 0 };
    }

    const hexColor = normalizeHexColor(text);
    if (hexColor) {
        return hexColor;
    }

    const rgbMatch = text.match(/^rgba?\((.+)\)$/i);
    if (!rgbMatch) {
        return null;
    }

    const body = rgbMatch[1].trim();
    let channels = [];
    let alpha = 1;

    if (body.includes(',')) {
        const parts = body.split(',').map(part => part.trim());
        if (parts.length < 3) {
            return null;
        }

        channels = parts.slice(0, 3);
        alpha = parts[3] === undefined ? 1 : parseCssAlpha(parts[3]);
    } else {
        const [channelText, alphaText] = body.split('/').map(part => part.trim());
        channels = channelText.split(/\s+/);
        alpha = alphaText === undefined ? 1 : parseCssAlpha(alphaText);
    }

    if (channels.length < 3) {
        return null;
    }

    return {
        hex: rgbToHex(parseRgbChannel(channels[0]), parseRgbChannel(channels[1]), parseRgbChannel(channels[2])),
        alpha,
    };
}

function hexToRgb(hex) {
    const color = normalizeHexColor(hex);
    if (!color) {
        return null;
    }

    return {
        red: parseInt(color.hex.slice(1, 3), 16),
        green: parseInt(color.hex.slice(3, 5), 16),
        blue: parseInt(color.hex.slice(5, 7), 16),
    };
}

function formatColorValue(hex, alphaPercent) {
    const normalizedHex = normalizeHexColor(hex);
    const rgb = hexToRgb(normalizedHex?.hex ?? hex);
    const alpha = clampNumber(alphaPercent, 0, 100);

    if (!rgb) {
        return String(hex ?? '');
    }

    if (alpha >= 100) {
        return normalizedHex.hex;
    }

    const alphaValue = Number((alpha / 100).toFixed(3));
    return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alphaValue})`;
}

function syncColorControlsFromText(key) {
    const input = document.getElementById(`html_export_style_${key}`);
    const colorInput = document.getElementById(`html_export_style_${key}_picker`);
    const alphaInput = document.getElementById(`html_export_style_${key}_alpha`);
    const parsedColor = parseStyleEditorColor(input?.value);

    if (!input || !colorInput || !alphaInput || !parsedColor) {
        return;
    }

    colorInput.value = parsedColor.hex;
    alphaInput.value = String(Math.round(parsedColor.alpha * 100));
}

function createColorStyleField(key, label, value) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('html_export_setting_row', 'html_export_color_setting');

    const labelText = document.createElement('span');
    labelText.textContent = label;

    const controls = document.createElement('div');
    controls.classList.add('html_export_color_controls');

    const colorInput = document.createElement('input');
    colorInput.id = `html_export_style_${key}_picker`;
    colorInput.type = 'color';
    colorInput.classList.add('html_export_color_picker');
    colorInput.title = `${label} 選色器`;

    const input = document.createElement('input');
    input.id = `html_export_style_${key}`;
    input.classList.add('text_pole', 'html_export_style_input');
    input.dataset.styleKey = key;
    input.value = value ?? '';

    const alphaLabel = document.createElement('label');
    alphaLabel.classList.add('html_export_alpha_label');
    alphaLabel.htmlFor = `html_export_style_${key}_alpha`;

    const alphaText = document.createElement('span');
    alphaText.textContent = 'A%';

    const alphaInput = document.createElement('input');
    alphaInput.id = `html_export_style_${key}_alpha`;
    alphaInput.type = 'number';
    alphaInput.min = '0';
    alphaInput.max = '100';
    alphaInput.step = '1';
    alphaInput.classList.add('text_pole', 'html_export_alpha_input');

    alphaLabel.append(alphaText, alphaInput);
    controls.append(colorInput, input, alphaLabel);
    wrapper.append(labelText, controls);

    const applyColorControls = () => {
        input.value = formatColorValue(colorInput.value, alphaInput.value || 100);
        updateStyleSetting(key, input.value);
    };

    input.addEventListener('change', () => {
        updateStyleSetting(key, input.value);
        syncColorControlsFromText(key);
    });
    colorInput.addEventListener('input', applyColorControls);
    alphaInput.addEventListener('change', applyColorControls);
    alphaInput.addEventListener('input', applyColorControls);

    requestAnimationFrame(() => syncColorControlsFromText(key));

    return { wrapper, input, colorInput, alphaInput };
}

function createNumberField(id, label, value, min = 0) {
    const wrapper = document.createElement('label');
    wrapper.classList.add('html_export_setting_row');
    wrapper.htmlFor = id;

    const labelText = document.createElement('span');
    labelText.textContent = label;

    const input = document.createElement('input');
    input.id = id;
    input.type = 'number';
    input.min = String(min);
    input.step = '1';
    input.classList.add('text_pole');
    input.value = String(value ?? '');

    wrapper.append(labelText, input);
    return { wrapper, input };
}

function refreshStyleFields(settings = getSettings()) {
    for (const [key] of STYLE_FIELDS) {
        const input = document.getElementById(`html_export_style_${key}`);
        if (input) {
            input.value = settings.style?.[key] ?? '';
            if (COLOR_STYLE_KEYS.has(key)) {
                syncColorControlsFromText(key);
            }
        }
    }
}

function readStyleFieldsIntoSettings(settings = getSettings()) {
    if (!settings.style || typeof settings.style !== 'object') {
        settings.style = {};
    }

    for (const [key] of STYLE_FIELDS) {
        const input = document.getElementById(`html_export_style_${key}`);
        if (input) {
            settings.style[key] = input.value;
        }
    }
}

function createStyleDetails(title, open = false) {
    const details = document.createElement('details');
    details.classList.add('html_export_style_section');
    details.open = open;

    const summary = document.createElement('summary');
    summary.textContent = title;

    const grid = document.createElement('div');
    grid.classList.add('html_export_style_grid');

    details.append(summary, grid);
    return { details, grid };
}

function refreshExportProfileSelect(settings = getSettings()) {
    const select = document.getElementById('html_export_profile');
    if (!select) {
        return;
    }

    select.replaceChildren();
    for (const entry of getExportProfileEntries(settings)) {
        const option = document.createElement('option');
        option.value = entry.value;
        option.textContent = entry.label;
        select.append(option);
    }

    select.value = settings.exportProfile;
}

function refreshSettingsFields(settings = getSettings()) {
    refreshExportProfileSelect(settings);

    const visibleDomToggle = document.getElementById('html_export_visible_dom_mode');
    if (visibleDomToggle) {
        visibleDomToggle.checked = settings.exportMode === 'visibleDom';
    }

    const alignmentSelect = document.getElementById('html_export_alignment');
    if (alignmentSelect) {
        alignmentSelect.value = settings.alignment === 'split' ? 'split' : 'left';
    }

    for (const key of [
        'showAvatars',
        'embedMessageImages',
        'embedExternalImages',
        'includeBackgroundImage',
        'paginateMessages',
        'applyCurrentTheme',
    ]) {
        const input = document.getElementById(`html_export_${key}`);
        if (input) {
            input.checked = !!settings[key];
        }
    }

    const maxAssetSizeField = document.getElementById('html_export_max_embedded_asset_size_mb');
    if (maxAssetSizeField) {
        maxAssetSizeField.value = String(settings.maxEmbeddedAssetSizeMb ?? 8);
    }

    const lazyBatchSizeField = document.getElementById('html_export_lazy_render_batch_size');
    if (lazyBatchSizeField) {
        lazyBatchSizeField.value = String(settings.lazyRenderBatchSize ?? 80);
    }

    const messagesPerPageField = document.getElementById('html_export_messages_per_page');
    if (messagesPerPageField) {
        messagesPerPageField.value = String(settings.messagesPerPage ?? 200);
    }

    const customCss = document.getElementById('html_export_custom_css');
    if (customCss) {
        customCss.value = settings.customCss ?? '';
    }

    const deleteButton = document.getElementById('html_export_delete_profile');
    if (deleteButton) {
        deleteButton.disabled = isBuiltinExportProfile(settings.exportProfile);
        deleteButton.title = deleteButton.disabled ? '內建設定檔不能刪除，可用 Reset 還原。' : '';
    }

    refreshStyleFields(settings);
}

function applySelectedExportProfile(profileKey) {
    const settings = getSettings();
    applyExportProfile(settings, profileKey);
    saveSettingsDebounced();
    refreshSettingsFields(settings);
}

function downloadJsonFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildExportProfileFile(settings = getSettings()) {
    const profileKey = normalizeExportProfileKey(settings.exportProfile);
    return {
        schema: 'SillyTavern-HTML-Export.settingsProfile',
        version: 1,
        key: profileKey,
        label: getExportProfileLabel(settings, profileKey),
        settings: createExportProfileSnapshot(settings),
    };
}

function importExportProfileFile(profileFile, settings = getSettings()) {
    if (!profileFile || typeof profileFile !== 'object') {
        throw new Error('設定檔格式錯誤。');
    }

    const importedSettings = profileFile.settings && typeof profileFile.settings === 'object'
        ? profileFile.settings
        : profileFile;
    const label = String(profileFile.label ?? 'Imported Profile').trim() || 'Imported Profile';

    if (!settings.exportProfiles || typeof settings.exportProfiles !== 'object') {
        settings.exportProfiles = {};
    }

    const profileKey = createProfileKeyFromLabel(label, settings.exportProfiles);
    settings.exportProfiles[profileKey] = {
        label,
        settings: normalizeExportProfileSettings(profileKey, importedSettings),
    };
    settings.exportProfile = profileKey;
    applyExportProfile(settings, profileKey);

    return profileKey;
}

function addSettingsPanel(settings = getSettings()) {
    if (document.getElementById(SETTINGS_CONTAINER_ID)) {
        return;
    }

    const settingsContainer = document.getElementById('extensions_settings2') ?? document.getElementById('extensions_settings');
    if (!settingsContainer) {
        console.warn(`[${EXTENSION_NAME}] Could not find extension settings container.`);
        return;
    }

    const inlineDrawer = document.createElement('div');
    inlineDrawer.id = SETTINGS_CONTAINER_ID;
    inlineDrawer.classList.add('inline-drawer', 'html_export_settings');

    const header = document.createElement('div');
    header.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const title = document.createElement('b');
    title.textContent = 'HTML Export';

    const icon = document.createElement('div');
    icon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    header.append(title, icon);

    const content = document.createElement('div');
    content.classList.add('inline-drawer-content');

    const description = document.createElement('div');
    description.classList.add('html_export_description');
    description.textContent = '關閉「畫面樣式匯出」時，會用完整聊天室資料產生樣板模式 HTML；開啟時會複製目前畫面 DOM。';

    const profileSelect = createSelect(
        'html_export_profile',
        'HTML 匯出設定',
        getExportProfileEntries(settings).map(({ value, label }) => ({ value, label })),
        settings.exportProfile,
    );
    profileSelect.select.addEventListener('change', () => {
        applySelectedExportProfile(profileSelect.select.value);
    });

    const alignmentSelect = createSelect(
        'html_export_alignment',
        '訊息對齊',
        [
            { value: 'left', label: '兩者同側左邊' },
            { value: 'split', label: '使用者右邊、角色左邊' },
        ],
        settings.alignment,
    );
    alignmentSelect.select.addEventListener('change', () => {
        updateSetting('alignment', alignmentSelect.select.value === 'split' ? 'split' : 'left');
    });

    const checkboxSection = document.createElement('div');
    checkboxSection.classList.add('html_export_checkbox_grid');

    const checkboxSettings = [
        ['exportMode', '畫面樣式匯出'],
        ['showAvatars', '顯示頭像'],
        ['embedMessageImages', '內嵌訊息圖片'],
        ['embedExternalImages', '內嵌外連圖片'],
        ['includeBackgroundImage', '匯出聊天室背景'],
        ['paginateMessages', '分頁顯示訊息'],
        ['applyCurrentTheme', '套用目前 ST 樣式'],
    ];

    for (const [key, label] of checkboxSettings) {
        const checked = key === 'exportMode'
            ? settings.exportMode === 'visibleDom'
            : !!settings[key];
        const checkbox = createCheckbox(
            key === 'exportMode' ? 'html_export_visible_dom_mode' : `html_export_${key}`,
            label,
            checked,
        );
        checkbox.input.addEventListener('change', () => {
            if (key === 'exportMode') {
                updateSetting('exportMode', checkbox.input.checked ? 'visibleDom' : 'complete');
            } else {
                updateSetting(key, checkbox.input.checked);
            }
        });
        checkboxSection.append(checkbox.wrapper);
    }

    const maxAssetSizeField = createNumberField(
        'html_export_max_embedded_asset_size_mb',
        '單張內嵌圖片上限（MB，0 = 不限制）',
        settings.maxEmbeddedAssetSizeMb,
    );
    maxAssetSizeField.input.addEventListener('change', () => {
        updateSetting('maxEmbeddedAssetSizeMb', Number(maxAssetSizeField.input.value) || 0);
    });

    const lazyBatchSizeField = createNumberField(
        'html_export_lazy_render_batch_size',
        '分批顯示：每批訊息數',
        settings.lazyRenderBatchSize,
        1,
    );
    lazyBatchSizeField.input.addEventListener('change', () => {
        updateSetting('lazyRenderBatchSize', Math.max(1, Number(lazyBatchSizeField.input.value) || 80));
    });

    const messagesPerPageField = createNumberField(
        'html_export_messages_per_page',
        '分頁顯示：每頁訊息數',
        settings.messagesPerPage,
        1,
    );
    messagesPerPageField.input.addEventListener('change', () => {
        updateSetting('messagesPerPage', Math.max(1, Number(messagesPerPageField.input.value) || 200));
    });

    const styleTitle = document.createElement('h4');
    styleTitle.textContent = '樣式細節';

    const layoutStyleSection = createStyleDetails('版面與文字', true);
    const colorStyleSection = createStyleDetails('顏色與透明度', false);

    for (const [key, label] of NON_COLOR_STYLE_FIELDS) {
        const field = createStyleField(key, label, settings.style?.[key]);
        field.input.addEventListener('change', () => {
            updateStyleSetting(key, field.input.value);
        });
        layoutStyleSection.grid.append(field.wrapper);
    }

    for (const [key, label] of COLOR_STYLE_FIELDS) {
        const field = createColorStyleField(key, label, settings.style?.[key]);
        colorStyleSection.grid.append(field.wrapper);
    }

    const customCssLabel = document.createElement('label');
    customCssLabel.classList.add('html_export_setting_row', 'html_export_custom_css_row');
    customCssLabel.htmlFor = 'html_export_custom_css';

    const customCssText = document.createElement('span');
    customCssText.textContent = '自訂 CSS';

    const customCss = document.createElement('textarea');
    customCss.id = 'html_export_custom_css';
    customCss.classList.add('text_pole');
    customCss.spellcheck = false;
    customCss.value = settings.customCss ?? '';
    customCss.addEventListener('change', () => {
        updateSetting('customCss', customCss.value);
    });

    customCssLabel.append(customCssText, customCss);

    const actionRow = document.createElement('div');
    actionRow.classList.add('html_export_action_row');

    const txtExportButton = document.createElement('button');
    txtExportButton.type = 'button';
    txtExportButton.classList.add('menu_button');
    txtExportButton.textContent = 'Export TXT';
    txtExportButton.addEventListener('click', () => {
        exportCurrentChatAsTxt();
    });

    const saveProfileButton = document.createElement('button');
    saveProfileButton.type = 'button';
    saveProfileButton.classList.add('menu_button');
    saveProfileButton.textContent = 'Save';
    saveProfileButton.addEventListener('click', () => {
        const currentSettings = getSettings();
        saveCurrentExportProfile(currentSettings);
        saveSettingsDebounced();
        refreshSettingsFields(currentSettings);
        toastr.success('已儲存目前 HTML 匯出設定。', 'HTML Export');
    });

    const saveAsProfileButton = document.createElement('button');
    saveAsProfileButton.type = 'button';
    saveAsProfileButton.classList.add('menu_button');
    saveAsProfileButton.textContent = 'Save As';
    saveAsProfileButton.addEventListener('click', () => {
        const currentSettings = getSettings();
        const defaultName = `${getExportProfileLabel(currentSettings, currentSettings.exportProfile)} Copy`;
        const profileName = window.prompt('請輸入新 HTML 匯出設定名稱：', defaultName);
        const profileKey = saveCurrentExportProfileAs(currentSettings, profileName);

        if (!profileKey) {
            return;
        }

        saveSettingsDebounced();
        refreshSettingsFields(currentSettings);
        toastr.success('已另存 HTML 匯出設定。', 'HTML Export');
    });

    const exportProfileButton = document.createElement('button');
    exportProfileButton.type = 'button';
    exportProfileButton.classList.add('menu_button');
    exportProfileButton.textContent = 'Export';
    exportProfileButton.addEventListener('click', () => {
        const currentSettings = getSettings();
        const profileFile = buildExportProfileFile(currentSettings);
        downloadJsonFile(profileFile, `${sanitizeFilename(profileFile.label)}.html-export-profile.json`);
    });

    const importProfileInput = document.createElement('input');
    importProfileInput.id = 'html_export_import_profile_file';
    importProfileInput.type = 'file';
    importProfileInput.accept = 'application/json,.json';
    importProfileInput.hidden = true;
    importProfileInput.addEventListener('change', async () => {
        const selectedFile = importProfileInput.files?.[0];
        importProfileInput.value = '';

        if (!selectedFile) {
            return;
        }

        try {
            const text = await selectedFile.text();
            const currentSettings = getSettings();
            importExportProfileFile(JSON.parse(text), currentSettings);
            saveSettingsDebounced();
            refreshSettingsFields(currentSettings);
            toastr.success('已匯入 HTML 匯出設定。', 'HTML Export');
        } catch (error) {
            console.error(`[${EXTENSION_NAME}] Failed to import HTML export profile.`, error);
            toastr.error(error?.message || 'HTML 匯出設定匯入失敗。', 'HTML Export');
        }
    });

    const importProfileButton = document.createElement('button');
    importProfileButton.type = 'button';
    importProfileButton.classList.add('menu_button');
    importProfileButton.textContent = 'Import';
    importProfileButton.addEventListener('click', () => {
        importProfileInput.click();
    });

    const deleteProfileButton = document.createElement('button');
    deleteProfileButton.id = 'html_export_delete_profile';
    deleteProfileButton.type = 'button';
    deleteProfileButton.classList.add('menu_button');
    deleteProfileButton.textContent = 'Delete';
    deleteProfileButton.disabled = isBuiltinExportProfile(settings.exportProfile);
    deleteProfileButton.addEventListener('click', () => {
        const currentSettings = getSettings();
        const profileName = getExportProfileLabel(currentSettings, currentSettings.exportProfile);

        if (isBuiltinExportProfile(currentSettings.exportProfile)) {
            toastr.warning('內建 HTML 匯出設定不能刪除，可用 Reset 還原。', 'HTML Export');
            return;
        }

        if (!window.confirm(`確定要刪除「${profileName}」嗎？`)) {
            return;
        }

        deleteCurrentExportProfile(currentSettings);
        saveSettingsDebounced();
        refreshSettingsFields(currentSettings);
        toastr.success('已刪除 HTML 匯出設定。', 'HTML Export');
    });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.classList.add('menu_button');
    resetButton.textContent = 'Reset';
    resetButton.addEventListener('click', () => {
        const currentSettings = getSettings();
        resetCurrentExportProfile(currentSettings);
        saveSettingsDebounced();
        refreshSettingsFields(currentSettings);
        toastr.success('已還原目前 HTML 匯出設定。', 'HTML Export');
    });

    actionRow.append(txtExportButton, saveProfileButton, saveAsProfileButton, importProfileButton, exportProfileButton, deleteProfileButton, resetButton, importProfileInput);
    content.append(description, profileSelect.wrapper, alignmentSelect.wrapper, checkboxSection, maxAssetSizeField.wrapper, lazyBatchSizeField.wrapper, messagesPerPageField.wrapper, styleTitle, layoutStyleSection.details, colorStyleSection.details, customCssLabel, actionRow);
    inlineDrawer.append(header, content);
    settingsContainer.append(inlineDrawer);
    refreshSettingsFields(settings);
}

const TEXT_STYLE_PROPS = Object.freeze([
    'color',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'letter-spacing',
    'line-height',
    'text-align',
    'text-shadow',
]);

const BOX_STYLE_PROPS = Object.freeze([
    'background-color',
    'backdrop-filter',
    'box-shadow',
    'filter',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
]);

const BACKGROUND_STYLE_PROPS = Object.freeze([
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'background-attachment',
]);

const HIGH_FIDELITY_STYLE_PROPS = Object.freeze([
    'display',
    'box-sizing',
    'position',
    'flex-direction',
    'flex-wrap',
    'align-items',
    'align-content',
    'justify-content',
    'gap',
    'row-gap',
    'column-gap',
    'grid-template-columns',
    'grid-template-rows',
    'grid-column',
    'grid-row',
    'order',
    'flex',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'min-width',
    'max-width',
    'min-height',
    'max-height',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'outline',
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'background-attachment',
    'box-shadow',
    'filter',
    'backdrop-filter',
    'opacity',
    'overflow',
    'overflow-x',
    'overflow-y',
    'color',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'font-variant',
    'letter-spacing',
    'line-height',
    'text-align',
    'text-decoration',
    'text-shadow',
    'text-transform',
    'white-space',
    'word-break',
    'overflow-wrap',
    'vertical-align',
    'list-style-type',
    'object-fit',
    'object-position',
    'transform',
    'transform-origin',
]);

const HIGH_FIDELITY_REMOVE_SELECTORS = Object.freeze([
    'script',
    '.mes_buttons',
    '.extraMesButtons',
    '.swipe_left',
    '.swipe_right',
    '.swipes-counter',
    '.mesIDDisplay',
    '.tokenCounterDisplay',
    '.mes_timer',
    '.mes_edit_buttons',
    '.mes_edit_cancel',
    '.mes_edit_done',
    '.icon-svg.timestamp-icon',
    '.icon-svg.thinking-icon',
    '.drag-grabber',
]);

const HIGH_FIDELITY_EXTENSION_STYLESHEET_PATTERNS = Object.freeze([
    'SillyTavern-Not-A-Discord-Theme',
    'SillyTavern-MoonlitEchoesTheme',
]);

const HIGH_FIDELITY_EXTENSION_STYLE_IDS = Object.freeze([
    'csss--css-snippets',
    'dynamic-theme-styles',
    'moonlit-raw-css',
    'MoonlitEchosTheme-style',
    'MoonlitEchosTheme-extension',
    'nadtheme-mes-minheight-style',
]);

const HIGH_FIDELITY_ENVIRONMENT_MARKER_IDS = Object.freeze([
    'bg1',
    'bg_custom',
    'bg_custom2',
    'extensionTopBar',
]);

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function sanitizeFilename(value) {
    return String(value || 'SillyTavern Chat')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160) || 'SillyTavern Chat';
}

function getExportDate() {
    return new Date().toLocaleString();
}

function toExportUrl(url, baseUrl = window.location.origin) {
    if (!url || /^(data:|blob:|https?:|mailto:|#)/i.test(url)) {
        return url;
    }

    try {
        return new URL(url, baseUrl).href;
    } catch {
        return url;
    }
}

function encodePathSegment(value) {
    return String(value ?? '').split('/').map(segment => encodeURIComponent(segment)).join('/');
}

function getCharacterAvatarOriginalUrl(avatar) {
    if (!avatar || avatar === 'none') {
        return default_avatar;
    }

    if (/^(data:|blob:|https?:|\/|img\/)/i.test(avatar)) {
        return avatar;
    }

    return `/characters/${encodePathSegment(avatar)}`;
}

function getPersonaAvatarOriginalUrl(avatar) {
    if (!avatar) {
        return default_user_avatar;
    }

    if (/^(data:|blob:|https?:|\/|img\/)/i.test(avatar)) {
        return avatar;
    }

    return `/User Avatars/${encodePathSegment(avatar)}`;
}

function getOriginalAvatarUrlFromThumbnail(url) {
    try {
        const parsedUrl = new URL(url, window.location.origin);
        if (parsedUrl.pathname !== '/thumbnail') {
            return null;
        }

        const type = parsedUrl.searchParams.get('type');
        const file = parsedUrl.searchParams.get('file');

        if (!file) {
            return null;
        }

        if (type === 'avatar') {
            return getCharacterAvatarOriginalUrl(file);
        }

        if (type === 'persona') {
            return getPersonaAvatarOriginalUrl(file);
        }
    } catch {
        return null;
    }

    return null;
}

function isDefaultAvatarUrl(url) {
    const value = String(url ?? '');
    return !value
        || value === default_avatar
        || value === default_user_avatar
        || value === system_avatar
        || value.endsWith(`/${default_avatar}`)
        || value.endsWith(`/${default_user_avatar}`)
        || value.endsWith(`/${system_avatar}`);
}

function getForceAvatarOriginalUrl(forceAvatar) {
    if (!forceAvatar || isDefaultAvatarUrl(forceAvatar)) {
        return null;
    }

    return getOriginalAvatarUrlFromThumbnail(forceAvatar) ?? forceAvatar;
}

function rewriteCssAssetUrls(cssText, baseUrl = window.location.origin) {
    return String(cssText ?? '').replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (_, quote, url) => {
        return `url("${toExportUrl(url.trim(), baseUrl)}")`;
    });
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function isSameOriginAsset(url) {
    if (!url || /^blob:/i.test(url)) {
        return true;
    }

    try {
        return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
        return false;
    }
}

function shouldEmbedAssetUrl(url, options, assetType) {
    if (!url || /^(data:|mailto:|#)/i.test(url)) {
        return false;
    }

    if (assetType === 'avatar') {
        return !!options.embedAvatars;
    }

    if (assetType === 'background') {
        return !!options.includeBackgroundImage && (isSameOriginAsset(url) || !!options.embedExternalImages);
    }

    if (!options.embedMessageImages) {
        return false;
    }

    return isSameOriginAsset(url) || !!options.embedExternalImages;
}

function getMaxEmbeddedAssetBytes(options) {
    const sizeMb = Number(options.maxEmbeddedAssetSizeMb);

    if (!Number.isFinite(sizeMb) || sizeMb <= 0) {
        return Infinity;
    }

    return sizeMb * 1024 * 1024;
}

async function convertAssetUrlForExport(url, options, assetType = 'message', signal = null, baseUrl = window.location.origin) {
    throwIfExportCancelled(signal);

    const sourceUrl = assetType === 'avatar'
        ? getOriginalAvatarUrlFromThumbnail(url) ?? url
        : url;
    const exportUrl = toExportUrl(sourceUrl, baseUrl);

    if (!shouldEmbedAssetUrl(exportUrl, options, assetType)) {
        return exportUrl;
    }

    if (assetDataUrlCache.has(exportUrl)) {
        return assetDataUrlCache.get(exportUrl);
    }

    try {
        const response = await fetch(exportUrl, {
            credentials: 'include',
            cache: 'force-cache',
            signal,
        });

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        const maxBytes = getMaxEmbeddedAssetBytes(options);
        const contentLength = Number(response.headers.get('content-length'));
        if (Number.isFinite(contentLength) && contentLength > maxBytes) {
            console.warn(`[${EXTENSION_NAME}] Skipped large asset (${Math.round(contentLength / 1024 / 1024)} MB): ${exportUrl}`);
            assetDataUrlCache.set(exportUrl, exportUrl);
            return exportUrl;
        }

        const blob = await response.blob();
        throwIfExportCancelled(signal);

        if (blob.size > maxBytes) {
            console.warn(`[${EXTENSION_NAME}] Skipped large asset (${Math.round(blob.size / 1024 / 1024)} MB): ${exportUrl}`);
            assetDataUrlCache.set(exportUrl, exportUrl);
            return exportUrl;
        }

        const dataUrl = await blobToDataUrl(blob);
        assetDataUrlCache.set(exportUrl, dataUrl);
        return dataUrl;
    } catch (error) {
        if (isAbortError(error)) {
            throw error;
        }

        console.warn(`[${EXTENSION_NAME}] Could not embed asset: ${exportUrl}`, error);
        assetDataUrlCache.set(exportUrl, exportUrl);
        return exportUrl;
    }
}

async function getRegisteredAssetReference(url, options, assetType = 'message', signal = null, baseUrl = window.location.origin) {
    const sourceUrl = assetType === 'avatar'
        ? getOriginalAvatarUrlFromThumbnail(url) ?? url
        : url;
    const fallbackUrl = toExportUrl(sourceUrl, baseUrl);
    const convertedUrl = await convertAssetUrlForExport(sourceUrl, options, assetType, signal, baseUrl);
    const assetId = registerEmbeddedAsset(options.assetRegistry, fallbackUrl, convertedUrl);

    return {
        url: assetId ? fallbackUrl : convertedUrl,
        assetId,
    };
}

async function rewriteCssAssetUrlsForExport(cssText, options, signal = null, baseUrl = window.location.origin, assetType = 'message') {
    const css = String(cssText ?? '');
    const matches = Array.from(css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi));

    if (matches.length === 0) {
        return css;
    }

    let result = '';
    let lastIndex = 0;

    for (const match of matches) {
        throwIfExportCancelled(signal);

        const [fullMatch, , rawUrl] = match;
        const index = match.index ?? 0;
        const asset = await getRegisteredAssetReference(rawUrl.trim(), options, assetType, signal, baseUrl);

        result += css.slice(lastIndex, index);
        result += asset.assetId ? `var(--html-export-asset-${asset.assetId})` : `url("${asset.url}")`;
        lastIndex = index + fullMatch.length;
    }

    result += css.slice(lastIndex);
    return result;
}

async function rewriteSrcsetForExport(srcset, options, signal = null) {
    const candidates = String(srcset ?? '')
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);

    const convertedCandidates = [];

    for (const candidate of candidates) {
        throwIfExportCancelled(signal);

        const [url, ...descriptors] = candidate.split(/\s+/);
        convertedCandidates.push([toExportUrl(url), ...descriptors].join(' '));
    }

    return convertedCandidates.join(', ');
}

async function rewriteHtmlAssetUrls(html, options, signal = null) {
    const template = document.createElement('template');
    template.innerHTML = html;

    for (const element of template.content.querySelectorAll('[style]')) {
        throwIfExportCancelled(signal);

        const style = element.getAttribute('style');
        if (style) {
            const rewrittenStyle = await rewriteCssAssetUrlsForExport(style, options, signal);
            element.setAttribute('style', rewrittenStyle);
            if (rewrittenStyle.includes('--html-export-asset-')) {
                element.dataset.htmlExportStyleAssets = 'true';
            }
        }
    }

    for (const element of template.content.querySelectorAll('style')) {
        throwIfExportCancelled(signal);
        element.textContent = await rewriteCssAssetUrlsForExport(element.textContent, options, signal);
        if (element.textContent.includes('--html-export-asset-')) {
            element.dataset.htmlExportStyleAssets = 'true';
        }
    }

    for (const element of template.content.querySelectorAll('[src]')) {
        throwIfExportCancelled(signal);

        const src = element.getAttribute('src');
        if (src) {
            const asset = await getRegisteredAssetReference(src, options, getElementAssetType(element), signal);
            element.setAttribute('src', asset.url);
            if (asset.assetId) {
                element.dataset.htmlExportAsset = asset.assetId;
            }
        }
    }

    for (const element of template.content.querySelectorAll('[poster]')) {
        throwIfExportCancelled(signal);

        const poster = element.getAttribute('poster');
        if (poster) {
            const asset = await getRegisteredAssetReference(poster, options, 'message', signal);
            element.setAttribute('poster', asset.url);
            if (asset.assetId) {
                element.dataset.htmlExportPosterAsset = asset.assetId;
            }
        }
    }

    for (const element of template.content.querySelectorAll('[srcset]')) {
        throwIfExportCancelled(signal);

        const srcset = element.getAttribute('srcset');
        if (srcset) {
            element.setAttribute('srcset', await rewriteSrcsetForExport(srcset, options, signal));
        }
    }

    template.content.querySelectorAll('[href]').forEach(element => {
        const href = element.getAttribute('href');
        if (href && !href.startsWith('#')) {
            element.setAttribute('href', toExportUrl(href));
        }
    });

    return template.innerHTML;
}

function getElementAssetType(element) {
    return element.matches('.avatar img, .message-avatar img, img.avatar, .ch_avatar img')
        ? 'avatar'
        : 'message';
}

function isTransparentColor(value) {
    return !value || value === 'transparent' || /^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*(?:,\s*0\s*)?\)$/i.test(value);
}

function parseCssColor(value) {
    const color = String(value ?? '').trim();

    if (!color || color === 'transparent') {
        return null;
    }

    const rgbMatch = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+)\s*)?\)$/i);
    if (rgbMatch) {
        return {
            r: Number(rgbMatch[1]),
            g: Number(rgbMatch[2]),
            b: Number(rgbMatch[3]),
            a: rgbMatch[4] === undefined ? 1 : Number(rgbMatch[4]),
        };
    }

    const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
        const hex = hexMatch[1].length === 3
            ? hexMatch[1].split('').map(char => char + char).join('')
            : hexMatch[1];
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: 1,
        };
    }

    return null;
}

function blendColors(foreground, background) {
    if (!foreground) {
        return background;
    }

    if (!background || foreground.a >= 1) {
        return foreground;
    }

    const alpha = foreground.a;
    return {
        r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
        g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
        b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
        a: 1,
    };
}

function getRelativeLuminance(color) {
    const channels = [color.r, color.g, color.b].map(value => {
        const normalized = value / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function getContrastRatio(first, second) {
    const firstLuminance = getRelativeLuminance(first);
    const secondLuminance = getRelativeLuminance(second);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

function serializeColor(color) {
    return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
}

function getReadableColor(backgroundColor) {
    const white = { r: 255, g: 255, b: 255, a: 1 };
    const black = { r: 20, g: 20, b: 20, a: 1 };

    return getContrastRatio(white, backgroundColor) >= getContrastRatio(black, backgroundColor)
        ? white
        : black;
}

function ensureReadableTextColor(textDeclarations, backgroundDeclarations, pageDeclarations) {
    const pageBackground = parseCssColor(pageDeclarations?.['background-color']) ?? { r: 17, g: 17, b: 17, a: 1 };
    const rawBackground = parseCssColor(backgroundDeclarations?.['background-color']) ?? pageBackground;
    const background = blendColors(rawBackground, pageBackground);
    const text = parseCssColor(textDeclarations?.color);

    if (!text || getContrastRatio(blendColors(text, background), background) < 4.5) {
        return {
            ...textDeclarations,
            color: serializeColor(getReadableColor(background)),
        };
    }

    return textDeclarations;
}

function isUsefulCssValue(property, value) {
    if (!value) {
        return false;
    }

    if (property === 'background-color' && isTransparentColor(value)) {
        return false;
    }

    if (['box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'background-image'].includes(property) && value === 'none') {
        return false;
    }

    return true;
}

function getVisibleElement(selectors) {
    for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        const element = elements.find(item => {
            const rect = item.getBoundingClientRect();
            const style = window.getComputedStyle(item);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (element) {
            return element;
        }
    }

    return null;
}

function readStyleProperties(element, properties) {
    if (!element) {
        return {};
    }

    const style = window.getComputedStyle(element);
    return Object.fromEntries(properties
        .map(property => [property, rewriteCssAssetUrls(style.getPropertyValue(property))])
        .filter(([property, value]) => isUsefulCssValue(property, value)));
}

function readBoxStyle(element) {
    if (!element) {
        return {};
    }

    const style = window.getComputedStyle(element);
    const declarations = readStyleProperties(element, BOX_STYLE_PROPS);
    const sides = ['top', 'right', 'bottom', 'left'];

    for (const side of sides) {
        const width = style.getPropertyValue(`border-${side}-width`);
        const styleValue = style.getPropertyValue(`border-${side}-style`);
        const color = style.getPropertyValue(`border-${side}-color`);

        if (styleValue && styleValue !== 'none' && width && width !== '0px') {
            declarations[`border-${side}-width`] = width;
            declarations[`border-${side}-style`] = styleValue;
            declarations[`border-${side}-color`] = color;
        }
    }

    return declarations;
}

function mergeDeclarations(...declarationSets) {
    return Object.assign({}, ...declarationSets.filter(Boolean));
}

function cssBlock(selector, declarations) {
    const entries = Object.entries(declarations ?? {}).filter(([, value]) => value);

    if (entries.length === 0) {
        return '';
    }

    const body = entries
        .map(([property, value]) => `            ${property}: ${value};`)
        .join('\n');

    return `        ${selector} {\n${body}\n        }\n`;
}

function escapeStyleTagContent(cssText) {
    return String(cssText ?? '').replace(/<\/style/gi, '<\\/style');
}

function splitCssImports(cssText) {
    const imports = [];
    const body = String(cssText ?? '').replace(/^\s*@import\s+(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\)|"[^"]*"|'[^']*')[^;\r\n]*;\s*/gmi, match => {
        imports.push(match.trim());
        return '';
    });

    return {
        imports: imports.join('\n'),
        body,
    };
}

function getBackgroundStyle(options = getExportOptions()) {
    const backgroundElement = getVisibleElement(['#bg_custom', '#bg1', 'body']) ?? document.body;
    const declarations = readStyleProperties(backgroundElement, BACKGROUND_STYLE_PROPS);

    if (!options.includeBackgroundImage) {
        delete declarations['background-image'];
    }

    return declarations;
}

async function buildCurrentBackgroundImageStyles(options, signal = null) {
    if (!options.includeBackgroundImage) {
        return '';
    }

    const declarations = getBackgroundStyle(options);
    if (!declarations['background-image']) {
        return '';
    }

    const css = cssBlock('body', declarations);
    return rewriteCssAssetUrlsForExport(css, options, signal, window.location.href, 'background');
}

function buildExtractedThemeStyles(options = getExportOptions()) {
    const chatElement = document.getElementById('chat');
    const anyMessage = getVisibleElement(['#chat .mes']);
    const userMessage = getVisibleElement(['#chat .mes[is_user="true"]']);
    const characterMessage = getVisibleElement(['#chat .mes[is_user="false"]:not([is_system="true"])', '#chat .mes[is_user="false"]']);
    const systemMessage = getVisibleElement(['#chat .mes[is_system="true"]']);
    const anyMessageBlock = getVisibleElement(['#chat .mes .mes_block']);
    const userMessageBlock = getVisibleElement(['#chat .mes[is_user="true"] .mes_block']);
    const characterMessageBlock = getVisibleElement(['#chat .mes[is_user="false"]:not([is_system="true"]) .mes_block', '#chat .mes[is_user="false"] .mes_block']);
    const systemMessageBlock = getVisibleElement(['#chat .mes[is_system="true"] .mes_block']);
    const messageText = getVisibleElement(['#chat .mes_text']);
    const quoteText = getVisibleElement(['#chat .mes_text q']);
    const nameText = getVisibleElement(['#chat .ch_name .name_text', '#chat .ch_name']);
    const timestamp = getVisibleElement(['#chat .timestamp']);
    const avatar = getVisibleElement(['#chat .avatar img']);

    const pageTextStyles = readStyleProperties(chatElement ?? document.body, TEXT_STYLE_PROPS);
    const backgroundStyles = getBackgroundStyle(options);
    const messageBaseStyles = mergeDeclarations(readBoxStyle(anyMessage), readBoxStyle(anyMessageBlock));
    const userMessageStyles = mergeDeclarations(readBoxStyle(userMessage), readBoxStyle(userMessageBlock));
    const characterMessageStyles = mergeDeclarations(readBoxStyle(characterMessage), readBoxStyle(characterMessageBlock));
    const systemMessageStyles = mergeDeclarations(readBoxStyle(systemMessage), readBoxStyle(systemMessageBlock));
    const messageTextStyles = ensureReadableTextColor(
        readStyleProperties(messageText, TEXT_STYLE_PROPS),
        characterMessageStyles,
        backgroundStyles,
    );
    const userTextStyles = ensureReadableTextColor(messageTextStyles, userMessageStyles, backgroundStyles);
    const characterTextStyles = ensureReadableTextColor(messageTextStyles, characterMessageStyles, backgroundStyles);
    const systemTextStyles = ensureReadableTextColor(messageTextStyles, systemMessageStyles, backgroundStyles);
    const quoteTextStyles = mergeDeclarations(
        readStyleProperties(quoteText, ['color', 'font-style', 'font-weight', 'text-shadow']),
        readBoxStyle(quoteText),
    );
    const nameStyles = readStyleProperties(nameText, TEXT_STYLE_PROPS);
    const timestampStyles = readStyleProperties(timestamp, TEXT_STYLE_PROPS);
    const avatarStyles = readStyleProperties(avatar, [
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-right-radius',
        'border-bottom-left-radius',
        'box-shadow',
        'filter',
    ]);

    return [
        cssBlock('body', mergeDeclarations(pageTextStyles, backgroundStyles)),
        cssBlock('.message-body', messageBaseStyles),
        cssBlock('.message-user .message-body', userMessageStyles),
        cssBlock('.message-character .message-body', characterMessageStyles),
        cssBlock('.message-system .message-body', systemMessageStyles),
        cssBlock('.message-text', messageTextStyles),
        cssBlock('.message-user .message-text', userTextStyles),
        cssBlock('.message-character .message-text', characterTextStyles),
        cssBlock('.message-system .message-text', systemTextStyles),
        cssBlock('.message-text q', quoteTextStyles),
        cssBlock('.message-name', nameStyles),
        cssBlock('.message-time', timestampStyles),
        cssBlock('.message-avatar img', avatarStyles),
    ].filter(Boolean).join('\n');
}

function getCurrentChatTitle() {
    return getCurrentChatId() || 'Untitled chat';
}

function getCurrentSubjectName() {
    if (selected_group) {
        return groups.find(group => group.id === selected_group)?.name || 'Group chat';
    }

    return name2 || 'Character';
}

function getCharacterByMessageName(name) {
    if (!name) {
        return null;
    }

    if (selected_group) {
        const group = groups.find(item => item.id === selected_group);
        const groupMember = group?.members
            ?.map(avatar => characters.find(character => character?.avatar === avatar))
            .find(character => character?.name === name);

        if (groupMember) {
            return groupMember;
        }
    }

    return characters.find(character => character?.name === name) ?? null;
}

function getMessageAvatar(message) {
    if (message?.is_user) {
        const forcedUserAvatar = getForceAvatarOriginalUrl(message?.force_avatar);
        if (forcedUserAvatar) {
            return forcedUserAvatar;
        }

        return user_avatar ? getPersonaAvatarOriginalUrl(user_avatar) : default_user_avatar;
    }

    if (isSystemMessage(message)) {
        return system_avatar;
    }

    if (message?.original_avatar && !isDefaultAvatarUrl(message.original_avatar)) {
        return getCharacterAvatarOriginalUrl(message.original_avatar);
    }

    const character = selected_group
        ? getCharacterByMessageName(message?.name)
        : characters[this_chid];

    if (character?.avatar && character.avatar !== 'none') {
        return getCharacterAvatarOriginalUrl(character.avatar);
    }

    const forcedCharacterAvatar = getForceAvatarOriginalUrl(message?.force_avatar);
    if (forcedCharacterAvatar) {
        return forcedCharacterAvatar;
    }

    return default_avatar;
}

function isHiddenMessage(message) {
    return !!message?.is_system && message?.name !== systemUserName;
}

function isSystemMessage(message) {
    return !!message?.is_system && !isHiddenMessage(message);
}

function shouldExportMessage(message, options) {
    if (!options.includeHiddenMessages && isHiddenMessage(message)) {
        return false;
    }

    if (!options.includeSystemMessages && isSystemMessage(message)) {
        return false;
    }

    return true;
}

function normalizeMessageRangeValue(value) {
    if (Array.isArray(value)) {
        return value.join(' ').trim();
    }

    return String(value ?? '').trim();
}

function parseMessageRangeInput(value) {
    const input = normalizeMessageRangeValue(value);
    if (!input) {
        return null;
    }

    const compactInput = input.replace(/\s+/g, '');
    const singleIdMatch = compactInput.match(/^\d+$/);
    if (singleIdMatch) {
        const id = Number(singleIdMatch[0]);
        return { startId: id, endId: id };
    }

    const rangeMatch = compactInput.match(/^(\d*)(?:-|\.\.|:)(\d*)$/);
    if (!rangeMatch || (!rangeMatch[1] && !rangeMatch[2])) {
        throw new Error('訊息範圍格式不正確，請使用 100-300、100..300、100:300、100- 或 -300。');
    }

    let startId = rangeMatch[1] ? Number(rangeMatch[1]) : 0;
    let endId = rangeMatch[2] ? Number(rangeMatch[2]) : null;

    if (!Number.isFinite(startId) || (endId !== null && !Number.isFinite(endId))) {
        throw new Error('訊息範圍只能使用數字。');
    }

    startId = Math.max(0, Math.trunc(startId));
    endId = endId === null ? null : Math.max(0, Math.trunc(endId));

    if (endId !== null && endId < startId) {
        [startId, endId] = [endId, startId];
    }

    return { startId, endId };
}

function isMessageInExportRange(messageId, range = null) {
    if (!range) {
        return true;
    }

    if (messageId < range.startId) {
        return false;
    }

    return range.endId === null || messageId <= range.endId;
}

function getMessageRangeLabel(range = null) {
    if (!range) {
        return '';
    }

    return range.endId === null
        ? `#${range.startId} 之後`
        : `#${range.startId} - #${range.endId}`;
}

function getExportableMessageEntries(options = getExportOptions()) {
    const range = options.messageRange ?? null;

    return chat
        .map((message, index) => ({ message, index }))
        .filter(({ message, index }) => shouldExportMessage(message, options) && isMessageInExportRange(index, range));
}

function normalizeOptionalText(value) {
    if (Array.isArray(value)) {
        return value.join(' ').trim();
    }

    return String(value ?? '').trim();
}

function collectUserNameSearchValues(replacementName = '') {
    const names = new Set();

    if (name1) {
        names.add(String(name1));
    }

    for (const message of chat) {
        if (message?.is_user && message?.name) {
            names.add(String(message.name));
        }
    }

    return [...names]
        .map(name => name.trim())
        .filter(name => name && name !== replacementName)
        .sort((a, b) => b.length - a.length);
}

function normalizeUserNameReplacementOptions(options = getExportOptions()) {
    const replacementName = normalizeOptionalText(options.usernameReplacement);

    if (!replacementName) {
        return {
            ...options,
            usernameReplacement: '',
            userNameSearchValues: [],
        };
    }

    const searchValues = Array.isArray(options.userNameSearchValues) && options.userNameSearchValues.length
        ? options.userNameSearchValues
        : collectUserNameSearchValues(replacementName);

    return {
        ...options,
        usernameReplacement: replacementName,
        userNameSearchValues: [...new Set(searchValues.map(value => String(value).trim()))]
            .filter(value => value && value !== replacementName)
            .sort((a, b) => b.length - a.length),
    };
}

function replaceUserNameText(value, options) {
    const replacementName = options.usernameReplacement;

    if (!replacementName || !options.userNameSearchValues?.length) {
        return String(value ?? '');
    }

    let text = String(value ?? '');
    for (const searchValue of options.userNameSearchValues) {
        text = text.split(searchValue).join(replacementName);
    }

    return text;
}

function shouldReplaceUserNameTextNode(node) {
    const parent = node?.parentElement;
    return !parent?.closest?.('script, style, textarea');
}

function replaceUserNamesInHtmlText(html, options) {
    if (!options.usernameReplacement || !options.userNameSearchValues?.length) {
        return html;
    }

    const template = document.createElement('template');
    template.innerHTML = String(html ?? '');

    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        if (shouldReplaceUserNameTextNode(node)) {
            node.nodeValue = replaceUserNameText(node.nodeValue, options);
        }
    }

    return template.innerHTML;
}

function replaceUserNamesInDomText(root, options) {
    if (!root || !options.usernameReplacement || !options.userNameSearchValues?.length) {
        return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        if (shouldReplaceUserNameTextNode(node)) {
            node.nodeValue = replaceUserNameText(node.nodeValue, options);
        }
    }
}

function getMessageSenderName(message, options) {
    const sender = message?.name || (message?.is_user ? name1 : name2) || 'Unknown';

    if (message?.is_user && options.usernameReplacement) {
        return options.usernameReplacement;
    }

    return sender;
}

function getMessageFormattingName(message, options) {
    if (message?.is_user && options.usernameReplacement) {
        return options.usernameReplacement;
    }

    return message?.name ?? '';
}

function getMessageClasses(message) {
    const classes = ['message'];

    if (message?.is_user) {
        classes.push('message-user');
    } else if (isSystemMessage(message)) {
        classes.push('message-system');
    } else {
        classes.push('message-character');
    }

    if (message?.extra?.type) {
        classes.push(`message-type-${String(message.extra.type).replace(/[^a-z0-9_-]/gi, '_')}`);
    }

    return classes.join(' ');
}

async function formatReasoning(message, messageId, options, signal = null) {
    throwIfExportCancelled(signal);

    const reasoning = message?.extra?.reasoning;

    if (!reasoning) {
        return '';
    }

    const reasoningHtml = messageFormatting(
        String(reasoning),
        getMessageFormattingName(message, options),
        false,
        false,
        messageId,
        {},
        true,
    );

    if (!reasoningHtml) {
        return '';
    }

    const anonymizedReasoningHtml = replaceUserNamesInHtmlText(reasoningHtml, options);
    const exportReasoningHtml = await rewriteHtmlAssetUrls(anonymizedReasoningHtml, options, signal);

    return `
                    <details class="message-reasoning">
                        <summary>Reasoning</summary>
                        <div class="message-reasoning-content mes_reasoning">${exportReasoningHtml}</div>
                    </details>`;
}

async function getAvatarHtmlAttributes(sourceUrl, options, signal = null) {
    const asset = await getRegisteredAssetReference(sourceUrl, options, 'avatar', signal);

    if (!asset.assetId) {
        return `src="${escapeHtml(asset.url)}"`;
    }

    return `src="${escapeHtml(asset.url)}" data-html-export-asset="${escapeHtml(asset.assetId)}"`;
}

async function renderMessage(message, messageId, options, signal = null) {
    throwIfExportCancelled(signal);

    if (!shouldExportMessage(message, options)) {
        return '';
    }

    const rawText = message?.extra?.display_text ?? message?.mes ?? '';
    const messageHtml = messageFormatting(
        String(rawText),
        getMessageFormattingName(message, options),
        !!message?.is_system,
        !!message?.is_user,
        messageId,
        message?.extra?.uses_system_ui ? { MESSAGE_ALLOW_SYSTEM_UI: true } : {},
        false,
    );

    const timestamp = options.includeTimestamps ? escapeHtml(message?.send_date ?? '') : '';
    const messageNumber = messageId + 1;
    const sender = escapeHtml(getMessageSenderName(message, options));
    const reasoning = options.includeReasoning ? await formatReasoning(message, messageId, options, signal) : '';
    const anonymizedMessageHtml = replaceUserNamesInHtmlText(messageHtml, options);
    const exportMessageHtml = await rewriteHtmlAssetUrls(anonymizedMessageHtml, options, signal);
    const shouldShowAvatar = shouldRenderAvatars(options);
    const avatarAttributes = shouldShowAvatar
        ? await getAvatarHtmlAttributes(getMessageAvatar(message), options, signal)
        : '';
    const avatarHtml = shouldShowAvatar
        ? `
                <div class="message-avatar">
                    <img ${avatarAttributes} alt="${sender}">
                </div>`
        : '';

    return `
            <article id="html-export-message-${messageId}" class="${getMessageClasses(message)}" data-message-id="${messageId}" data-message-number="${messageNumber}">
${avatarHtml}
                <div class="message-body">
                    <header class="message-header">
                        <span class="message-name">${sender}</span>
                        <span class="message-id">#${messageId}</span>
                        ${timestamp ? `<time class="message-time">${timestamp}</time>` : ''}
                    </header>
                    ${reasoning}
                    <div class="message-text mes_text">${exportMessageHtml}</div>
                </div>
            </article>`;
}

function normalizeTxtLineEndings(value) {
    return String(value ?? '')
        .replace(/\r\n|\r/g, '\n')
        .trimEnd();
}

function formatTxtMessageText(value, options) {
    return replaceUserNameText(normalizeTxtLineEndings(value), options);
}

function buildTxtMessageBlock(message, messageId, options) {
    if (!shouldExportMessage(message, options)) {
        return '';
    }

    const timestamp = options.includeTimestamps ? normalizeTxtLineEndings(message?.send_date ?? '') : '';
    const sender = normalizeTxtLineEndings(getMessageSenderName(message, options));
    const rawText = message?.extra?.display_text ?? message?.mes ?? '';
    const messageText = formatTxtMessageText(rawText, options);
    const headerParts = [`#${messageId}`, sender || 'Unknown'];

    if (timestamp) {
        headerParts.push(timestamp);
    }

    let block = `${headerParts.join(' | ')}\n${messageText}`;

    return block;
}

async function buildTxtExportParts(options = getExportOptions(), progressController = null, signal = null) {
    const renderOptions = normalizeUserNameReplacementOptions(options);
    const exportableMessages = getExportableMessageEntries(renderOptions);
    const messageRangeLabel = getMessageRangeLabel(renderOptions.messageRange);
    const header = [
        `Title: ${getCurrentChatTitle()}`,
        `Subject: ${getCurrentSubjectName()}`,
        `Exported: ${getExportDate()}`,
        `Messages: ${exportableMessages.length}`,
        ...(messageRangeLabel ? [`Range: ${messageRangeLabel}`] : []),
        '',
    ];
    const parts = [header.join('\n')];

    progressController?.update(0, exportableMessages.length, `Preparing TXT export for ${exportableMessages.length} messages...`);

    for (let start = 0; start < exportableMessages.length; start += EXPORT_BATCH_SIZE) {
        throwIfExportCancelled(signal);

        const batch = exportableMessages.slice(start, start + EXPORT_BATCH_SIZE);
        const blocks = [];

        for (const { message, index } of batch) {
            throwIfExportCancelled(signal);

            const block = buildTxtMessageBlock(message, index, renderOptions);
            if (block) {
                blocks.push(block);
            }
        }

        if (blocks.length) {
            parts.push(`\n${blocks.join('\n\n')}\n`);
        }

        const done = Math.min(start + batch.length, exportableMessages.length);
        progressController?.update(done, exportableMessages.length, `Prepared ${done} / ${exportableMessages.length} messages...`);
        await waitForNextFrame();
    }

    return {
        parts,
        count: exportableMessages.length,
    };
}

async function buildExportStyles(options = getExportOptions(), signal = null) {
    const style = options.style ?? STYLE_PRESETS.dark.style;
    const avatarSize = style.avatarSize || '48px';
    const hideAvatars = !shouldRenderAvatars(options);
    const avatarColumn = hideAvatars ? 'minmax(0, 1fr)' : `${avatarSize} minmax(0, 1fr)`;
    const themeStyles = options.applyCurrentTheme ? buildExtractedThemeStyles(options) : '';
    const backgroundStyles = await buildCurrentBackgroundImageStyles(options, signal);
    const customCss = await rewriteCssAssetUrlsForExport(options.customCss ?? '', options, signal);
    const customCssParts = splitCssImports(customCss);

    return `
${customCssParts.imports}

        :root {
            color-scheme: dark light;
            font-family: ${style.fontFamily};
            background: ${style.pageBackground};
            color: ${style.pageText};
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            background: ${style.pageBackground};
            color: ${style.pageText};
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize};
            line-height: ${style.lineHeight};
        }

        .export-page {
            width: min(${style.contentMaxWidth}, 100%);
            margin: 0 auto;
            padding: 24px 16px 48px;
        }

        .export-header {
            margin-bottom: 20px;
            padding-bottom: 14px;
            border-bottom: 1px solid ${style.borderColor};
        }

        .export-title {
            margin: 0 0 8px;
            font-size: 26px;
            line-height: 1.25;
        }

        .export-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            margin: 0;
            color: ${style.pageText};
            opacity: 0.72;
            font-size: 13px;
        }

        .chat-log {
            display: flex;
            flex-direction: column;
            gap: ${style.messageGap};
        }

        .export-render-status {
            margin: 0 0 12px;
            color: ${style.pageText};
            opacity: 0.72;
            font-size: 13px;
        }

        .export-navigation {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            margin: 0 0 14px;
            padding: 10px;
            border: 1px solid ${style.borderColor};
            border-radius: ${style.borderRadius};
            background: color-mix(in srgb, ${style.pageBackground} 82%, ${style.pageText} 18%);
            color: ${style.pageText};
            font-size: 13px;
        }

        .export-navigation label {
            display: inline-flex;
            gap: 6px;
            align-items: center;
        }

        .export-navigation input {
            width: 96px;
            max-width: 100%;
            padding: 5px 7px;
            border: 1px solid ${style.borderColor};
            border-radius: ${style.borderRadius};
            background: ${style.pageBackground};
            color: ${style.pageText};
            font: inherit;
        }

        .export-navigation button {
            padding: 5px 10px;
            border: 1px solid ${style.borderColor};
            border-radius: ${style.borderRadius};
            background: ${style.characterBackground};
            color: ${style.characterText};
            font: inherit;
            cursor: pointer;
        }

        .export-navigation button:disabled {
            cursor: not-allowed;
            opacity: 0.48;
        }

        .export-page-status {
            min-width: 12em;
            opacity: 0.78;
        }

        .chat-log + .export-navigation {
            margin-top: 36px;
        }

        .message {
            display: grid;
            grid-template-columns: ${avatarColumn};
            gap: 10px;
            align-items: start;
            direction: ltr;
        }

        .chat-log.align-split .message-user {
            direction: rtl;
        }

        .chat-log.align-split .message-user .message-body {
            direction: ltr;
        }

        .message-character .message-body {
            background: ${style.characterBackground};
            color: ${style.characterText};
        }

        .message-user .message-body {
            background: ${style.userBackground};
            color: ${style.userText};
        }

        .message-system .message-body {
            background: ${style.systemBackground};
            color: ${style.systemText};
            border-style: dashed;
        }

        .chat-log.hide-avatars .message-avatar {
            display: none;
        }

        .message-avatar img {
            width: ${avatarSize};
            height: ${avatarSize};
            border-radius: ${style.borderRadius};
            object-fit: cover;
            background: rgba(255, 255, 255, 0.12);
        }

        .message-body {
            min-width: 0;
            border: 1px solid ${style.borderColor};
            border-radius: ${style.borderRadius};
            padding: 10px 12px;
        }

        .message-header {
            display: flex;
            flex-wrap: wrap;
            gap: 6px 10px;
            align-items: baseline;
            margin-bottom: 8px;
        }

        .message-name {
            font-weight: 700;
        }

        .message-time {
            color: inherit;
            opacity: 0.62;
            font-size: 12px;
        }

        .message-id {
            color: inherit;
            opacity: 0.52;
            font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
            font-size: 12px;
        }

        .message-text {
            color: inherit;
            font-size: ${style.fontSize};
            line-height: ${style.lineHeight};
            overflow-wrap: anywhere;
        }

        .message-text q::before,
        .message-text q::after,
        .message-reasoning q::before,
        .message-reasoning q::after {
            content: "";
        }

        .message-text q {
            color: ${style.quoteText};
            background: ${style.quoteBackground};
            border-radius: 4px;
            padding: 0 0.35em;
        }

        .message-text blockquote,
        .message-reasoning blockquote {
            margin: 0.75em 0;
            padding: 0.75em 1em;
            border-left: ${style.quoteBlockBorderWidth} solid ${style.quoteBlockBorderColor};
            border-radius: ${style.borderRadius};
            background: ${style.quoteBlockBackground};
            color: ${style.quoteBlockText};
        }

        .message-text blockquote > :first-child,
        .message-reasoning blockquote > :first-child {
            margin-top: 0;
        }

        .message-text blockquote > :last-child,
        .message-reasoning blockquote > :last-child {
            margin-bottom: 0;
        }

        .message-text p:first-child {
            margin-top: 0;
        }

        .message-text p:last-child {
            margin-bottom: 0;
        }

        .message-text img,
        .message-text video {
            max-width: 100%;
            height: auto;
        }

        .message-text pre {
            overflow: auto;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            padding: 10px;
            border-radius: ${style.borderRadius};
            background: ${style.codeBackground};
        }

        .message-text pre code {
            white-space: inherit;
            overflow-wrap: inherit;
        }

        .message-reasoning {
            margin: 0 0 10px;
            padding: 8px;
            border-radius: ${style.borderRadius};
            background: rgba(0, 0, 0, 0.22);
        }

        .message-reasoning summary {
            cursor: pointer;
            font-weight: 700;
        }

${themeStyles}

${backgroundStyles}

${customCssParts.body}

        @media (max-width: 640px) {
            .export-page {
                padding: 16px 10px 32px;
            }

            .message {
                grid-template-columns: ${hideAvatars ? 'minmax(0, 1fr)' : `min(${avatarSize}, 40px) minmax(0, 1fr)`};
            }

            .message-avatar img {
                width: ${hideAvatars ? '0px' : `min(${avatarSize}, 40px)`};
                height: ${hideAvatars ? '0px' : `min(${avatarSize}, 40px)`};
            }

            .export-navigation {
                align-items: stretch;
                flex-direction: column;
            }

            .export-navigation label,
            .export-navigation button,
            .export-navigation input {
                width: 100%;
            }
        }
    `;
}

function normalizeRenderedMessages(renderedMessages) {
    return renderedMessages.map((message, index) => {
        if (typeof message === 'string') {
            return {
                id: index,
                number: index + 1,
                html: message,
            };
        }

        return {
            id: Number(message.id),
            number: Number(message.number),
            html: String(message.html ?? ''),
        };
    });
}

function buildExportNavigationHtml({ paginated = false } = {}) {
    return `
        <nav class="export-navigation" aria-label="HTML export navigation">
            ${paginated ? '<button type="button" class="html-export-prev-page">上一頁</button>' : ''}
            ${paginated ? '<button type="button" class="html-export-next-page">下一頁</button>' : ''}
            ${paginated ? '<span class="export-page-status html-export-page-status"></span>' : ''}
            ${paginated ? '<label>跳到頁 <input class="html-export-page-input" type="number" min="1" step="1"></label><button type="button" class="html-export-page-jump-button">前往頁面</button>' : ''}
            <label>跳到訊息 ID / 第幾則 <input class="html-export-message-jump" type="number" min="0" step="1"></label>
            <button type="button" class="html-export-message-jump-button">跳轉</button>
            <span class="export-page-status html-export-jump-status"></span>
        </nav>`;
}

function buildImmediateMessageJumpScript() {
    return `
    <script>
        (() => {
            const inputs = Array.from(document.querySelectorAll('.html-export-message-jump'));
            const buttons = Array.from(document.querySelectorAll('.html-export-message-jump-button'));
            const statuses = Array.from(document.querySelectorAll('.html-export-jump-status'));

            if (!inputs.length || !buttons.length) return;

            function findMessage(value) {
                const target = Math.trunc(Number(value));
                if (!Number.isFinite(target)) return null;

                return document.getElementById('html-export-message-' + target)
                    || document.querySelector('[data-message-number="' + target + '"]');
            }

            function setJumpStatus(text) {
                statuses.forEach(status => {
                    status.textContent = text;
                });
            }

            function syncInputs(value) {
                inputs.forEach(input => {
                    input.value = value;
                });
            }

            function jumpToMessage(value) {
                syncInputs(value);
                const element = findMessage(value);
                if (!element) {
                    setJumpStatus('找不到指定訊息');
                    return;
                }

                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setJumpStatus('已跳到 #' + element.dataset.messageId);
            }

            buttons.forEach((button, index) => {
                button.addEventListener('click', () => jumpToMessage(inputs[index]?.value ?? inputs[0]?.value));
            });

            inputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        jumpToMessage(input.value);
                    }
                });
            });
        })();
    </script>`;
}

function buildVisibleDomPaginationScript(options = getExportOptions()) {
    const pageSize = Math.max(1, Number(options.messagesPerPage) || 200);

    return `
    <script>
        (() => {
            const chatLog = document.querySelector('#chat.html-export-visible-chat') || document.getElementById('chat');
            const pageStatuses = Array.from(document.querySelectorAll('.html-export-page-status'));
            const jumpStatuses = Array.from(document.querySelectorAll('.html-export-jump-status'));
            const prevButtons = Array.from(document.querySelectorAll('.html-export-prev-page'));
            const nextButtons = Array.from(document.querySelectorAll('.html-export-next-page'));
            const pageInputs = Array.from(document.querySelectorAll('.html-export-page-input'));
            const pageButtons = Array.from(document.querySelectorAll('.html-export-page-jump-button'));
            const messageInputs = Array.from(document.querySelectorAll('.html-export-message-jump'));
            const messageButtons = Array.from(document.querySelectorAll('.html-export-message-jump-button'));

            if (!chatLog) return;

            const staticChildren = Array.from(chatLog.children).filter(element => !element.classList.contains('mes'));
            const records = Array.from(chatLog.children)
                .filter(element => element.classList.contains('mes'))
                .map((element, index) => ({
                    element,
                    id: Number(element.dataset.messageId),
                    number: Number(element.dataset.messageNumber || index + 1),
                }));
            const pageSize = ${pageSize};
            const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
            let currentPage = 1;

            function clampPage(page) {
                const value = Math.trunc(Number(page));
                if (!Number.isFinite(value)) return currentPage;
                return Math.min(Math.max(value, 1), totalPages);
            }

            function updateControls(start, end) {
                pageStatuses.forEach(pageStatus => {
                    pageStatus.textContent = records.length
                        ? '第 ' + currentPage + ' / ' + totalPages + ' 頁，顯示 ' + (start + 1) + '-' + end + ' / ' + records.length
                        : '沒有可顯示的訊息';
                });

                pageInputs.forEach(pageInput => {
                    pageInput.value = String(currentPage);
                    pageInput.max = String(totalPages);
                });

                prevButtons.forEach(button => {
                    button.disabled = currentPage <= 1;
                });
                nextButtons.forEach(button => {
                    button.disabled = currentPage >= totalPages;
                });
            }

            function setJumpStatus(text) {
                jumpStatuses.forEach(status => {
                    status.textContent = text;
                });
            }

            function syncMessageInputs(value) {
                messageInputs.forEach(input => {
                    input.value = value;
                });
            }

            function renderPage(page, focusMessageId = null) {
                currentPage = clampPage(page);
                const start = (currentPage - 1) * pageSize;
                const end = Math.min(start + pageSize, records.length);
                chatLog.replaceChildren(...staticChildren, ...records.slice(start, end).map(record => record.element));
                window.htmlExportApplyAssets?.();
                updateControls(start, end);

                if (focusMessageId !== null) {
                    window.requestAnimationFrame(() => {
                        const element = document.getElementById('html-export-message-' + focusMessageId);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            function findMessageRecord(value) {
                const target = Math.trunc(Number(value));
                if (!Number.isFinite(target)) return null;

                const index = records.findIndex(record => record.id === target);
                if (index !== -1) {
                    return { index, record: records[index] };
                }

                const numberIndex = records.findIndex(record => record.number === target);
                return numberIndex === -1 ? null : { index: numberIndex, record: records[numberIndex] };
            }

            function jumpToMessage(value) {
                syncMessageInputs(value);
                const found = findMessageRecord(value);
                if (!found) {
                    setJumpStatus('找不到指定訊息');
                    return;
                }

                const page = Math.floor(found.index / pageSize) + 1;
                renderPage(page, found.record.id);
                setJumpStatus('已跳到 #' + found.record.id);
            }

            prevButtons.forEach(button => {
                button.addEventListener('click', () => renderPage(currentPage - 1));
            });
            nextButtons.forEach(button => {
                button.addEventListener('click', () => renderPage(currentPage + 1));
            });
            pageButtons.forEach((button, index) => {
                button.addEventListener('click', () => renderPage(pageInputs[index]?.value ?? pageInputs[0]?.value));
            });
            pageInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        renderPage(input.value);
                    }
                });
            });
            messageButtons.forEach((button, index) => {
                button.addEventListener('click', () => jumpToMessage(messageInputs[index]?.value ?? messageInputs[0]?.value));
            });
            messageInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        jumpToMessage(input.value);
                    }
                });
            });

            renderPage(1);
        })();
    </script>`;
}

function buildMessageRendererHtml(renderedMessages, options) {
    const messages = normalizeRenderedMessages(renderedMessages);

    if (options.paginateMessages) {
        const pageSize = Math.max(1, Number(options.messagesPerPage) || 200);
        const messagesJson = JSON.stringify(messages).replace(/</g, '\\u003c');

        return {
            statusHtml: buildExportNavigationHtml({ paginated: true }),
            footerHtml: buildExportNavigationHtml({ paginated: true }),
            messagesHtml: '',
            scriptHtml: `
    <script type="application/json" id="html-export-messages">${messagesJson}</script>
    <script>
        (() => {
            const messagesElement = document.getElementById('html-export-messages');
            const chatLog = document.querySelector('.chat-log');
            const pageStatuses = Array.from(document.querySelectorAll('.html-export-page-status'));
            const jumpStatuses = Array.from(document.querySelectorAll('.html-export-jump-status'));
            const prevButtons = Array.from(document.querySelectorAll('.html-export-prev-page'));
            const nextButtons = Array.from(document.querySelectorAll('.html-export-next-page'));
            const pageInputs = Array.from(document.querySelectorAll('.html-export-page-input'));
            const pageButtons = Array.from(document.querySelectorAll('.html-export-page-jump-button'));
            const messageInputs = Array.from(document.querySelectorAll('.html-export-message-jump'));
            const messageButtons = Array.from(document.querySelectorAll('.html-export-message-jump-button'));

            if (!messagesElement || !chatLog) return;

            const messages = JSON.parse(messagesElement.textContent || '[]');
            const pageSize = ${pageSize};
            const totalPages = Math.max(1, Math.ceil(messages.length / pageSize));
            let currentPage = 1;

            function clampPage(page) {
                const value = Math.trunc(Number(page));
                if (!Number.isFinite(value)) return currentPage;
                return Math.min(Math.max(value, 1), totalPages);
            }

            function updateControls(start, end) {
                pageStatuses.forEach(pageStatus => {
                    pageStatus.textContent = messages.length
                        ? '第 ' + currentPage + ' / ' + totalPages + ' 頁，顯示 ' + (start + 1) + '-' + end + ' / ' + messages.length
                        : '沒有可顯示的訊息';
                });

                pageInputs.forEach(pageInput => {
                    pageInput.value = String(currentPage);
                    pageInput.max = String(totalPages);
                });

                prevButtons.forEach(button => {
                    button.disabled = currentPage <= 1;
                });
                nextButtons.forEach(button => {
                    button.disabled = currentPage >= totalPages;
                });
            }

            function setJumpStatus(text) {
                jumpStatuses.forEach(status => {
                    status.textContent = text;
                });
            }

            function syncMessageInputs(value) {
                messageInputs.forEach(input => {
                    input.value = value;
                });
            }

            function renderPage(page, focusMessageId = null) {
                currentPage = clampPage(page);
                const start = (currentPage - 1) * pageSize;
                const end = Math.min(start + pageSize, messages.length);
                const template = document.createElement('template');
                template.innerHTML = messages.slice(start, end).map(message => message.html).join('\\n');
                chatLog.replaceChildren(template.content);
                window.htmlExportApplyAssets?.();
                updateControls(start, end);

                if (focusMessageId !== null) {
                    window.requestAnimationFrame(() => {
                        const element = document.getElementById('html-export-message-' + focusMessageId);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            function findMessageRecord(value) {
                const target = Math.trunc(Number(value));
                if (!Number.isFinite(target)) return null;

                const idIndex = messages.findIndex(message => message.id === target);
                if (idIndex !== -1) {
                    return { index: idIndex, message: messages[idIndex] };
                }

                const numberIndex = messages.findIndex(message => message.number === target);
                return numberIndex === -1 ? null : { index: numberIndex, message: messages[numberIndex] };
            }

            function jumpToMessage(value) {
                syncMessageInputs(value);
                const record = findMessageRecord(value);
                if (!record) {
                    setJumpStatus('找不到指定訊息');
                    return;
                }

                const page = Math.floor(record.index / pageSize) + 1;
                renderPage(page, record.message.id);
                setJumpStatus('已跳到 #' + record.message.id);
            }

            prevButtons.forEach(button => {
                button.addEventListener('click', () => renderPage(currentPage - 1));
            });
            nextButtons.forEach(button => {
                button.addEventListener('click', () => renderPage(currentPage + 1));
            });
            pageButtons.forEach((button, index) => {
                button.addEventListener('click', () => renderPage(pageInputs[index]?.value ?? pageInputs[0]?.value));
            });
            pageInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        renderPage(input.value);
                    }
                });
            });
            messageButtons.forEach((button, index) => {
                button.addEventListener('click', () => jumpToMessage(messageInputs[index]?.value ?? messageInputs[0]?.value));
            });
            messageInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        jumpToMessage(input.value);
                    }
                });
            });

            renderPage(1);
        })();
    </script>`,
        };
    }

    if (!options.lazyRenderMessages) {
        return {
            statusHtml: buildExportNavigationHtml(),
            footerHtml: buildExportNavigationHtml(),
            messagesHtml: messages.map(message => message.html).join('\n'),
            scriptHtml: buildImmediateMessageJumpScript(),
        };
    }

    const batchSize = Math.max(1, Number(options.lazyRenderBatchSize) || 80);
    const messagesJson = JSON.stringify(messages).replace(/</g, '\\u003c');

    return {
        statusHtml: `
${buildExportNavigationHtml()}
        <div class="export-render-status" id="html-export-render-status">正在載入訊息 0 / ${messages.length}</div>`,
        footerHtml: buildExportNavigationHtml(),
        messagesHtml: '',
        scriptHtml: `
    <script type="application/json" id="html-export-messages">${messagesJson}</script>
    <script>
        (() => {
            const messagesElement = document.getElementById('html-export-messages');
            const chatLog = document.querySelector('.chat-log');
            const status = document.getElementById('html-export-render-status');
            const jumpStatuses = Array.from(document.querySelectorAll('.html-export-jump-status'));
            const messageInputs = Array.from(document.querySelectorAll('.html-export-message-jump'));
            const messageButtons = Array.from(document.querySelectorAll('.html-export-message-jump-button'));

            if (!messagesElement || !chatLog) return;

            const messages = JSON.parse(messagesElement.textContent || '[]');
            const batchSize = ${batchSize};
            let index = 0;
            let scheduled = false;

            const schedule = window.requestIdleCallback
                ? callback => window.requestIdleCallback(callback, { timeout: 100 })
                : callback => window.setTimeout(callback, 0);

            function updateStatus() {
                if (!status) return;
                status.textContent = index < messages.length
                    ? '正在載入訊息 ' + index + ' / ' + messages.length
                    : '已顯示 ' + messages.length + ' 則訊息';
            }

            function renderBatch(continueScheduling = true) {
                scheduled = false;
                const end = Math.min(index + batchSize, messages.length);
                const template = document.createElement('template');
                template.innerHTML = messages.slice(index, end).map(message => message.html).join('\\n');
                chatLog.append(template.content);
                window.htmlExportApplyAssets?.();
                index = end;
                updateStatus();

                if (continueScheduling && index < messages.length) {
                    scheduleRender();
                }
            }

            function scheduleRender() {
                if (scheduled || index >= messages.length) return;
                scheduled = true;
                schedule(() => renderBatch(true));
            }

            function findMessageRecord(value) {
                const target = Math.trunc(Number(value));
                if (!Number.isFinite(target)) return null;

                const idIndex = messages.findIndex(message => message.id === target);
                if (idIndex !== -1) {
                    return { index: idIndex, message: messages[idIndex] };
                }

                const numberIndex = messages.findIndex(message => message.number === target);
                return numberIndex === -1 ? null : { index: numberIndex, message: messages[numberIndex] };
            }

            function setJumpStatus(text) {
                jumpStatuses.forEach(status => {
                    status.textContent = text;
                });
            }

            function syncMessageInputs(value) {
                messageInputs.forEach(input => {
                    input.value = value;
                });
            }

            function renderThrough(targetIndex) {
                while (index <= targetIndex && index < messages.length) {
                    renderBatch(false);
                }
            }

            function jumpToMessage(value) {
                syncMessageInputs(value);
                const record = findMessageRecord(value);
                if (!record) {
                    setJumpStatus('找不到指定訊息');
                    return;
                }

                renderThrough(record.index);
                const element = document.getElementById('html-export-message-' + record.message.id);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setJumpStatus('已跳到 #' + record.message.id);
                scheduleRender();
            }

            messageButtons.forEach((button, index) => {
                button.addEventListener('click', () => jumpToMessage(messageInputs[index]?.value ?? messageInputs[0]?.value));
            });
            messageInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        jumpToMessage(input.value);
                    }
                });
            });

            renderBatch(true);
        })();
    </script>`,
    };
}

function getHighFidelityInlineStyle(element, options = getExportOptions()) {
    const style = window.getComputedStyle(element);

    return HIGH_FIDELITY_STYLE_PROPS
        .map(property => [property, style.getPropertyValue(property)])
        .filter(([property]) => options.includeBackgroundImage || property !== 'background-image')
        .filter(([, value]) => value)
        .map(([property, value]) => `${property}: ${rewriteCssAssetUrls(value)};`)
        .join(' ');
}

async function inlineHighFidelityStyles(sourceRoot, cloneRoot, progressController = null, signal = null, options = getExportOptions()) {
    const sourceElements = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
    const cloneElements = [cloneRoot, ...cloneRoot.querySelectorAll('*')];
    const total = Math.min(sourceElements.length, cloneElements.length);

    for (let index = 0; index < total; index += 100) {
        throwIfExportCancelled(signal);

        const end = Math.min(index + 100, total);
        for (let current = index; current < end; current++) {
            const inlineStyle = getHighFidelityInlineStyle(sourceElements[current], options);
            if (inlineStyle) {
                cloneElements[current].setAttribute('style', inlineStyle);
            }
        }

        progressController?.update(end, total, `正在抽取畫面樣式 ${end} / ${total}`);
        await waitForNextFrame();
    }

    cloneRoot.style.height = 'auto';
    cloneRoot.style.maxHeight = 'none';
    cloneRoot.style.overflow = 'visible';
}

function pruneHighFidelityClone(cloneRoot) {
    for (const selector of HIGH_FIDELITY_REMOVE_SELECTORS) {
        cloneRoot.querySelectorAll(selector).forEach(element => element.remove());
    }

    cloneRoot.querySelectorAll('[contenteditable="true"]').forEach(element => {
        element.removeAttribute('contenteditable');
    });

    cloneRoot.querySelectorAll('[style]').forEach(element => {
        const style = element.getAttribute('style') ?? '';
        element.setAttribute('style', style
            .replace(/cursor:\s*pointer;?/gi, '')
            .replace(/user-select:\s*none;?/gi, ''));
    });
}

function collectCssCustomProperties(element, options = getExportOptions()) {
    if (!element) {
        return {};
    }

    const style = window.getComputedStyle(element);
    const properties = {};

    for (let index = 0; index < style.length; index++) {
        const property = style[index];
        if (property?.startsWith('--')) {
            const value = style.getPropertyValue(property);
            if (value) {
                if (!options.includeBackgroundImage && /url\(/i.test(value)) {
                    continue;
                }

                properties[property] = rewriteCssAssetUrls(value);
            }
        }
    }

    return properties;
}

function buildHighFidelityCssVariableSnapshot(options = getExportOptions()) {
    const chatElement = document.getElementById('chat');

    return [
        cssBlock(':root', collectCssCustomProperties(document.documentElement, options)),
        cssBlock('body', collectCssCustomProperties(document.body, options)),
        cssBlock('#chat', collectCssCustomProperties(chatElement, options)),
    ].filter(Boolean).join('\n');
}

function getStylesheetSourceName(styleSheet) {
    const owner = styleSheet.ownerNode;

    if (styleSheet.href) {
        return styleSheet.href;
    }

    if (owner?.id) {
        return `#${owner.id}`;
    }

    const className = typeof owner?.className === 'string' ? owner.className.trim() : '';
    if (className) {
        return `.${className.split(/\s+/).join('.')}`;
    }

    return '';
}

function isHighFidelityExtensionStylesheet(styleSheet) {
    const owner = styleSheet.ownerNode;
    const source = getStylesheetSourceName(styleSheet);

    if (owner?.id && HIGH_FIDELITY_EXTENSION_STYLE_IDS.includes(owner.id)) {
        return true;
    }

    return HIGH_FIDELITY_EXTENSION_STYLESHEET_PATTERNS.some(pattern => source.includes(pattern));
}

async function readStylesheetCssText(styleSheet, signal = null) {
    throwIfExportCancelled(signal);

    try {
        return Array.from(styleSheet.cssRules ?? [])
            .map(rule => rule.cssText)
            .filter(Boolean)
            .join('\n');
    } catch (error) {
        if (!styleSheet.href || !isSameOriginAsset(styleSheet.href)) {
            console.warn(`[${EXTENSION_NAME}] Could not read stylesheet rules: ${getStylesheetSourceName(styleSheet)}`, error);
            return '';
        }

        try {
            const response = await fetch(styleSheet.href, {
                credentials: 'include',
                cache: 'force-cache',
                signal,
            });

            if (!response.ok) {
                console.warn(`[${EXTENSION_NAME}] Could not fetch stylesheet: ${styleSheet.href} (${response.status})`);
                return '';
            }

            return response.text();
        } catch (fetchError) {
            if (isAbortError(fetchError)) {
                throw fetchError;
            }

            console.warn(`[${EXTENSION_NAME}] Could not fetch stylesheet: ${styleSheet.href}`, fetchError);
            return '';
        }
    }
}

async function buildHighFidelityExtensionStyles(options, signal = null) {
    if (!options.includeVisibleDomExtensionCss) {
        return '';
    }

    const chunks = [];

    for (const styleSheet of Array.from(document.styleSheets)) {
        throwIfExportCancelled(signal);

        if (styleSheet.disabled || !isHighFidelityExtensionStylesheet(styleSheet)) {
            continue;
        }

        const source = getStylesheetSourceName(styleSheet);
        const cssText = await readStylesheetCssText(styleSheet, signal);
        if (!cssText.trim()) {
            continue;
        }

        const rewrittenCss = await rewriteCssAssetUrlsForExport(cssText, options, signal, styleSheet.href || window.location.href);
        chunks.push(`/* ${source || 'inline extension stylesheet'} */\n${rewrittenCss}`);
    }

    return chunks.join('\n\n');
}

function buildHighFidelityBodyAttributes() {
    const attributes = [];

    if (document.body.className) {
        attributes.push(`class="${escapeHtml(document.body.className)}"`);
    }

    for (const [key, value] of Object.entries(document.body.dataset ?? {})) {
        if (/^[a-zA-Z0-9_-]+$/.test(key)) {
            const attributeName = key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
            attributes.push(`data-${attributeName}="${escapeHtml(value)}"`);
        }
    }

    return attributes.length ? ` ${attributes.join(' ')}` : '';
}

function buildHighFidelityShellAttributes() {
    const sourceShell = document.getElementById('sheld');
    const shellClasses = ['html-export-visible-shell'];

    if (sourceShell?.className) {
        shellClasses.push(...String(sourceShell.className).split(/\s+/).filter(Boolean));
    }

    return `id="sheld" class="${escapeHtml([...new Set(shellClasses)].join(' '))}"`;
}

function buildHighFidelityEnvironmentMarkers() {
    return HIGH_FIDELITY_ENVIRONMENT_MARKER_IDS
        .filter(id => document.getElementById(id))
        .map(id => `<div id="${id}" class="html-export-theme-marker" hidden></div>`)
        .join('\n');
}

async function buildHighFidelityBaseStyles(options = getExportOptions(), signal = null) {
    const backgroundStyles = getBackgroundStyle(options);
    const bodyStyles = cssBlock('body', mergeDeclarations(
        readStyleProperties(document.body, TEXT_STYLE_PROPS),
        backgroundStyles,
    ));
    const cssVariableSnapshot = buildHighFidelityCssVariableSnapshot(options);

    const css = `
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
        }

        .html-export-visible-page {
            display: block !important;
            position: relative !important;
            z-index: 0 !important;
            width: min(100%, 1400px);
            margin: 0 auto;
            padding: 16px;
        }

        .html-export-visible-shell {
            display: block !important;
            position: relative !important;
            z-index: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 18px 0 0 !important;
            padding: 0 !important;
            overflow: visible !important;
        }

        #sheld.html-export-visible-shell {
            display: block !important;
            position: relative !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            left: auto !important;
            z-index: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 18px 0 0 !important;
            padding: 0 !important;
            overflow: visible !important;
        }

        .html-export-theme-marker {
            display: none !important;
        }

        .html-export-visible-note {
            margin: 0 0 12px;
            padding: 10px 12px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.38);
            color: #fff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 13px;
            line-height: 1.45;
        }

        .export-navigation {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            position: relative !important;
            z-index: 20;
            clear: both;
            flex: 0 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 0 12px;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.38);
            color: #fff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 13px;
            line-height: 1.45;
            isolation: isolate;
        }

        .export-navigation label {
            display: inline-flex;
            gap: 6px;
            align-items: center;
        }

        .export-navigation input {
            width: 96px;
            max-width: 100%;
            padding: 5px 7px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.44);
            color: #fff;
            font: inherit;
        }

        .export-navigation button {
            padding: 5px 10px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
            font: inherit;
            cursor: pointer;
        }

        .export-page-status {
            min-width: 12em;
            opacity: 0.82;
        }

        .html-export-visible-shell + .export-navigation {
            margin-top: 36px !important;
            margin-bottom: 0 !important;
        }

        .html-export-visible-chat {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            position: relative !important;
            inset: auto !important;
            transform: none !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            overflow: visible !important;
        }

        #chat.html-export-visible-chat {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            position: relative !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            left: auto !important;
            transform: none !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            overflow: visible !important;
        }

        .html-export-visible-chat::after {
            content: "";
            display: block;
            clear: both;
        }

        .html-export-visible-chat .mes {
            position: relative !important;
            flex: 0 0 auto !important;
            max-width: 100% !important;
            min-height: 0 !important;
        }

        #chat.html-export-visible-chat .mes {
            position: relative !important;
            flex: 0 0 auto !important;
            max-width: 100% !important;
            min-height: 0 !important;
        }

        .html-export-visible-message-id {
            display: inline-flex !important;
            align-items: center !important;
            margin-left: 0.5em !important;
            padding: 0.08em 0.38em !important;
            border-radius: 8px !important;
            background: rgba(0, 0, 0, 0.28) !important;
            color: inherit !important;
            font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace !important;
            font-size: 0.78em !important;
            line-height: 1.35 !important;
            opacity: 0.78 !important;
            white-space: nowrap !important;
            vertical-align: baseline !important;
        }

        .html-export-visible-chat img,
        .html-export-visible-chat video {
            max-width: 100%;
        }

        .html-export-visible-chat q::before,
        .html-export-visible-chat q::after {
            content: "";
        }

        .html-export-visible-chat .icon-svg.timestamp-icon,
        .html-export-visible-chat .icon-svg.thinking-icon {
            display: none !important;
        }

        @media (max-width: 640px) {
            .export-navigation {
                align-items: stretch;
                flex-direction: column;
            }

            .export-navigation label,
            .export-navigation button,
            .export-navigation input {
                width: 100%;
            }
        }

        ${options.includeBackgroundImage ? '' : `
        body,
        #chat,
        .html-export-visible-page,
        .html-export-visible-shell {
            background-image: none !important;
        }`}

${cssVariableSnapshot}

${bodyStyles}`;

    return rewriteCssAssetUrlsForExport(css, options, signal, window.location.href, 'background');
}

function insertVisibleDomMessageIdBadge(message, idBadge) {
    message.querySelectorAll('.html-export-visible-message-id').forEach(existingBadge => existingBadge.remove());

    const timestamp = message.querySelector('.ch_name .timestamp');
    if (timestamp?.parentElement) {
        timestamp.insertAdjacentElement('afterend', idBadge);
        return;
    }

    const nameText = message.querySelector('.ch_name .name_text');
    if (nameText?.parentElement) {
        nameText.insertAdjacentElement('afterend', idBadge);
        return;
    }

    const titleRow = message.querySelector(
        '.ch_name .alignItemsBaseline, .ch_name .alignitemscenter, .ch_name .alignItemsCenter, .ch_name .flex-container, .ch_name',
    );
    if (titleRow) {
        titleRow.append(idBadge);
        return;
    }

    const messageBlock = message.querySelector('.mes_block') || message;
    messageBlock.prepend(idBadge);
}

function prepareVisibleDomJumpTargets(clone) {
    const messages = Array.from(clone.querySelectorAll('.mes'));

    messages.forEach((message, index) => {
        const rawMessageId = message.getAttribute('mesid');
        const numericMessageId = Number(rawMessageId);
        const messageId = Number.isFinite(numericMessageId) ? numericMessageId : index;
        const messageNumber = index + 1;

        message.id = `html-export-message-${messageId}`;
        message.dataset.messageId = String(messageId);
        message.dataset.messageNumber = String(messageNumber);

        const idBadge = document.createElement('span');
        idBadge.classList.add('html-export-visible-message-id');
        idBadge.textContent = `#${messageId}`;
        idBadge.title = `Message ID ${messageId}`;

        insertVisibleDomMessageIdBadge(message, idBadge);
    });

    return messages.length;
}

async function buildVisibleDomExportHtml(options = getExportOptions(), progressController = null, signal = null) {
    const chatElement = document.getElementById('chat');
    if (!chatElement) {
        throw new Error('Could not find #chat for visible DOM export.');
    }

    const title = getCurrentChatTitle();
    const subject = getCurrentSubjectName();
    const exportDate = getExportDate();
    const assetRegistry = createAssetRegistry();
    const renderOptions = normalizeUserNameReplacementOptions({
        ...options,
        assetRegistry,
    });
    const clone = chatElement.cloneNode(true);

    clone.id = 'chat';
    clone.classList.add('html-export-visible-chat');

    await inlineHighFidelityStyles(chatElement, clone, progressController, signal, renderOptions);
    pruneHighFidelityClone(clone);
    const visibleMessageCount = prepareVisibleDomJumpTargets(clone);
    replaceUserNamesInDomText(clone, renderOptions);

    progressController?.update(1, 1, '正在處理畫面樣式匯出的圖片與樣式...');
    const extensionStyles = await buildHighFidelityExtensionStyles(renderOptions, signal);
    const extensionStyleAssetsAttribute = extensionStyles.includes('--html-export-asset-')
        ? ' data-html-export-style-assets="true"'
        : '';
    const baseStyles = await buildHighFidelityBaseStyles(renderOptions, signal);
    const baseStyleAssetsAttribute = baseStyles.includes('--html-export-asset-')
        ? ' data-html-export-style-assets="true"'
        : '';
    const cloneHtml = await rewriteHtmlAssetUrls(clone.outerHTML, renderOptions, signal);
    const assetRegistryHtml = buildAssetRegistryHtml(assetRegistry);
    const environmentMarkers = buildHighFidelityEnvironmentMarkers();
    const bodyAttributes = buildHighFidelityBodyAttributes();
    const shellAttributes = buildHighFidelityShellAttributes();
    const navigationHtml = buildExportNavigationHtml({ paginated: !!renderOptions.paginateMessages });
    const navigationScript = renderOptions.paginateMessages
        ? buildVisibleDomPaginationScript(renderOptions)
        : buildImmediateMessageJumpScript();
    const metadata = {
        characterName: subject,
        chatName: title,
        exportDate,
        exportMode: 'visibleDom',
        visibleMessageCount,
        paginated: !!renderOptions.paginateMessages,
    };

    return `<!doctype html>
<html lang="zh-Hant">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Screen Style HTML Export</title>
    <style data-html-export-extension-css${extensionStyleAssetsAttribute}>${escapeStyleTagContent(extensionStyles)}</style>
    <style${baseStyleAssetsAttribute}>${escapeStyleTagContent(baseStyles)}</style>
    <script type="application/json" id="html-export-metadata">${JSON.stringify(metadata).replace(/</g, '\\u003c')}</script>
</head>
<body${bodyAttributes}>
${environmentMarkers}
    <main class="html-export-visible-page">
        <div class="html-export-visible-note">
            畫面樣式匯出只包含目前 SillyTavern 已顯示在畫面中的聊天室內容；若 ST 只載入最後一部分訊息，未顯示的舊訊息不會包含在此檔案中。
        </div>
${navigationHtml}
        <div ${shellAttributes}>
${cloneHtml}
        </div>
${navigationHtml}
    </main>
${assetRegistryHtml}
${navigationScript}
</body>
</html>`;
}

async function buildExportHtml(options = getExportOptions(), progressController = null, signal = null) {
    const title = getCurrentChatTitle();
    const subject = getCurrentSubjectName();
    const exportDate = getExportDate();
    const assetRegistry = createAssetRegistry();
    const renderOptions = normalizeUserNameReplacementOptions({
        ...options,
        assetRegistry,
    });
    const exportableMessages = getExportableMessageEntries(renderOptions);
    const renderedMessages = [];
    const messageRangeLabel = getMessageRangeLabel(renderOptions.messageRange);

    progressController?.update(0, exportableMessages.length, `正在準備匯出 ${exportableMessages.length} 則訊息...`);

    for (let start = 0; start < exportableMessages.length; start += EXPORT_BATCH_SIZE) {
        throwIfExportCancelled(signal);

        const batch = exportableMessages.slice(start, start + EXPORT_BATCH_SIZE);

        for (const { message, index } of batch) {
            throwIfExportCancelled(signal);

            const renderedMessage = await renderMessage(message, index, renderOptions, signal);
            if (renderedMessage) {
                renderedMessages.push({
                    id: index,
                    number: index + 1,
                    html: renderedMessage,
                });
            }
        }

        const done = Math.min(start + batch.length, exportableMessages.length);
        progressController?.update(done, exportableMessages.length, `已處理 ${done} / ${exportableMessages.length} 則訊息`);
        await waitForNextFrame();
    }

    const alignmentClass = options.alignment === 'split' ? 'align-split' : 'align-left';
    const avatarClass = shouldRenderAvatars(options) ? '' : ' hide-avatars';
    const messageRendererHtml = buildMessageRendererHtml(renderedMessages, options);
    const exportStyles = await buildExportStyles(renderOptions, signal);
    const exportStyleAssetsAttribute = exportStyles.includes('--html-export-asset-')
        ? ' data-html-export-style-assets="true"'
        : '';
    const assetRegistryHtml = buildAssetRegistryHtml(assetRegistry);
    const headerHtml = options.showMetadata
        ? `
        <header class="export-header">
            <h1 class="export-title">${escapeHtml(title)}</h1>
            <p class="export-meta">
                <span>角色：${escapeHtml(subject)}</span>
                <span>聊天室：${escapeHtml(title)}</span>
                <span>匯出日期：${escapeHtml(exportDate)}</span>
                <span>訊息數：${renderedMessages.length}</span>
                ${messageRangeLabel ? `<span>訊息範圍：${escapeHtml(messageRangeLabel)}</span>` : ''}
            </p>
        </header>`
        : '';

    return `<!doctype html>
<html lang="zh-Hant">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - HTML Export</title>
    <style${exportStyleAssetsAttribute}>${escapeStyleTagContent(exportStyles)}</style>
    <script type="application/json" id="html-export-metadata">${JSON.stringify({
        characterName: subject,
        chatName: title,
        exportDate,
        messageCount: renderedMessages.length,
        messageRange: messageRangeLabel,
    }).replace(/</g, '\\u003c')}</script>
</head>
<body>
    <main class="export-page">
${headerHtml}
${messageRendererHtml.statusHtml}
        <section class="chat-log ${alignmentClass}${avatarClass}">
${messageRendererHtml.messagesHtml}
        </section>
${messageRendererHtml.footerHtml ?? ''}
    </main>
${assetRegistryHtml}
${messageRendererHtml.scriptHtml}
</body>
</html>`;
}

function downloadHtml(html, chatTitle) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(chatTitle)}.html`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadTextFile(parts, chatTitle) {
    const blob = new Blob(parts, { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(chatTitle)}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportCurrentChatAsHtml(options = getExportOptions()) {
    if (!Array.isArray(chat) || chat.length === 0) {
        toastr.warning('目前沒有可匯出的聊天室。', 'HTML Export');
        return '';
    }

    if (activeExportController) {
        toastr.warning('HTML Export 目前已有匯出工作正在進行。', 'HTML Export');
        return '';
    }

    const chatTitle = getCurrentChatTitle();
    const isVisibleDomMode = options.exportMode === 'visibleDom';
    const exportedCount = isVisibleDomMode
        ? document.querySelectorAll('#chat .mes').length
        : getExportableMessageEntries(options).length;
    const abortController = new AbortController();
    const progressController = createProgressController(exportedCount, abortController);

    activeExportController = abortController;
    assetDataUrlCache.clear();

    let html = '';

    try {
        html = isVisibleDomMode
            ? await buildVisibleDomExportHtml(options, progressController, abortController.signal)
            : await buildExportHtml(options, progressController, abortController.signal);
        throwIfExportCancelled(abortController.signal);

        progressController.update(exportedCount, exportedCount, '正在建立下載檔案...');
        await waitForNextFrame();
        downloadHtml(html, chatTitle);

        console.info(`[${EXTENSION_NAME}] Exported ${exportedCount} ${isVisibleDomMode ? 'visible DOM' : 'chat'} messages from "${chatTitle}".`);
        toastr.success(isVisibleDomMode ? `已匯出 ${exportedCount} 則畫面訊息。` : `已匯出 ${exportedCount} 則訊息。`, 'HTML Export');
    } catch (error) {
        if (isAbortError(error)) {
            console.info(`[${EXTENSION_NAME}] Export cancelled.`);
            toastr.info('已取消 HTML 匯出。', 'HTML Export');
        } else {
            console.error(`[${EXTENSION_NAME}] Export failed.`, error);
            toastr.error('HTML 匯出失敗，請查看瀏覽器 console。', 'HTML Export');
        }
    } finally {
        progressController.close();
        assetDataUrlCache.clear();
        html = '';
        activeExportController = null;
    }

    return '';
}

async function exportCurrentChatAsTxt(options = getExportOptions()) {
    if (!Array.isArray(chat) || chat.length === 0) {
        toastr.warning('No chat is loaded to export.', 'TXT Export');
        return '';
    }

    if (activeExportController) {
        toastr.warning('An export is already running.', 'TXT Export');
        return '';
    }

    const chatTitle = getCurrentChatTitle();
    const exportedCount = getExportableMessageEntries(options).length;
    const abortController = new AbortController();
    const progressController = createProgressController(exportedCount, abortController);

    activeExportController = abortController;

    let txtParts = [];

    try {
        const result = await buildTxtExportParts(options, progressController, abortController.signal);
        throwIfExportCancelled(abortController.signal);

        txtParts = result.parts;
        progressController.update(result.count, result.count, 'Downloading TXT file...');
        await waitForNextFrame();
        downloadTextFile(txtParts, chatTitle);

        console.info(`[${EXTENSION_NAME}] Exported ${result.count} chat messages as TXT from "${chatTitle}".`);
        toastr.success(`Exported ${result.count} messages as TXT.`, 'TXT Export');
    } catch (error) {
        if (isAbortError(error)) {
            console.info(`[${EXTENSION_NAME}] TXT export cancelled.`);
            toastr.info('TXT export cancelled.', 'TXT Export');
        } else {
            console.error(`[${EXTENSION_NAME}] TXT export failed.`, error);
            toastr.error('TXT export failed. Check the browser console for details.', 'TXT Export');
        }
    } finally {
        progressController.close();
        txtParts = [];
        activeExportController = null;
    }

    return '';
}

function addExtensionMenuButton() {
    const extensionsMenu = document.getElementById('extensionsMenu');
    if (!extensionsMenu) {
        console.warn(`[${EXTENSION_NAME}] Could not find #extensionsMenu.`);
        return;
    }

    if (!document.getElementById(BUTTON_ID)) {
        const button = document.createElement('div');
        button.id = BUTTON_ID;
        button.classList.add('list-group-item', 'flex-container', 'flexGap5', 'html_export_menu_button');
        button.title = 'Export the current chat as HTML.';

        const icon = document.createElement('div');
        icon.classList.add('fa-solid', 'fa-file-export', 'extensionsMenuExtensionButton');

        const label = document.createElement('span');
        label.textContent = 'Export HTML';

        button.append(icon, label);
        button.addEventListener('click', () => {
            exportCurrentChatAsHtml();
        });

        extensionsMenu.append(button);
    }

    if (!document.getElementById(TXT_BUTTON_ID)) {
        const txtButton = document.createElement('div');
        txtButton.id = TXT_BUTTON_ID;
        txtButton.classList.add('list-group-item', 'flex-container', 'flexGap5', 'html_export_menu_button');
        txtButton.title = 'Export the current chat as TXT.';

        const txtIcon = document.createElement('div');
        txtIcon.classList.add('fa-solid', 'fa-file-lines', 'extensionsMenuExtensionButton');

        const txtLabel = document.createElement('span');
        txtLabel.textContent = 'Export TXT';

        txtButton.append(txtIcon, txtLabel);
        txtButton.addEventListener('click', () => {
            exportCurrentChatAsTxt();
        });

        extensionsMenu.append(txtButton);
    }
}

function registerSlashCommands() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'html-export',
        aliases: ['hexport'],
        callback: async (args, rangeInput) => {
            let messageRange = null;

            try {
                messageRange = parseMessageRangeInput(rangeInput);
            } catch (error) {
                toastr.warning(error.message, 'HTML Export');
                return '';
            }

            const usernameReplacement = normalizeOptionalText(args?.username);
            const options = {
                ...getExportOptions(),
                ...(messageRange ? { exportMode: 'complete', messageRange } : {}),
                ...(usernameReplacement ? {
                    usernameReplacement,
                    userNameSearchValues: collectUserNameSearchValues(usernameReplacement),
                } : {}),
            };

            await exportCurrentChatAsHtml(options);
            return '';
        },
        helpString: 'Export the currently opened chat as a standalone HTML file. Optional examples: /html-export 100-300, /html-export username=Anonymous 100-300',
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'username',
                description: 'replace the user name in exported message names and text',
                isRequired: false,
                typeList: [ARGUMENT_TYPE.STRING],
            }),
        ],
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'optional message ID range, e.g. 100-300',
                isRequired: false,
                typeList: [ARGUMENT_TYPE.STRING],
            }),
        ],
        returns: 'nothing',
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'txt-export',
        aliases: ['texport'],
        callback: async (args, rangeInput) => {
            let messageRange = null;

            try {
                messageRange = parseMessageRangeInput(rangeInput);
            } catch (error) {
                toastr.warning(error.message, 'TXT Export');
                return '';
            }

            const usernameReplacement = normalizeOptionalText(args?.username);
            const options = {
                ...getExportOptions(),
                ...(messageRange ? { exportMode: 'complete', messageRange } : {}),
                ...(usernameReplacement ? {
                    usernameReplacement,
                    userNameSearchValues: collectUserNameSearchValues(usernameReplacement),
                } : {}),
            };

            await exportCurrentChatAsTxt(options);
            return '';
        },
        helpString: 'Export the currently opened chat as a TXT file. Optional examples: /txt-export 100-300, /txt-export username=Anonymous 100-300',
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'username',
                description: 'replace the user name in exported message names and text',
                isRequired: false,
                typeList: [ARGUMENT_TYPE.STRING],
            }),
        ],
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'optional message ID range, e.g. 100-300',
                isRequired: false,
                typeList: [ARGUMENT_TYPE.STRING],
            }),
        ],
        returns: 'nothing',
    }));
}

jQuery(() => {
    const settings = getSettings();
    addSettingsPanel(settings);
    addExtensionMenuButton();
    registerSlashCommands();
    console.info(`[${EXTENSION_NAME}] Loaded ${MODULE_NAME} scaffold.`);
});
