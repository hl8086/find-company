# find-company

一个面向中国校招信息整理的公司池项目。

仓库里目前有两套实现：

- 根目录应用：`Next.js + SQLite`
- `site-static/`：纯静态 GitHub Pages 发布版

这样可以同时满足两类需求：

- 本地继续维护和扩展数据
- 线上直接发布可访问的网站

## 目录说明

```text
find-company/
├─ app/                        # 当前 Next.js 页面
├─ components/                 # 当前 Next.js 组件
├─ data/                       # 原始公司数据与 SQLite 数据文件
├─ docs/                       # 发布文档
├─ lib/                        # 数据处理逻辑
├─ scripts/                    # 根目录数据脚本
├─ site-static/                # GitHub Pages 静态站
└─ .github/workflows/          # GitHub Actions 工作流
```

## 功能

- 公司列表展示
- 关键词搜索
- 企业类型筛选
- 行业分组筛选
- 工作省份筛选
- 招聘链接状态筛选
- 前端分页
- 单家公司详情页
- 证据来源展示

## 数据来源

当前数据主文件：

- `data/companies.json`
- `data/crawl-sources.json`
- `data/jobs.json`
- `data/crawl-runs.json`

静态站发布时使用的数据文件：

- `site-static/data/companies.json`
- `site-static/data/crawl-sources.json`
- `site-static/data/jobs.json`
- `site-static/data/meta.json`

静态站数据由下面这个脚本同步生成：

```bash
node site-static/scripts/sync-data.mjs
```

或者：

```bash
make sync-static
```

## 岗位抓取 MVP

当前仓库已经补上第一版“岗位发现 / 岗位抓取”链路，范围是：

- 用 `data/crawl-sources.json` 维护抓取源
- 用 `scripts/discover-job-pages.mjs` 发现更接近真实招聘页的 URL
- 用 `scripts/crawl-jobs.mjs` 抓取岗位快照并写入 `data/jobs.json`
- 用 `data/crawl-runs.json` 记录抓取结果

先看抓取源：

```bash
sed -n '1,120p' data/crawl-sources.json
```

发现招聘页：

```bash
npm run jobs:discover
```

只跑单家公司：

```bash
npm run jobs:discover -- --company=huawei
```

抓取岗位快照：

```bash
npm run jobs:crawl
```

只跑单家公司：

```bash
npm run jobs:crawl -- --company=huawei
```

说明：

- 第一版是规则提取优先，宁可少抓，也先避免明显误抓
- 某些官网对纯 HTTP 请求不友好，后续需要补 `browser` 模式
- 抓取完成后，再执行 `make sync-static` 可把岗位快照同步到 `site-static/`

## 本地开发

### 1. 根目录应用

安装依赖：

```bash
npm install
```

或者：

```bash
make install
```

启动开发环境：

```bash
npm run dev
```

或者：

```bash
make dev
```

构建：

```bash
npm run build
```

或者：

```bash
make build
```

说明：

- 根目录应用会在 `predev` 和 `prebuild` 时执行 SQLite seed
- 适合本地开发，不适合直接发布到 GitHub Pages

### 2. 静态发布版

先同步数据：

```bash
node site-static/scripts/sync-data.mjs
```

或者：

```bash
make sync-static
```

再用任意静态服务器预览：

```bash
python3 -m http.server 4173 -d site-static
```

或者：

```bash
make preview-static
```

访问：

```text
http://127.0.0.1:4173
```

## Docker 部署

仓库已经包含：

- `Dockerfile`
- `.dockerignore`
- `Makefile`

### 1. 构建镜像

```bash
docker build -t find-company:latest .
```

或者：

```bash
make docker-build
```

如果你当前是在 Mac，想打一个可在 `x86/amd64` 环境运行的镜像，使用 `buildx`：

```bash
docker buildx build --platform linux/amd64 -t find-company:amd64 --load .
```

或者：

```bash
make docker-build-amd64
```

说明：

- `--platform linux/amd64` 会产出 `x86_64` 可用镜像
- `--load` 会把镜像加载到你本机 Docker，本地可以直接 `docker run`
- 如果你是要直接推到镜像仓库，把 `--load` 改成 `--push`

### 2. 启动容器

```bash
docker run --rm -p 3000:3000 find-company:latest
```

或者：

```bash
make docker-run
```

访问：

```text
http://127.0.0.1:3000
```

说明：

- 容器默认运行根目录的 `Next.js + SQLite` 应用
- 构建阶段会执行 `npm run build`
- 根目录应用的 `prebuild` 会自动 seed SQLite 数据

## Make 命令

常用命令：

```bash
make install
make dev
make build
make start
make db-seed
make jobs-discover
make jobs-crawl
make sync-static
make preview-static
make docker-build
make docker-build-amd64
make docker-run
```

## GitHub Pages 发布

仓库已经包含工作流：

- `.github/workflows/deploy-pages.yml`

发布逻辑：

1. GitHub Actions checkout 仓库
2. 自动执行 `node site-static/scripts/sync-data.mjs`
3. 上传 `site-static/`
4. 发布到 GitHub Pages

GitHub 仓库中需要设置：

- `Settings -> Pages -> Source -> GitHub Actions`

部署步骤：

1. 更新根目录的 `data/companies.json` 或抓取相关数据文件
2. 如需刷新岗位快照，执行 `npm run jobs:crawl`
3. 执行 `node site-static/scripts/sync-data.mjs`
4. 提交并推送到 `main`
5. 等待 GitHub Actions 自动发布 `site-static/`

更详细的说明见：

- `docs/github-pages-deploy.md`

## 提交建议

如果你只想先把静态站发布出去，最小提交集是：

- `.github/`
- `docs/`
- `site-static/`
- `.gitignore`
- `README.md`

如果你想把整个项目都保留到仓库里，可以直接：

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 备注

- `data/companies.sqlite` 不需要提交
- `.next/` 和 `node_modules/` 不需要提交
- 静态站不依赖 SQLite，也不依赖服务端运行时
