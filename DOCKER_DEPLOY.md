# Docker 部署文档

## 快速开始

### 前置要求
- Docker 20.10+
- Docker Compose 2.0+

### 一键部署

**Windows 系统（PowerShell）：**
```powershell
.\docker-deploy.ps1
```

**Windows 系统（CMD）：**
```cmd
docker-deploy.bat
```

**Linux/macOS 系统：**
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### 手动部署

#### 1. 构建镜像
```bash
docker-compose build
```

#### 2. 启动服务
```bash
docker-compose up -d
```

#### 3. 查看日志
```bash
docker-compose logs -f
```

#### 4. 停止服务
```bash
docker-compose down
```

## 配置说明

### 端口配置
默认端口：`6739`

修改端口：编辑 `docker-compose.yml` 文件
```yaml
ports:
  - "8080:6739"  # 将本地 8080 端口映射到容器 6739 端口
```

### 数据持久化
以下目录会自动挂载到宿主机，确保数据持久化：
- `./font-source` - 源字体文件
- `./font-mini` - 生成的精简字体
- `./font-temp` - 临时文件

### 环境变量
可在 `docker-compose.yml` 中配置环境变量：
```yaml
environment:
  - NODE_ENV=production
  - PORT=6739
  - HOSTNAME=0.0.0.0
```

## 常用命令

### 查看运行状态
```bash
docker-compose ps
```

### 重启服务
```bash
docker-compose restart
```

### 进入容器
```bash
docker-compose exec font-subsetting-tool sh
```

### 查看资源占用
```bash
docker stats font-subsetting-tool
```

### 更新镜像
```bash
docker-compose pull
docker-compose up -d
```

### 完全清理
```bash
docker-compose down --rmi all -v
```

## 架构说明

### 多阶段构建
1. **deps 阶段**: 安装依赖
2. **builder 阶段**: 构建 Next.js 应用
3. **runner 阶段**: 精简运行时镜像

### 镜像优化
- 使用 Alpine Linux 减小镜像体积
- 多阶段构建，最终镜像只包含必要文件
- 非 root 用户运行，提高安全性

## 故障排除

### 端口被占用
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "7000:6739"
```

### 权限问题
```bash
# 确保字体目录有正确权限
chmod -R 777 font-source font-mini font-temp
```

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs font-subsetting-tool

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 内存不足
```bash
# 在 docker-compose.yml 中限制内存
services:
  font-subsetting-tool:
    deploy:
      resources:
        limits:
          memory: 2G
```

## 生产环境建议

### 1. 使用反向代理
建议使用 Nginx 作为反向代理：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6739;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 启用 HTTPS
使用 Let's Encrypt 证书：
```bash
certbot --nginx -d your-domain.com
```

### 3. 配置日志
```yaml
services:
  font-subsetting-tool:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. 健康检查
```yaml
services:
  font-subsetting-tool:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:6739"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 访问应用

部署成功后，访问：
- 本地：http://localhost:6739
- 远程：http://your-server-ip:6739

## 监控和维护

### 定期备份
```bash
# 备份字体文件
tar -czf fonts-backup-$(date +%Y%m%d).tar.gz font-source font-mini

# 备份到远程
rsync -avz font-source font-mini user@backup-server:/backup/
```

### 定期清理
```bash
# 清理临时文件
docker-compose exec font-subsetting-tool sh -c "rm -rf font-temp/*"

# 清理未使用的镜像
docker image prune -a
```

## 支持

如遇问题，请查看：
1. 容器日志：`docker-compose logs -f`
2. 系统资源：`docker stats`
3. 网络连接：`docker network inspect font_font-network`
