@echo off
ECHO 配置“深地特殊空间数字孪生可视化平台”运行环境
ECHO 通过nvm配置Node.js 22.x LTS
call nvm use 22
ECHO 安装依赖
call pnpm install
ECHO 启动项目
call pnpm dev 