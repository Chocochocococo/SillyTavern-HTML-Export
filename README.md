# SillyTavern-HTML-Export

SillyTavern-HTML-Export 是一個 SillyTavern 第三方擴充，用來把目前開啟的聊天室匯出成獨立 HTML 檔案。

主要目標是匯出完整、可閱讀、可分享的聊天紀錄，而不是完全複製 SillyTavern 當前主題。

## 功能

- 匯出目前開啟聊天室的完整聊天紀錄。
- 保留 SillyTavern Regex 顯示替換後的訊息內容。
- 保留 Markdown 渲染後的訊息 HTML。
- 不額外匯出其他 swipe 候選訊息。
- 固定匯出系統訊息、隱藏訊息、reasoning 區塊、時間戳與基本 metadata。
- 頭像固定嘗試內嵌，讓 HTML 離線開啟時仍能顯示。
- 可選擇內嵌訊息圖片、外連圖片、聊天室背景圖片。
- 支援大型聊天室分批載入。
- 支援 HTML 內部分頁顯示。
- 支援快速跳到訊息 ID / 第幾則訊息。
- 支援 slash command 指定匯出訊息範圍。
- 支援 slash command 替換使用者名稱。
- 支援 HTML 匯出設定檔，可儲存匯出選項、樣式細節與自訂 CSS。
- 支援匯入、匯出、另存與刪除自訂 HTML 匯出設定檔。
- 提供畫面樣式匯出模式，嘗試保留目前畫面 DOM 樣式。

## 匯出方式

### 擴充選單按鈕

在 SillyTavern 的擴充選單中點擊：

```text
Export HTML
```

### Slash Command

匯出目前聊天室：

```text
/html-export
```

或使用別名：

```text
/hexport
```

指定訊息 ID 範圍：

```text
/html-export 100-300
/html-export 100..300
/html-export 100:300
/html-export 100-
/html-export -300
```

替換使用者名稱：

```text
/html-export username=Anonymous
```

替換使用者名稱並指定範圍：

```text
/html-export username=Anonymous 100-300
```

替換名稱有空格時，建議加引號：

```text
/html-export username="Anonymous User" 100-300
```

## 匯出模式

### 完整聊天室（樣板模式）

預設模式。

此模式從 SillyTavern 的 `chat` 資料重建 HTML，因此可以匯出目前畫面沒有顯示的舊訊息。

適合：

- 長篇聊天紀錄。
- 大型聊天室。
- 想要穩定可讀的分享檔案。
- 想用自訂 CSS 控制輸出外觀。

注意：
- 在匯出時會將啟用的 Regex 套用一遍再匯出。
- 若有使用翻譯功能，匯出內容也會套用譯文，想匯出原文的話，需要先將聊天訊息變回原文。
- 「套用目前 ST 樣式」會嘗試將當前主題樣式套用至匯出的 HTML 檔案，但若使用特殊的第三方主題，極有可能套用不全。

### 畫面樣式匯出

此模式會複製目前畫面中的 `#chat` DOM，並嘗試保留目前可見樣式。

限制：

- 只包含目前 SillyTavern 已渲染到 DOM 的訊息。
- 如果 ST 只顯示最後 150 則訊息，匯出的 HTML 也只會有這 150 則。
- 第三方主題或 CSS snippets 可能造成匯出結果偏差。
- 適合短聊天或截圖風格保存。
- 備份大型聊天室時可能要花費較多時間。
- 若啟用 `分頁顯示訊息`，畫面樣式匯出也會將已匯出的可見訊息分頁，並顯示頁數控制欄位。
- 畫面樣式匯出會額外在可見訊息標題列附近加入 `#訊息ID` 標籤；若第三方主題樣式很強，顯示位置可能和原本 ST 訊息 ID 不完全一致。

注意：
- 在匯出時會將啟用的 Regex 套用一遍再匯出。
- 若有使用翻譯功能，匯出內容也會套用譯文，想匯出原文的話，需要先將聊天訊息變回原文。
- 畫面樣式匯出會固定嘗試包含主題擴充 CSS。

## 大型聊天室建議

如果聊天室有上千則或上萬則訊息，建議：

- 開啟 `分頁顯示訊息`。
- 每頁訊息數可先使用 `200`。
- 此設定同時套用於完整聊天匯出與畫面樣式匯出；畫面樣式匯出仍只會分頁目前已顯示的 DOM 訊息。
- 需要離線保存訊息圖片時，再視情況開啟 `內嵌訊息圖片`。
- 外連圖片很多時，不建議開啟 `內嵌外連圖片`。
- 單張內嵌圖片上限保留預設值，避免 HTML 過大。

## 使用者名稱替換

`username=...` 會替換：

- 使用者訊息標題列顯示名稱。
- 訊息中出現的使用者名稱。

注意：如果聊天中還有暱稱、別名、大小寫變體，可能需要另外手動檢查匯出結果。

## HTML 匯出設定檔

設定面板的 `HTML 匯出設定` 會保存整組 HTML 匯出設定。

設定檔會保存：

- 畫面樣式匯出是否啟用。
- 訊息對齊方式。
- 顯示頭像、內嵌訊息圖片、內嵌外連圖片、匯出聊天室背景等開關。
- 單張內嵌圖片大小上限。
- 分批顯示與分頁顯示相關設定。
- 是否套用目前 ST 樣式。
- 樣式細節。
- 自訂 CSS。

內建設定檔：

- `深色簡潔`
- `淺色簡潔`
- `氣泡聊天`
- `文件閱讀`（不會顯示頭像）
- `普通ST樣式`
- `特殊ST樣式`

`普通ST樣式` 會使用完整聊天室匯出，並嘗試匯出聊天室背景與套用目前 ST 樣式。

`特殊ST樣式` 會啟用畫面樣式匯出，適合需要保留特殊第三方主題畫面效果的情況。

按鈕用途：

- `Save`：把目前設定存回目前選擇的 HTML 匯出設定檔。
- `Save As`：把目前設定另存成新的自訂設定檔。
- `Import`：匯入設定檔 JSON。
- `Export`：匯出目前設定檔 JSON。
- `Delete`：刪除自訂設定檔。內建設定檔不能刪除。
- `Reset`：還原目前設定檔；內建設定檔會還原為預設值，自訂設定檔會還原為已儲存版本。

## 自訂 CSS

自訂 CSS 只會套用在「完整聊天室（樣板模式）」模式。你可以在 HTML Export 設定面板的 `自訂 CSS` 欄位貼上 CSS。

自訂 CSS 將覆蓋基礎 HTML 匯出設定、ST 樣式與聊天室背景。

注意：`@import` 載入的網路字體需要開啟 HTML 時仍能連上該字體來源；離線開啟時會退回備用字體。若需要完全離線，建議使用系統字體或在 CSS 裡提供完整的 `@font-face` data URL。

下面是一份粉色可愛風格的自訂 CSS 範例。

<details>
<summary>展開粉色可愛風格自訂 CSS 範例</summary>

```css
/* ===== 粉色可愛風格範例 ===== */

@import url("https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&display=swap");

:root {
  color-scheme: light;
  font-family: "Noto Sans TC", "Kiwi Maru", system-ui, sans-serif;

  /* 主題色票 — 玫瑰晨霧 (低飽和優雅粉) */
  --rose-50:  #fdfcfd;
  --rose-100: #faf5f7;
  --rose-200: #f2e6ea;
  --rose-300: #e6cbd5;
  --rose-400: #d6aebb;
  --rose-500: #c2889c;
  --rose-600: #a9667c;
  --rose-700: #8c4c62;

  --ink-700: #4a3b40;
  --ink-600: #68555c;
  --ink-500: #8c767e;

  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;

  --shadow-glass: 0 8px 32px rgba(140, 76, 98, 0.06), 0 2px 8px rgba(140, 76, 98, 0.04);
  --shadow-pop:   0 12px 28px rgba(140, 76, 98, 0.12), 0 4px 10px rgba(140, 76, 98, 0.06);
}

/* === 頁面底色：純淨柔白 + 頂部微透漸層 === */
body {
  background:
    linear-gradient(180deg, var(--rose-100) 0%, #ffffff 30%, #ffffff 100%);
  color: var(--ink-700);
  font-size: 15px;
  line-height: 1.7;
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--rose-300);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover { background: var(--rose-400); }
::selection { background: var(--rose-200); color: var(--rose-700); }

.export-page {
  max-width: 980px;
  padding-top: 40px;
  margin: 0 auto;
}

/* === 頁首：毛玻璃質感 === */
.export-header {
  position: relative;
  margin-bottom: 24px;
  padding: 24px 30px;
  background: rgba(253, 252, 253, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}
.export-title {
  color: var(--rose-700);
  font-weight: 700;
  font-family: "Kiwi Maru", serif;
  letter-spacing: 0.5px;
}
.export-meta {
  color: var(--ink-500);
  font-size: 0.9em;
  margin-top: 4px;
}

/* === 分頁 / 跳轉控制列 === */
.export-navigation {
  background: rgba(253, 252, 253, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  color: var(--ink-600);
  box-shadow: var(--shadow-glass);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.export-navigation input {
  border: 1px solid var(--rose-300);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-700);
  padding: 6px 12px;
  transition: all 0.2s ease;
}
.export-navigation input:focus {
  outline: none;
  border-color: var(--rose-500);
  box-shadow: 0 0 0 3px rgba(194, 136, 156, 0.15);
}
.export-navigation button {
  background: var(--rose-500);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-weight: 500;
  padding: 8px 18px;
  box-shadow: 0 4px 12px rgba(194, 136, 156, 0.25);
  transition: all 0.2s ease;
  cursor: pointer;
}
.export-navigation button:hover {
  background: var(--rose-600);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(194, 136, 156, 0.35);
}

/* === 聊天區 === */
.chat-log { gap: 24px; display: flex; flex-direction: column; }
.message { display: flex; gap: 16px; scroll-margin-top: 24px; }

.message-avatar img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(140, 76, 98, 0.1);
  background: #fff;
}

.message-body {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-glass);
  max-width: 85%;
  background: #ffffff;
  border: 1px solid rgba(242, 230, 234, 0.6);
  transition: box-shadow 0.2s ease;
}
.message-body:hover { box-shadow: var(--shadow-pop); }

.message-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.message-name {
  color: var(--rose-700);
  font-weight: 700;
  font-size: 0.95em;
}
.message-time {
  color: var(--ink-500);
  font-size: 0.75em;
  letter-spacing: 0.5px;
}

/* 角色訊息 — 留白優雅 */
.message-character .message-body {
  border-top-left-radius: 4px;
}

/* 使用者訊息 — 微霧粉底 */
.message-user { flex-direction: row-reverse; }
.message-user .message-body {
  background: var(--rose-50);
  border-color: var(--rose-200);
  border-top-right-radius: 4px;
}
.message-user .message-header { flex-direction: row-reverse; }

/* 系統訊息 — 置中極簡 */
.message-system { justify-content: center; margin: 12px 0; }
.message-system .message-body {
  background: transparent;
  border: none;
  box-shadow: none;
  text-align: center;
  color: var(--ink-500);
  font-size: 0.85em;
  padding: 4px;
}
.message-system .message-avatar { display: none; }

/* === 訊息內文 === */
.message-text { color: #be98a5; }
.message-text p { margin: 0.5em 0; }
.message-text a {
  color: var(--rose-600);
  text-decoration-color: var(--rose-300);
  text-underline-offset: 3px;
  transition: all 0.2s ease;
}
.message-text a:hover {
  color: var(--rose-700);
  text-decoration-color: var(--rose-500);
}

/* 對白 q 標籤 (優雅引號) */
.message-text q {
  color: var(--ink-700);
  quotes: "「" "」" "『" "』";
  font-weight: 500;
}

/* 引言 */
.message-text blockquote {
  border-left: 3px solid var(--rose-400);
  background: var(--rose-50);
  color: var(--ink-600);
  padding: 12px 16px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 1em 0;
}

/* 程式碼與區塊 */
.message-text pre {
  font-family: "Cascadia Code", "Consolas", monospace;
  background: var(--rose-100);
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
  font-size: 0.9em;
  color: var(--ink-600);
}
.message-text code {
  background: var(--rose-100);
  color: var(--rose-700);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* === Reasoning 區塊 (細緻收納) === */
.message-reasoning {
  border-left: 2px solid var(--rose-300);
  background: transparent;
  color: var(--ink-500);
  padding: 4px 0 4px 16px;
  margin-top: 12px;
  font-size: 0.9em;
}
.message-reasoning summary {
  color: var(--rose-500);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}
.message-reasoning summary:hover { color: var(--rose-600); }
.message-reasoning-content { margin-top: 8px; }

```

</details>

## 自訂 CSS 常用選擇器

完整聊天匯出常用選擇器：

<details>
<summary>展開常用選擇器</summary>

```css
body
.export-page
.export-header
.export-title
.export-meta
.export-navigation
.export-navigation input
.export-navigation button
.export-page-status
.chat-log
.chat-log.align-left
.chat-log.align-split
.message
.message-user
.message-character
.message-system
.message-avatar img
.message-body
.message-header
.message-name
.message-time
.message-id
.message-text
.message-text q
.message-text blockquote
.message-text pre
.message-text code
.message-text img
.message-reasoning
.message-reasoning summary
.message-reasoning-content
.html-export-prev-page
.html-export-next-page
.html-export-page-input
.html-export-page-jump-button
.html-export-message-jump
.html-export-message-jump-button
.html-export-jump-status
```

</details>

## Extra
個人網站：  
[Coco's Home](https://cocos-homes.com/)  
Ko-fi：  
[chocochocococo](https://ko-fi.com/chocochocococo)  
