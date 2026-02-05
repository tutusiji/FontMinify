# 多阶段构建 - 依赖安装阶段
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 并安装依赖
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装 pnpm
RUN npm install -g pnpm

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN pnpm build

# 运行阶段
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建字体目录并设置权限
RUN mkdir -p font-source font-mini font-temp && \
    chown -R nextjs:nodejs font-source font-mini font-temp

USER nextjs

EXPOSE 6739

ENV PORT=6739
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
