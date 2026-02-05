@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    字体子集化工具 - Docker 部署脚本
echo ========================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装，请先安装 Docker
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [错误] Docker Compose 未安装，请先安装 Docker Compose
        pause
        exit /b 1
    )
)

:menu
echo.
echo 请选择操作:
echo 1) 构建并启动
echo 2) 启动服务
echo 3) 停止服务
echo 4) 重启服务
echo 5) 查看日志
echo 6) 清理容器和镜像
echo 0) 退出
echo.
set /p choice=请输入选项 (0-6): 

if "%choice%"=="1" goto build
if "%choice%"=="2" goto start
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto clean
if "%choice%"=="0" goto end
goto invalid

:build
echo [执行] 开始构建镜像...
docker-compose build --no-cache
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    goto end
)
echo [执行] 启动服务...
docker-compose up -d
if errorlevel 1 (
    echo [错误] 启动失败
    pause
    goto end
)
echo [成功] 服务已启动!
echo [信息] 访问地址: http://localhost:6739
pause
goto end

:start
echo [执行] 启动服务...
docker-compose up -d
if errorlevel 1 (
    echo [错误] 启动失败
    pause
    goto end
)
echo [成功] 服务已启动!
echo [信息] 访问地址: http://localhost:6739
pause
goto end

:stop
echo [执行] 停止服务...
docker-compose down
echo [成功] 服务已停止
pause
goto end

:restart
echo [执行] 重启服务...
docker-compose restart
echo [成功] 服务已重启
pause
goto end

:logs
echo [信息] 查看日志 (Ctrl+C 退出):
docker-compose logs -f
pause
goto end

:clean
echo [执行] 清理容器和镜像...
docker-compose down --rmi all -v
echo [成功] 清理完成
pause
goto end

:invalid
echo [错误] 无效选项
pause
goto menu

:end
echo.
echo 操作完成!
pause
