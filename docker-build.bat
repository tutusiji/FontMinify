@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set IMAGE_NAME=font-subsetting-tool
set IMAGE_TAG=latest
set EXPORT_FILE=font-subsetting-tool-image.tar

echo ========================================
echo    Docker 镜像本地构建与导出工具
echo ========================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装，请先安装 Docker
    pause
    exit /b 1
)

echo.
echo 开始构建并导出 Docker 镜像...
echo.
echo [执行] 开始构建镜像...
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .
if errorlevel 1 (
    echo [错误] 镜像构建失败
    pause
    goto end
)
echo [成功] 镜像构建成功!
echo [执行] 开始导出镜像...
docker save -o %EXPORT_FILE% %IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo [错误] 镜像导出失败
    pause
    goto end
)
echo [成功] 镜像导出成功!
echo [信息] 文件位置: %CD%\%EXPORT_FILE%
for %%A in (%EXPORT_FILE%) do echo [信息] 文件大小: %%~zA 字节
echo.
echo === 服务器部署步骤 ===
echo 1. 上传文件到服务器:
echo    scp %EXPORT_FILE% user@server:/path/to/destination/
echo.
echo 2. 在服务器上导入镜像:
echo    docker load -i %EXPORT_FILE%
echo.
echo 3. 启动容器:
echo    docker run -d -p 6739:6739 --restart unless-stopped ^
echo      -v ./font-source:/app/font-source ^
echo      -v ./font-mini:/app/font-mini ^
echo      -v ./font-temp:/app/font-temp ^
echo      --name font-subsetting-tool ^
echo      %IMAGE_NAME%:%IMAGE_TAG%
echo.
echo 或使用 docker-compose:
echo    docker-compose up -d
pause

:end
echo.
echo 操作完成!
pause
