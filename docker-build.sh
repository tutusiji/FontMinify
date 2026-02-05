#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

IMAGE_NAME="font-subsetting-tool"
IMAGE_TAG="latest"
EXPORT_FILE="font-subsetting-tool-image.tar"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Docker 镜像本地构建与导出工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

echo -e "${YELLOW}开始构建并导出 Docker 镜像...${NC}"
echo ""

# 构建并导出镜像
echo -e "${GREEN}[执行] 开始构建镜像...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[成功] 镜像构建成功!${NC}"
    echo -e "${YELLOW}[执行] 开始导出镜像...${NC}"
    docker save -o ${EXPORT_FILE} ${IMAGE_NAME}:${IMAGE_TAG}
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[成功] 镜像导出成功!${NC}"
        echo -e "${BLUE}[信息] 文件位置: $(pwd)/${EXPORT_FILE}${NC}"
        echo -e "${BLUE}[信息] 文件大小: $(du -h ${EXPORT_FILE} | cut -f1)${NC}"
        echo ""
        echo -e "${YELLOW}=== 服务器部署步骤 ===${NC}"
        echo "1. 上传文件到服务器:"
        echo "   scp ${EXPORT_FILE} user@server:/path/to/destination/"
        echo ""
        echo "2. 在服务器上导入镜像:"
        echo "   docker load -i ${EXPORT_FILE}"
        echo ""
        echo "3. 启动容器:"
        echo "   docker run -d -p 6739:6739 --restart unless-stopped \\"
        echo "     -v ./font-source:/app/font-source \\"
        echo "     -v ./font-mini:/app/font-mini \\"
        echo "     -v ./font-temp:/app/font-temp \\"
        echo "     --name font-subsetting-tool \\"
        echo "     ${IMAGE_NAME}:${IMAGE_TAG}"
    else
        echo -e "${RED}[错误] 镜像导出失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}[错误] 镜像构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}操作完成!${NC}"
