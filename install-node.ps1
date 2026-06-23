# Node.js 安装脚本
Write-Host "========================================"
Write-Host " 小时工记账 App - Node.js 安装脚本"
Write-Host "========================================"
Write-Host ""

Write-Host "正在下载 Node.js v20.11.0..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" -OutFile "$env:TEMP\nodejs.msi"

if (Test-Path "$env:TEMP\nodejs.msi") {
    Write-Host "下载完成！正在安装..."
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "$env:TEMP\nodejs.msi", "/quiet", "/norestart" -Wait
    
    Write-Host ""
    Write-Host "安装完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "请关闭此窗口，重新打开 PowerShell，然后运行：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  cd d:\Users\yang\Documents\ai\app" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "下载失败，请手动下载：" -ForegroundColor Red
    Write-Host "1. 打开浏览器访问 https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. 点击 LTS 按钮下载" -ForegroundColor Yellow
    Write-Host "3. 运行安装程序" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..."
Read-Host
