# closevis

closevis 是一个数据可视化调试工具，目前仍处于早期开发阶段。 

## Tauri + React + Typescript

该工程使用Tauri, React 和 Typescript in Vite。

## 推荐的 IDE 设置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## 开始

### 准备

***这是 Tauri需要的[环境配置](https://tauri.app/start/prerequisites/)。 请遵循以上步骤。***

***访问[Node.js网站](https://nodejs.org/)，下载并安装长期支持版本（LTS）,请选择PNPM。***

### 安装项目依赖

```shell
pnpm install
```

### 运行

要在 Tauri 窗口中开发运行前端：

```shell
pnpm tauri dev
```

### 发布版本构建

构建 Tauri 应用的发布版本：

```shell
pnpm tauri build
```