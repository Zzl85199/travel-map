# 旅遊地圖專案 — 進度說明

## 這次做了什麼

你原本的 `public/index.html` 其實已經把 Phase 2、3、4、5 的「主要功能」都寫好了
（Leaflet 地圖、動態表單、協作者名單、路線＋站序）。這次補上的是缺的部分：

### Phase 2（瀏覽介面）— 原本就有，未更動邏輯
- Leaflet + OSM 地圖、讀 Firestore `locations`、標記、唯讀彈出卡片（只顯示有填的欄位）

### Phase 3（編輯功能）
- ✅ 新增：**圖片上傳改用 Cloudinary 免費方案**（不需要 Firebase Storage、不需要信用卡）。
  表單多了「選擇檔案」，選檔後會即時預覽、上傳時顯示進度百分比，
  上傳完成會把 Cloudinary 給的網址存進 `photoUrl`。網址輸入框保留，沒選檔案時仍可手動貼網址。
- 新增/編輯/動態表單（未填欄位忽略）維持原邏輯。

### Phase 4（協作者管理）— 原本就有，未更動邏輯
- 管理面板「協作者」分頁：owner 新增/移除協作者 email，其他協作者只能看名單。

### Phase 5（行程路線）
- 表單的「所屬路線」「站序」維持原邏輯。
- ✅ 新增：管理面板「路線」分頁，每條路線多了「調整站序」按鈕，
  展開後可以**拖曳排序**該路線的地點（拖放後自動用 batch 寫回每個地點的 `order`）。
- 地圖上依 `order` 畫路徑線、不同路線不同顏色，維持原邏輯。

### Phase 6（3D 地球總覽層）— 全新
- 用 `globe.gl`（基於 three-globe + three.js，CDN 引入，不用額外裝套件）做了可旋轉地球，
  依「城市」聚合地點畫光點（同城市的地點會平均成一個點，滑鼠移上去顯示城市名＋地點數）。
- 點擊光點會先做鏡頭飛入動畫（`pointOfView` 動畫 1.5 秒），動畫結束後才切換成 Leaflet 城市地圖並置中到該城市。
- 地圖畫面右上角會出現「🌍 返回地球」按鈕可以切回地球視角。
- 地球畫面右下角有「顯示路線弧線」開關，打開後會依路線站序畫出城市間的飛行弧線（不同路線不同顏色）。
- 切換視角時會呼叫 `pauseAnimation`/`resumeAnimation`，畫面不在前景時不做無謂渲染，稍微顧到效能。

### Phase 7（打磨與部署）— 部分完成
- 加了簡單的手機版 media query（auth-box、modal、hint 字級/寬度調整）。
- **重要補強：新增了 Firestore 安全規則**（見下方），
  因為原本專案完全沒有 `firestore.rules`，
  代表任何知道你 Firebase 設定值的人都能直接改資料庫 —
  前端的 `isEditor` 判斷只是「介面要不要顯示編輯按鈕」，並不是真正的存取控制。
- 圖片上傳走 Cloudinary，不經過 Firebase，所以不需要 Storage 規則，也不會產生 Firebase 帳單。
- 尚未做：地點很多時的效能壓力測試、標記聚合（clustering）。目前地點數量不多的話不用擔心。

## 這次的更新（打磨 / bug 修正）

- **修正地球偏移 bug**：globe.gl 第一次量測容器尺寸常常不準，現在會在初始化時和視窗大小改變時明確指定寬高，地球應該會正常置中顯示。
- **地球沒有光點的判斷**：如果 Firestore 目前真的沒有任何 `locations` 資料，地球中間會顯示「目前還沒有任何地點資料」的提示文字，這樣你就能分辨是資料庫是空的、還是渲染有問題。
- **新增載入畫面**：打開網站時會先看到深色背景＋轉圈圈的「載入旅遊資料中」提示，資料讀取完成才會消失，避免打開網站時畫面空白讓人以為壞了。
- **新增地球左上角統計徽章**：顯示「X 個地點 / Y 個城市 / Z 個國家」。
- **新增城市地圖搜尋框**：可以用地點名稱、城市、國家、分類關鍵字即時篩選標記。
- **新增標記聚合（marker clustering）**：地點一多的話，同一區域的標記會自動聚合成一個數字圓圈，點下去才展開，避免地圖上滿滿都是圖釘、效能變差。
- **WebGL 相容性判斷**：如果使用者的裝置/瀏覽器不支援 3D 效果（例如很舊的手機），會自動跳過地球畫面、直接顯示城市地圖，並提示訊息，而不是整頁空白或報錯。
- **加了 favicon（🌍）、網頁描述 meta**，分享連結時看起來更完整。

## 還沒做 / 你要自己做的事


1. **在 `index.html` 填入你自己的 Firebase 設定值**（`firebaseConfig` 那一段），
   跟你原本的做法一樣，這次沒有改這部分的結構。
2. **申請 Cloudinary 免費帳號並設定**（取代 Firebase Storage，不用信用卡）：
   - 前往 https://cloudinary.com 註冊免費帳號
   - Dashboard 首頁會看到 **Cloud name**，填到 `index.html` 的 `CLOUDINARY_CLOUD_NAME`
   - 到 Settings → Upload → Upload presets → **Add upload preset**
     - Signing Mode 選 **Unsigned**（很重要，前端才能直接上傳不需要密鑰）
     - 存檔後把 preset 名稱填到 `index.html` 的 `CLOUDINARY_UPLOAD_PRESET`
3. **手動建立第一個 owner**：
   規則設計是「只有 owner 能新增/刪除協作者」，所以你要自己到 Firebase Console
   的 Firestore，手動新增一筆文件：
   - collection: `editors`
   - 文件 ID：你自己的 Google 帳號 Email
   - 欄位：`role` = `"owner"`（字串）
4. 部署規則與網站：
   ```bash
   firebase deploy --only firestore:rules,hosting
   ```
5. 建議測試流程：
   - 用你自己帳號登入 → 確認地球會旋轉、點光點能飛進城市地圖
   - 新增一個地點、上傳一張照片 → 確認地圖卡片有照片顯示出來（可以去 Cloudinary
     Dashboard 的 Media Library 確認檔案真的傳上去了）
   - 到管理面板新增一條路線，把 2～3 個地點設定同一個 `routeId`、不同 `order`
     → 到路線分頁點「調整站序」拖曳測試，確認地球/地圖上的路線顏色跟著變
   - 邀請一位朋友的 Email 進協作者名單，請他登入測試新增/編輯

## 檔案結構

```
travel-map-main/
├─ firebase.json        (firestore rules 設定 + SPA rewrite)
├─ firestore.rules       (新增)
├─ .firebaserc
└─ public/
   ├─ index.html         (主要邏輯都在這裡：地球 + 城市地圖 + 編輯 + 管理面板 + Cloudinary 上傳)
   └─ 404.html
```
