# Docker 镜像本地构建与导出工具 (PowerShell)

$IMAGE_NAME = "font-subsetting-tool"
$IMAGE_TAG = "latest"
$EXPORT_FILE = "font-subsetting-tool-image.tar"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   Docker 镜像本地构建与导出工具" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 检查 Docker 是否安装
try {
    docker --version | Out-Null
} catch {
    Write-Host "[错误] Docker 未安装，请先安装 Docker" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "开始构建并导出 Docker 镜像..." -ForegroundColor Yellow
Write-Host ""

$choice = "3"

# 构建并导出镜像
Write-Host "[执行] 开始构建镜像..." -ForegroundColor Green
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
if ($LASTEXITCODE -eq 0) {
    Write-Host "[成功] 镜像构建成功!" -ForegroundColor Green
    Write-Host "[执行] 开始导出镜像..." -ForegroundColor Yellow
    docker save -o $EXPORT_FILE "${IMAGE_NAME}:${IMAGE_TAG}"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[成功] 镜像导出成功!" -ForegroundColor Green
        $fileSize = (Get-Item $EXPORT_FILE).Length / 1MB
        Write-Host "[信息] 文件位置: $(Get-Location)\$EXPORT_FILE" -ForegroundColor Cyan
        Write-Host "[信息] 文件大小: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "=== 服务器部署步骤 ===" -ForegroundColor Yellow
        Write-Host "1. 上传文件到服务器:"
        Write-Host "   scp $EXPORT_FILE user@server:/path/to/destination/"
        Write-Host ""
        Write-Host "2. 在服务器上导入镜像:"
        Write-Host "   docker load -i $EXPORT_FILE"
        Write-Host ""
        Write-Host "3. 启动容器:"
        Write-Host "   docker run -d -p 6739:6739 --restart unless-stopped \"
        Write-Host "     -v ./font-source:/app/font-source \"
        Write-Host "     -v ./font-mini:/app/font-mini \"
        Write-Host "     -v ./font-temp:/app/font-temp \"
        Write-Host "     --name font-subsetting-tool \"
        Write-Host "     ${IMAGE_NAME}:${IMAGE_TAG}"
        Write-Host ""
        Write-Host "或使用 docker-compose:"
        Write-Host "   docker-compose up -d"
    } else {
        Write-Host "[错误] 镜像导出失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
} else {
    Write-Host "[错误] 镜像构建失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "操作完成!" -ForegroundColor Green
Read-Host "按回车键退出"
