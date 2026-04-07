# 深地特殊空间数字孪生可视化平台

基于 `Vue 3 + Vite + TypeScript + Cesium` 的深地特殊空间数字孪生可视化项目，当前主要保留了 3 个核心场景：

- `surface`：地面总览场景
- `panyidong`：潘一东矿区地下场景
- `hanshuiceng`：含水层场景

项目使用 `pnpm` 进行依赖管理，默认开发端口为 `8889`。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Cesium
- Element Plus
- Ant Design Vue
- ECharts

## 项目特点

- 支持地面场景与地下场景联动切换
- 支持 Cesium 三维地图 / 模型展示
- 支持含水层与矿区相关图像、视频、点云等资源展示
- 已将各路由使用的数据按场景收拢到各自目录下，便于维护

## 本地克隆与启动

### 1. 克隆仓库

```bash
git clone git@github.com:Riverside-sys/ShenDiShuZiLuanSheng.git
cd ShenDiShuZiLuanSheng
```

如果你使用 HTTPS，也可以改成：

```bash
git clone https://github.com/Riverside-sys/ShenDiShuZiLuanSheng.git
cd ShenDiShuZiLuanSheng
```

### 2. 准备 Node 与 pnpm

项目当前建议使用 `Node 22`。

```bash
nvm use 22
```

如果本机还没有 `pnpm`，可以先启用：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 3. 安装依赖

```bash
pnpm install
```

如果你的环境默认走了内部镜像源，导致安装失败，可以临时指定公共源：

```bash
pnpm install --registry=https://registry.npmmirror.com
```

### 4. 启动开发环境

```bash
pnpm dev
```

启动后默认访问：

```text
http://localhost:8889
```

### 5. 其他常用命令

```bash
pnpm build
pnpm preview
```

Windows 环境也可以直接使用仓库内的启动脚本：

```bat
start.bat
```

## 大文件数据说明

项目中的部分三维模型、点云和视频文件体积较大，不再提交到 Git 仓库中，而是保留为本地数据目录。

当前被 Git 忽略的大文件目录：

- `src/Views/panyidong/data/`
- `src/Views/hanshuiceng/data/`

这两个目录中只有 `index.ts` 会被提交，真正的大文件资源需要开发者在本地自行补充。

如果你是新克隆仓库后第一次运行项目，需要确保类似以下的本地数据存在：

- `src/Views/panyidong/data/`
  - `潘一东巷道模型.glb`
  - `VID_20250307_160117_point_cloud.ply`
  - `573240324-1-16.mp4`
- `src/Views/hanshuiceng/data/`
  - `aquifer_vp.glb`
  - `含水层形成原理.mp4`
  - 以及 `vp20_*`、`vp动图.gif`、`速度模型动图.gif` 等图片 / 动图资源

如果缺少这些文件，项目可以正常安装依赖，但进入对应场景时会出现资源加载失败。

## 路由说明

当前项目保留的主要路由如下：

- `/surface`：地面场景
- `/panyidong`：潘一东矿区场景
- `/panyidong/subscenes/mines_roadway_gsplat`：高斯泼溅巷道子场景
- `/hanshuiceng`：含水层场景
- `/:pathMatch(.*)`：404 页面

根路径会自动重定向到：

```text
/home -> /surface
```

## 项目目录结构

```text
ShenDiShuZiLuanSheng/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── start.bat
├── vite.config.ts
├── public/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── vite-env.d.ts
│   ├── assets/                # 静态图片、字体、SVG 等
│   ├── components/            # 当前公共组件（如顶部导航）
│   ├── hooks/                 # 组合式 hooks
│   ├── router/
│   │   ├── index.ts
│   │   └── modules/
│   │       ├── surface.ts
│   │       ├── panyidong.ts
│   │       └── hanshuiceng.ts
│   ├── stores/                # Pinia 状态管理
│   ├── styles/                # 全局样式
│   ├── utils/                 # 通用工具
│   └── Views/
│       ├── 404/
│       ├── surface/
│       │   └── data/          # 地面场景测区位置数据
│       ├── panyidong/
│       │   ├── components/
│       │   ├── subscenes/
│       │   ├── utils/
│       │   └── data/          # 本地大文件，默认不提交
│       └── hanshuiceng/
│           ├── components/
│           └── data/          # 本地大文件，默认不提交
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

## 开发约定

- 路由相关资源尽量放在对应场景目录下管理
- 小型可提交资源可放在 `src/Views/**/data`
- 超大模型文件不提交到仓库，通过本地目录或外部资源管理
- 公共样式与公共逻辑优先放在 `src/styles`、`src/utils`、`src/hooks`

## 常见问题

### 1. `pnpm install` 失败

优先检查 Node 版本和镜像源：

```bash
nvm use 22
pnpm install --registry=https://registry.npmmirror.com
```

### 2. 页面白屏或模型加载失败

通常是以下原因之一：

- 本地大文件数据目录不完整
- Cesium 资源未正常加载
- 进入了依赖本地模型的场景，但未同步对应数据文件

### 3. 为什么仓库里没有完整模型文件

因为 GitHub 对单文件大小有限制，大模型直接入库会导致无法正常推送，所以当前采用：

- 代码入库
- 大文件本地保留 / 外部存储
- 通过 `data/index.ts` 统一做资源入口映射

## 维护建议

- 新增场景时，优先按 `Views/<scene>/components`、`Views/<scene>/data` 的方式组织
- 新增超大模型时，不要直接提交到 Git 仓库
- 如需共享大模型，建议使用对象存储、网盘或独立数据仓库
