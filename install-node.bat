@echo off
echo ========================================
echo  小时工记账 App - Node.js 安装脚本
echo ========================================
echo.

echo 正在下载 Node.js v20.11.0...
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'"

if exist "%TEMP%\nodejs.msi" (
    echo 下载完成！正在安装...
    msiexec /i "%TEMP%\nodejs.msi" /quiet /norestart
    
    echo.
    echo 安装完成！
    echo.
    echo 请重新打开终端，然后运行以下命令：
    echo.
    echo   cd d:\Users\yang\Documents\ai\app
    echo   npm install
    echo.
) else (
    echo 下载失败，请手动下载安装：
    echo 1. 打开浏览器访问 https://nodejs.org/
    echo 2. 点击 LTS 按钮下载
    echo 3. 运行安装程序
)

pause
