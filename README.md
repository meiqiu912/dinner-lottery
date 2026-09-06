# 🍜 今晚吃啥？—— 晚餐抽签 APP

选择困难症终结者：在家做还是出去吃？摇签帮你决定！

- **🏠 在家做**：摇签抽出一道家常菜，签文解签（趣味宜忌）+ 实拍菜品大图 + 完整菜谱（食材清单 / 备菜 / 烹饪步骤）
- **🥢 出去吃**：定位读取周边真实饭店（高德地图），摇签抽一家，按菜系给趣味签文，一键唤起高德导航
- **🎋 寺庙摇签**：手绘卡通写实 SVG 签筒；手机摇一摇 / 电脑按住甩；能量攒满竹签金光迸发出筒
- **✨ 出签发光**：金色光芒旋转 + 光晕脉冲 + 星光粒子 + 全屏闪光，竖排签文（第X签 · 菜名）
- **📺 看广告重抽**：每天默认 3 次免费，用完后看 5 秒激励广告（模拟）解锁 3 次
- **🕘 今日记录**：记录今天抽过 / 锁定过的结果

零依赖纯原生 H5，手机浏览器直接用，可添加到主屏幕（PWA），也可打包成 Android APP。

## 🚀 已上线

- **线上地址**：<https://meiqiu912.github.io/dinner-lottery/>（GitHub Pages，HTTPS，手机直接打开即用）
- **安装包下载**：<https://github.com/meiqiu912/dinner-lottery/releases/download/v1.0/dinner-lottery-v1.0.zip>
- 安卓 Chrome 打开线上地址会出现「📲 安装到手机桌面」按钮（PWA 免安装）；iPhone 用 Safari 分享 → 添加到主屏幕
- 更新方式：改完代码 `git push` 后 Pages 约 1 分钟自动重新发布

---

## 目录结构

```
dinner-lottery/
├── index.html              # 页面骨架（所有屏幕）
├── css/style.css           # 样式（移动端优先，414px 设计稿）
├── js/
│   ├── data-recipes.js     # 菜谱库：24 道家常菜 + 每道菜的定制趣味签文（FORTUNES）
│   ├── data-restaurants.js # 演示饭店数据 + 按菜系的饭店签文模板（RESTO_FORTUNE）
│   ├── amap.js             # 高德封装：定位 / 周边搜索 / 导航URI
│   └── app.js              # 主逻辑：路由 / 摇签引擎 / 发光出签 / 解签 / 次数 / 广告 / 历史
├── img/dishes/             # 21 张菜品实拍图（720x540 JPEG，按菜品 id 命名，无图菜品自动 emoji 兜底）
├── manifest.json           # PWA 清单
├── sw.js                   # Service Worker（离线可用，含菜品图预缓存）
├── icons/                  # 图标（svg + 192/512 png）
└── .testenv/               # 测试用 puppeteer-core（可删除）
```

## 本地运行

需要通过 HTTP 访问（`file://` 双击打开时定位和 PWA 不可用，其他功能正常）：

```bash
cd dinner-lottery
python -m http.server 8080     # 或 npx serve .
```

手机和电脑连同一 WiFi，访问 `http://电脑局域网IP:8080` 即可在手机上使用。
**定位功能需要 HTTPS**（微信/GitHub Pages/Vercel 部署后自动满足），本地 HTTP 下会自动回退到演示数据。

## 配置真实"周边饭店"（可选）

1. 到 [高德开放平台](https://console.amap.com/) 注册 → **完成个人实名认证**（未认证配额为 0，无法调用）
2. 创建应用 → 添加 Key，服务平台选 **Web服务**
3. 打开 APP 首页右上角 ⚙️ → 粘贴 Key → 保存（存进浏览器 localStorage，**不进代码**，每台设备一次）
4. "出去吃"即搜索你周边 3 公里内的真实餐厅（含评分、人均、地址、电话）；未配置时自动使用演示数据

**配额现状（个人认证、非商业用途免费 1 年）：**

| 接口 | 个人认证配额 | 本 APP 消耗 |
|---|---|---|
| 周边搜索（place/around） | 5,000 次/月，QPS 3 | 每次进入"出去吃"1 次 |
| 坐标转换 + 逆地理编码 | 150,000 次/月 | 每次各 1 次 |

日常自用远用不完；超限后按量计费（约 30 元/万次），介意可在高德控制台设流量上限。

**已内置的正确性处理**：浏览器 GPS 是 WGS-84 坐标，高德用 GCJ-02——配 Key 后 APP 自动调坐标转换接口修正（否则整体偏移几百米），并用逆地理编码把"当前位置"显示为真实地址；所有请求带 8 秒超时，失败自动回退演示数据。

**Key 安全**：Key 只保存在浏览器 localStorage，不写入代码、不进仓库。注意纯前端应用的 Key 在使用者浏览器里仍可被看到；若要彻底隐藏，可自建后端代理（如 Cloudflare Workers）转发高德请求，Key 存服务端环境变量。

## 图片素材说明

`img/dishes/` 内菜品照片来自网络公开菜谱站点（via 图片搜索），仅建议个人使用；
若要商用，请替换为自拍图或 AI 生成图，并保留文件名不变即可（无图菜品自动回退 emoji 展示，不会破图）。
菜品图缺失 / 新增菜品时无需配置——有图按 `菜品id.jpg` 展示，无图走 emoji。

## 摇签交互说明

| 平台 | 操作 | 备注 |
|---|---|---|
| 手机（真机） | 打开页面后**用力摇一摇** | iOS 首次需点击"点我授权"按钮授权传感器（系统要求）；3 秒检测不到传感器会提示改用拖动 |
| 电脑 / 平板 | **按住签筒左右快速甩** | 鼠标或触摸均可，筒体会跟手倾斜 |
| 任何平台 | 能量攒满自动出签 | 停止摇晃能量会缓慢退潮，需持续摇 2~4 秒 |

注意：摇一摇传感器（`devicemotion`）在 iOS 上要求 **HTTPS**（localhost 也行）；本地 HTTP 局域网访问时手机端请用"按住拖动"方式，功能完全一致。

## 添加到手机主屏幕（当 APP 用）

- **Android Chrome / iOS Safari**：浏览器菜单 →「添加到主屏幕」→ 图标出现在桌面，点开全屏无地址栏（PWA standalone）
- iOS 上"导航过去"会唤起高德网页版，装了高德 APP 则可直接跳 APP

## 打包成 Android APK（可选进阶）

用 Capacitor 把本 H5 包装成原生 APP：

```bash
npm init -y && npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "今晚吃啥" com.example.dinner --web-dir .
npx cap add android
npx cap open android   # 在 Android Studio 中 Build APK
```

需要 Android Studio 环境。打包后可在 `index.html` 中接入穿山甲/AdMob 真实激励视频 SDK 替换模拟广告（搜索 `ad-overlay` 相关代码，奖励发放点在 `app.js` 的 `rewardQuota()`）。

## 广告机制说明

当前为**模拟激励广告**：全屏卡片 + 5 秒倒计时，倒计时内关闭按钮禁用，看完关闭奖励 +3 次。
接入真实广告平台时，把 `openAd()` / `#ad-close` 逻辑替换为 SDK 的激励视频回调，调用 `rewardQuota(3)` 即可，其余不用动。

## 数据存储

全部使用 `localStorage`，无后端：

| Key | 内容 |
|---|---|
| `dl_quota` | 当日剩余抽签次数（按日期自动重置） |
| `dl_free_quota` | 每日免费次数设置（默认 3） |
| `dl_amap_key` | 高德 Web 服务 Key |
| `dl_history_YYYY-MM-DD` | 当日抽签/锁定历史 |
