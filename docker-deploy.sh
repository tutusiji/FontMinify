#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   字体子集化工具 - Docker 部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

# 选择操作
echo -e "${YELLOW}请选择操作:${NC}"
echo "1) 构建并启动"
echo "2) 启动服务"
echo "3) 停止服务"
echo "4) 重启服务"
echo "5) 查看日志"
echo "6) 清理容器和镜像"
echo ""
read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}开始构建镜像...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}启动服务...${NC}"
        docker-compose up -d
        echo -e "${GREEN}服务已启动!${NC}"
        echo -e "${BLUE}访问地址: http://localhost:6739${NC}"
        ;;
    2)
        echo -e "${GREEN}启动服务...${NC}"
        docker-compose up -d
        echo -e "${GREEN}服务已启动!${NC}"
        echo -e "${BLUE}访问地址: http://localhost:6739${NC}"
        ;;
    3)
        echo -e "${YELLOW}停止服务...${NC}"
        docker-compose down
        echo -e "${GREEN}服务已停止${NC}"
        ;;
    4)
        echo -e "${YELLOW}重启服务...${NC}"
        docker-compose restart
        echo -e "${GREEN}服务已重启${NC}"
        ;;
    5)
        echo -e "${BLUE}查看日志 (Ctrl+C 退出):${NC}"
        docker-compose logs -f
        ;;
    6)
        echo -e "${YELLOW}清理容器和镜像...${NC}"
        docker-compose down --rmi all -v
        echo -e "${GREEN}清理完成${NC}"
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}操作完成!${NC}"
