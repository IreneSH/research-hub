# Research Hub

Irene 的個人股票研究資料庫 — 收錄全球市場週報、個股財報深度分析，與跨產業主題研究。

---

## 部署到 Netlify

把整個 `research-hub/` 資料夾拖進 Netlify Drop（https://app.netlify.com/drop），等 30 秒就完成部署。

也可以建立新的 Site → 連 GitHub repo → 自動部署（推薦，未來更新只要 git push）。

部署後預設網址會是 `xxx-xxx-xxx.netlify.app`，可以在 Netlify 後台改成自訂的，例如 `irene-research.netlify.app`。

---

## 檔案結構

```
research-hub/
├── index.html              ← 首頁
├── earnings.html           ← 財報完整列表（搜尋、分類、標籤、排序）
├── research.html           ← 主題研究列表
├── manifest.json           ← 全站內容清單（妳唯一需要手動編輯的檔案）
├── assets/
│   ├── theme.css           ← 共用樣式
│   └── app.js              ← 動態渲染 / 搜尋 / 篩選邏輯
├── earnings/               ← 財報報告 HTML
│   ├── txn-q1-2026.html
│   ├── intc-q1-2026.html
│   ├── glw-q1-2026.html
│   └── be-q1-2026.html
└── research/               ← 主題研究 HTML
    └── semi-equipment-chain.html
```

---

## 未來新增財報的流程

每次有新財報，只要兩步：

**第 1 步**：把新財報的 HTML 檔案放進 `earnings/` 資料夾，命名規則 `{ticker小寫}-{quarter小寫}-{year}.html`，例如 `nvda-q2-2026.html`。

**第 2 步**：打開 `manifest.json`，在 `earnings` 陣列加一筆新 entry：

```json
{
  "id": "nvda-q2-2026",
  "ticker": "NVDA",
  "company_en": "NVIDIA",
  "company_zh": "輝達",
  "quarter": "Q2 2026",
  "date": "2026-08-21",
  "category": "semi",
  "tags": ["AI 加速器", "資料中心", "GPU"],
  "headline": "資料中心營收再創新高，毛利率回升至歷史峰值",
  "metrics": {
    "stock_reaction": "+9.2%",
    "stock_reaction_dir": "up",
    "rev_yoy": "+45%",
    "rev_yoy_dir": "up"
  },
  "file": "earnings/nvda-q2-2026.html"
}
```

**欄位說明：**

| 欄位 | 說明 |
|---|---|
| `id` | 唯一識別碼，用 `ticker-quarter-year` 格式 |
| `ticker` | 股票代號（大寫） |
| `company_en` | 英文公司名 |
| `company_zh` | 中文公司名（用於搜尋） |
| `quarter` | 季度，如 `Q1 2026` |
| `date` | 財報發布日期（用於排序），ISO 格式 `YYYY-MM-DD` |
| `category` | 產業大分類 ID，見下表 |
| `tags` | 主題標籤陣列，自由標註，會在卡片和篩選 chip 中出現 |
| `headline` | 一句話結論 |
| `metrics.stock_reaction` | 股價反應，例如 `+19.0%` |
| `metrics.stock_reaction_dir` | `up` / `down` / `neutral`（控制顏色） |
| `metrics.rev_yoy` | 營收年增 |
| `metrics.rev_yoy_dir` | `up` / `down` / `neutral` |
| `file` | HTML 檔案的相對路徑 |

**產業大分類 ID（與 manifest.json 中 `categories` 對應）：**

| ID | 顯示名稱 | 範例公司 |
|---|---|---|
| `semi` | 半導體 | TXN, INTC, NVDA, AMD, ASML, AMAT |
| `tech` | 科技硬體與通訊 | GLW, AAPL, ANET, CSCO |
| `software` | 軟體 | MSFT, NOW, ORCL, CRM |
| `industrial` | 工業 | CAT, GE, HON |
| `utility` | 公用事業與能源 | BE, CEG, VST, NEE |
| `other` | 其他 | 金融、消費、醫療等暫時放這 |

---

## 未來新增主題研究的流程

同樣兩步：

**第 1 步**：把研究 HTML 放進 `research/` 資料夾。

**第 2 步**：打開 `manifest.json`，在 `research` 陣列加一筆：

```json
{
  "id": "ai-power-chain",
  "title": "AI 電力產業鏈全景",
  "subtitle": "從天然氣、燃料電池到資料中心 PUE 優化的完整投資地圖",
  "category": "utility",
  "tags": ["AI 電力", "資料中心", "燃料電池"],
  "date": "2026-06",
  "stats": [
    { "value": "15", "label": "家公司" },
    { "value": "3", "label": "細分領域" }
  ],
  "eyebrow": "POWER · 資料中心電力",
  "file": "research/ai-power-chain.html"
}
```

---

## 更新週報最新一期

每次妳的週報網站發布新一期，更新 `manifest.json` 中的 `weekly.latest`：

```json
"weekly": {
  "url": "https://weekly-market-recap.netlify.app/archive",
  "latest": {
    "range": "Apr 27–May 1",
    "year": "2026",
    "title": "本週財報週開鑼，META、MSFT 領軍",
    "summary": "META <strong>+5.2%</strong>、MSFT <strong>+3.1%</strong>、AAPL <strong>+2.4%</strong>",
    "flags": ["最新", "US"]
  }
}
```

`flags` 陣列：第一個如果是 `"最新"` 會用黃色徽章，其他都用灰色區域標籤。

如果不想每週手動更新，可以把 `summary` 簡化成「最新一期市場觀察」這種通用文字，就不必改了。

---

## 本地預覽

由於 `index.html` 用 `fetch()` 載入 `manifest.json`，**不能用 `file://` 直接打開**（瀏覽器會擋）。

最簡單的本地預覽方式：

```bash
cd research-hub
python3 -m http.server 8080
```

然後在瀏覽器打開 `http://localhost:8080`。

或者用 VS Code 的 Live Server 擴充套件（右下角「Go Live」按鈕）。

部署到 Netlify 後則完全沒這個問題。

---

## 設計系統

- **背景色** `#FAFBFD`、卡片白底
- **強調色** `#C2410C`（橘紅，延續週報的調性）
- **字型** DM Sans（英文/數字）+ Noto Sans TC（中文）
- **產業色票** 半導體=藍 / 科技硬體=青 / 軟體=紫 / 工業=琥珀 / 公用事業=綠 / 其他=灰
- **主題標籤** 統一用橘紅米色

如果想改顏色或字型，編輯 `assets/theme.css` 開頭的 `:root` 變數即可。

---

## 維護備忘

- `manifest.json` 是整個網站的「資料庫」— 改它就改全站
- 既有的 4 份 Q1 2026 財報維持原本的視覺風格（淺色），未來新報告會以同樣的淺色基調產出
- 所有檔案路徑使用相對路徑，搬移整個資料夾不會壞連結
- 響應式：電腦三欄、平板兩欄、手機單欄，自動 reflow

---

維護者：Irene · 2026 ·  僅供研究參考，不構成投資建議
