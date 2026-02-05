# 字体子集化工具 - Docker 部署脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   字体子集化工具 - Docker 部署脚本" -ForegroundColor Blue
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

# 检查 Docker Compose 是否安装
try {
    docker-compose --version | Out-Null
} catch {
    try {
        docker compose version | Out-Null
    } catch {
        Write-Host "[错误] Docker Compose 未安装，请先安装 Docker Compose" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

# 显示菜单
Write-Host ""
Write-Host "请选择操作:" -ForegroundColor Yellow
Write-Host "1) 构建并启动"
Write-Host "2) 启动服务"
Write-Host "3) 停止服务"
Write-Host "4) 重启服务"
Write-Host "5) 查看日志"
Write-Host "6) 清理容器和镜像"
Write-Host "0) 退出"
Write-Host ""

$choice = Read-Host "请输入选项 (0-6)"

switch ($choice) {
    "1" {
        Write-Host "[执行] 开始构建镜像..." -ForegroundColor Green
        docker-compose build --no-cache
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[错误] 构建失败" -ForegroundColor Red
            Read-Host "按回车键退出"
            exit 1
        }
        Write-Host "[执行] 启动服务..." -ForegroundColor Green
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[错误] 启动失败" -ForegroundColor Red
            Read-Host "按回车键退出"
            exit 1
        }
        Write-Host "[成功] 服务已启动!" -ForegroundColor Green
        Write-Host "[信息] 访问地址: http://localhost:6739" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "[执行] 启动服务..." -ForegroundColor Green
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[错误] 启动失败" -ForegroundColor Red
            Read-Host "按回车键退出"
            exit 1
        }
        Write-Host "[成功] 服务已启动!" -ForegroundColor Green
        Write-Host "[信息] 访问地址: http://localhost:6739" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "[执行] 停止服务..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "[成功] 服务已停止" -ForegroundColor Green
    }
    "4" {
        Write-Host "[执行] 重启服务..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "[成功] 服务已重启" -ForegroundColor Green
    }
    "5" {
        Write-Host "[信息] 查看日志 (Ctrl+C 退出):" -ForegroundColor Cyan
        docker-compose logs -f
    }
    "6" {
        Write-Host "[执行] 清理容器和镜像..." -ForegroundColor Yellow
        docker-compose down --rmi all -v
        Write-Host "[成功] 清理完成" -ForegroundColor Green
    }
    "0" {
        Write-Host "退出" -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host "[错误] 无效选项" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host ""
Write-Host "操作完成!" -ForegroundColor Green
Read-Host "按回车键退出"
