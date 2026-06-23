# 小时工记账 App

一款简洁易用的小时工记账应用，支持日历视图和自动薪资计算。

## 功能特性

- 📅 日历视图：直观查看每日工时
- ⏱️ 工时记录：快速记录每日工作时长
- 💰 自动计算：根据设置的时薪自动计算收入
- 📱 跨平台：支持 Web 和 Android

## 技术栈

- React + TypeScript
- Vite
- Capacitor
- localStorage 持久化

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 构建 Android 应用

本项目使用 GitHub Actions 自动构建 Android APK。

### 步骤：

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 创建新仓库 `hourly-wage-tracker`
   - 不要初始化仓库（保持空仓库）

2. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hourly-wage-tracker.git
   git push -u origin main
   ```

3. **获取构建的 APK**
   - 访问 GitHub 仓库
   - 点击 "Actions" 标签
   - 等待构建完成（通常需要 5-10 分钟）
   - 点击构建任务
   - 在 "Artifacts" 部分下载 APK

## APK 下载说明

GitHub Actions 构建完成后：

1. 进入仓库的 **Actions** 页面
2. 点击构建任务（如 "Build Android APK #1"）
3. 在页面底部找到 **Artifacts** 部分
4. 点击 **APK** 下载构建好的应用安装包

## 使用说明

1. 安装 APK 到手机
2. 打开应用
3. 点击右上角 ⚙️ 设置时薪
4. 在日历上点击日期记录工时
5. 自动计算当日收入

## 许可证

MIT
