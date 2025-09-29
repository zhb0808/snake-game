# 贪吃蛇小游戏

一个使用 **Next.js** 和 **TypeScript** 构建的现代化、响应式经典贪吃蛇游戏实现。

## 功能特性

- 🎮 经典的贪吃蛇玩法，流畅的操作体验
- 📱 完全响应式设计，支持桌面端和移动端
- ⌨️ 同时支持方向键和 WASD 控制
- 📊 分数统计，并支持最高分持久化保存
- ⏸️ 支持暂停/继续功能
- 🎨 现代化 UI，支持深色/浅色模式
- 🚀 随分数提升自动加快速度，难度逐步递增

## 操作方式

- **桌面端**：方向键 或 WASD 控制蛇的方向
- **移动端**：屏幕上的虚拟方向按钮
- **P 键**：暂停/继续游戏
- **空格键**：游戏结束后重新开始

## 快速开始

首先，安装依赖：

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

然后，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

打开 [http://localhost:3000](http://localhost:3000/) 在浏览器中开始游戏。

## 游戏玩法

1. 点击 **“开始游戏”** 按钮开始
2. 使用方向键或 WASD 控制蛇的移动方向
3. 吃掉红色食物来增长身体并增加分数
4. 避免撞到墙壁或自己的身体
5. 随着分数增加，蛇的移动速度会逐渐加快

## 技术细节

- 基于 **Next.js App Router** 构建
- 使用 **TypeScript** 提供类型安全
- 使用 **Tailwind CSS** 进行样式设计
- 响应式布局，支持移动端触摸操作
- 使用 **LocalStorage** 保存最高分数
- 游戏逻辑通过 **React Hooks** 实现

## 了解更多

这个项目的构建目的是展示 **Next.js** 在现代 Web 开发中的应用。想了解更多 Next.js 的信息，可以参考以下资源：

- [Next.js 官方文档](https://nextjs.org/docs) - 学习 Next.js 的功能和 API
- [Learn Next.js](https://nextjs.org/learn) - 互动式教程

## 部署到 Vercel

部署 Next.js 应用最简单的方式是使用 **[Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)**（由 Next.js 的开发团队打造）。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 以获取更多详情。
