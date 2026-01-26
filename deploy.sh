#!/bin/bash
echo "🚀 开始部署 FontMin..."

# 拉取代码
echo "📥 拉取最新代码..."
git pull origin master

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建
echo "🔨 构建生产版本..."
pnpm build

# 重启 PM2
echo "♻️  重启服务..."
pm2 restart fontmin

# 显示状态
echo "✅ 部署完成！"
pm2 status
pm2 logs fontmin --lines 20