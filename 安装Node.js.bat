@echo off
chcp 65001 >nul
echo ========================================
echo    小时工记账 App - Node.js 安装程序
echo ========================================
echo.
echo 正在下载 Node.js v20.11.0...
echo 这可能需要几分钟，请耐心等待...
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'}"

echo.
echo 下载完成！正在安装...
echo.

msiexec /i "%TEMP%\nodejs.msi" /quiet /norestart

echo.
echo ========================================
echo    安装完成！
echo ========================================
echo.
echo 请关闭此窗口，然后重新打开 PowerShell
echo.
echo 验证安装：
echo   node -v
echo   npm -v
echo.
echo 然后运行以下命令构建 App：
echo   cd d:\Users\yang\Documents\ai\app
echo   npm install
echo   npm run build:android
echo.
pause
