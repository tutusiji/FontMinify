# FontMin - 字里行间

<div align="center">
  <img src="public/icon.svg" alt="FontMin Logo" width="120" height="120">
  
  <p align="center">
    <strong>字体子集抽取工具</strong>
  </p>
  
  <p align="center">
    一个现代化的字体子集化工具，帮助你轻松提取所需文字，生成精简字体包
  </p>

  <p align="center">
    <a href="#特性">特性</a> •
    <a href="#快速开始">快速开始</a> •
    <a href="#使用说明">使用说明</a> •
    <a href="#技术栈">技术栈</a>
  </p>
</div>

---

## ✨ 特性

- 🎯 **简单易用** - 拖拽上传字体，输入文字，一键生成精简字体包
- 📦 **多格式支持** - 支持 TTF, WOFF, WOFF2, EOT, SVG 多种字体格式输出
- 🎨 **实时预览** - 实时预览字体效果，所见即所得
- 🌓 **深色模式** - 支持深色/浅色主题自动切换
- 💾 **批量处理** - 支持多个字体同时处理，批量下载
- 📊 **压缩统计** - 直观显示压缩前后文件大小对比
- 🚀 **极致性能** - 基于 Next.js 16 构建，体验流畅

## 🎯 使用场景

- **网页字体优化** - 减小网页字体文件体积，提升加载速度
- **移动应用** - 为 App 提供精简的字体资源
- **电子书制作** - 只包含书中使用的文字
- **设计项目** - 导出仅包含设计稿中文字的字体文件

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本

### 安装

```bash
# 克隆项目
git clone https://github.com/tutusiji/FontMinify.git

# 进入项目目录
cd FontMinify

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器（使用 webpack）
pnpm dev

# 项目将在 http://localhost:3000 运行
```

### 构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📖 使用说明

### 1. 上传字体

- 点击上传区域或拖拽字体文件到上传区
- 支持 `.ttf` 格式的字体文件
- 上传后字体会自动被选中

### 2. 输入文字

- 在"字体预览"区域的文本框中输入需要提取的文字
- 支持中文、英文、数字、符号等所有字符
- 可调节字体大小实时预览效果

### 3. 选择格式

- 在"下载设置"区域选择需要输出的字体格式
- 支持单选或多选：TTF, WOFF, WOFF2, EOT, SVG
- 推荐使用 WOFF2 格式以获得最佳压缩率

### 4. 生成字体

- 点击"生成精简字体包"按钮开始处理
- 处理完成后会显示生成结果和压缩比例
- 可选择单独下载或打包下载全部文件

### 5. 管理字体

- 点击字体列表中的删除按钮可从列表移除字体（文件保留）
- 刷新页面可重新加载所有字体
- 字体文件保存在 `font-source` 目录

## 🛠 技术栈

### 前端框架
- **Next.js 16** - React 全栈框架
- **React 19** - UI 库
- **TypeScript** - 类型安全

### UI 组件
- **Radix UI** - 无障碍组件库
- **Tailwind CSS 4** - 原子化 CSS 框架
- **Lucide React** - 图标库
- **next-themes** - 主题切换

### 字体处理
- **fontmin** - 字体子集化引擎
- **ttf2woff2** - TTF 转 WOFF2
- **archiver** - ZIP 打包

### 状态管理
- **SWR** - 数据获取和缓存
- **React Hook Form** - 表单管理

## 📁 项目结构

```
FontMinify/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   └── fonts/           # 字体相关接口
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── ui/                  # UI 基础组件
│   ├── font-uploader.tsx    # 字体上传
│   ├── font-list.tsx        # 字体列表
│   ├── font-preview.tsx     # 字体预览
│   └── download-panel.tsx   # 下载面板
├── font-source/             # 字体源文件目录
├── font-mini/               # 精简字体输出目录
├── public/                  # 静态资源
│   ├── icon.svg            # Logo
│   └── favicon.ico         # 网站图标
└── types/                   # TypeScript 类型定义
```

## ⚙️ 配置说明

### Webpack 配置

项目使用 Webpack 模式运行（而非默认的 Turbopack），以支持 WASM 模块加载：

```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  config.experiments = {
    asyncWebAssembly: true,
    layers: true,
  };
  // ...
}
```

### 字体文件说明

- **font-source/** - 存放上传的原始字体文件
- **font-mini/** - 存放生成的精简字体文件
- 删除操作只会从列表移除，不会删除实际文件

## 🎨 设计理念

FontMin 的 Logo 设计融合了字体处理的核心概念：

- **字母 F** - FontMin 的首字母，代表字体（Font）
- **三个圆点** - 象征"精简"和"最小化"的过程
- **渐变紫色** - 现代、科技、专业的视觉印象

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

<div align="center">
  <p>用心打造 · 开源分享</p>
  <p>Made with ❤️ by <a href="https://github.com/tutusiji">tutusiji</a></p>
</div>
