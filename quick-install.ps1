# 快速安装 Node.js 脚本
Write-Host "========================================"
Write-Host "  正在下载 Node.js v20.11.0..."
Write-Host "========================================"
Write-Host ""

$nodeDir = "d:\Users\yang\Documents\ai\app\.node"
$zipPath = "$nodeDir\npm.zip"

Write-Host "正在下载 Node.js..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.0/win-x64/node.exe" -OutFile "$nodeDir\node.exe" -UseBasicParsing

Write-Host "正在下载 npm..."
Invoke-WebRequest -Uri "https://github.com/npm/cli/archive/refs/tags/v10.2.4.zip" -OutFile "$zipPath" -UseBasicParsing

Write-Host "正在解压 npm..."
Expand-Archive -Path "$zipPath" -DestinationPath "$nodeDir" -Force
Copy-Item -Path "$nodeDir\cli-10.2.4\*" -Destination "$nodeDir" -Recurse -Force

Write-Host ""
Write-Host "========================================"
Write-Host "  安装完成！"
Write-Host "========================================"
Write-Host ""
Write-Host "Node.js 路径: $nodeDir"
Write-Host ""
Write-Host "使用方法："
Write-Host "  $nodeDir\node.exe --version"
Write-Host "  $nodeDir\npm.cmd --version"
Write-Host ""
Write-Host "按 Enter 键退出..."
Read-Host
