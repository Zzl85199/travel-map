# 🌍 Johnny的旅遊地圖

一個用 3D 地球 + 互動地圖記錄旅遊足跡、心得與行程路線的個人網站。
支援協作編輯、路線規劃、行程列表、單一路線分享連結、照片牆年度回顧、深色模式、PWA 離線瀏覽等功能。

線上網址：[johnny-journey.web.app](https://johnny-journey.web.app)

> 📖 詳細操作說明請看 **[使用手冊](docs/使用手冊.md)**。
> 🛠️ 想知道每次更新做了什麼，請看 **[開發紀錄](README-PROGRESS.md)**。

---

## ✨ 主要功能

**瀏覽**
- 3D 旋轉地球總覽 → 點城市光點飛入 2D 地圖
- 依分類上色的可愛圖釘、標記聚合、地圖搜尋／篩選
- 🗺️ 足跡地圖著色：地球上把「去過的國家」整片上色
- 🌤️ 地點卡片即時天氣（免金鑰）

**記錄**
- 新增/編輯地點：名稱、分類、心得、評分、照片（多張）、優惠、價格、開放時間、自訂欄位…
- ✅ 已去過 / ⭐ 想去（願望清單）兩種狀態，圖釘樣式不同
- 📸 回憶牆：全站照片牆 + 年度回顧統計 + 🎬 回顧輪播動畫

**行程規劃**
- 路線（Route）+ 站序，地圖上自動畫出路線
- 📋 行程列表：Day 卡片清單檢視，可 🖨 列印
- 🔗 分享單一路線的唯讀連結，朋友不需要帳號就能看
- 🧳 打包清單、💸 花費統計、📖 一鍵生成遊記文字、未來 7 天天氣預報

**其他**
- 🌙 深色模式
- 📲 PWA：可加到手機主畫面、離線顯示上次讀取的資料
- 👥 協作者管理（owner 可新增/移除協作者，只有協作者能編輯資料）

---

## 🧱 技術架構

- 前端：純 HTML/CSS/JS 單一頁面（`public/index.html`），沒有建置流程
- 地圖：[Leaflet](https://leafletjs.com/) + CartoDB Voyager 底圖 + `leaflet.markercluster`
- 3D 地球：[globe.gl](https://globe.gl/)
- 資料庫／登入：Firebase Firestore + Firebase Authentication（Google 登入）
- 圖片上傳：Cloudinary（免費方案，不需要信用卡）
- 天氣／預報：[Open-Meteo](https://open-meteo.com/)（免金鑰）
- 地理編碼：OpenStreetMap Nominatim（免金鑰）
- 部署：Firebase Hosting

---

## 🚀 快速開始（部署自己的一份）

### 1. 建立 Firebase 專案
到 [Firebase Console](https://console.firebase.google.com/) 建立專案，啟用：
- **Authentication** → Sign-in method → 開啟 Google
- **Firestore Database**（正式模式即可，規則已經寫在 `firestore.rules`）
- **Hosting**

### 2. 填設定值
```bash
cp public/config.example.js public/config.js
```
打開 `public/config.js`，填入你的 Firebase 專案設定（`firebaseConfig`）。

### 3. 申請 Cloudinary（照片上傳，免費、不需要信用卡）
1. 到 [cloudinary.com](https://cloudinary.com) 註冊
2. Dashboard 首頁複製 **Cloud name** → 填到 `config.js` 的 `cloudinaryCloudName`
3. Settings → Upload → Upload presets → Add upload preset → Signing Mode 選 **Unsigned** → 存檔後把 preset 名稱填到 `cloudinaryUploadPreset`

### 4. 建立第一個 owner
到 Firestore Console 手動新增一筆文件：
- Collection：`editors`
- 文件 ID：你的 Google 帳號 Email
- 欄位：`role`（字串）＝ `owner`

### 5. 部署
```bash
firebase deploy --only firestore:rules,hosting
```

部署完用你的 Google 帳號登入網站，確認可以新增地點、進入管理面板新增協作者/路線。

---

## 📂 檔案結構

```
travel-map-main/
├─ firebase.json          # Hosting 設定 + Firestore 規則位置
├─ firestore.rules        # 資料庫安全規則（地點/路線公開可讀，只有協作者可寫）
├─ docs/
│  └─ 使用手冊.md          # 給一般使用者看的完整操作說明
├─ README-PROGRESS.md      # 每次更新的詳細開發紀錄
└─ public/
   ├─ index.html          # 整個網站的邏輯（地球 / 地圖 / 編輯 / 管理 / 行程 / 回憶牆…）
   ├─ config.js           # 你的 Firebase / Cloudinary 設定值（不會被 git 追蹤）
   ├─ config.example.js   # 設定值範本
   ├─ manifest.json        # PWA 設定
   ├─ sw.js               # Service Worker（離線快取網站殼）
   └─ 404.html
```

## 🔒 權限模型

- `locations`、`routes`：任何人（含未登入）可讀，只有 `editors` 名單內的帳號可寫
- `editors`：已登入者可讀（判斷自己是否有編輯權限），只有 `role: owner` 的帳號可以新增/移除協作者
- 分享路線連結（`?shareRoute=路線ID`）不需要額外的後端支援，因為地圖資料本來就公開可讀，只是換一種唯讀畫面呈現

## 📝 授權

個人專案，僅供自己與受邀協作者使用。
