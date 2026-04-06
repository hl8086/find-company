# find-job

一个面向中国校招信息整理的公司池项目。

仓库里目前有两套实现：

- 根目录应用：`Next.js + SQLite`
- `site-static/`：纯静态 GitHub Pages 发布版

这样可以同时满足两类需求：

- 本地继续维护和扩展数据
- 线上直接发布可访问的网站

## 目录说明

```text
find-job/
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

静态站发布时使用的数据文件：

- `site-static/data/companies.json`
- `site-static/data/meta.json`

静态站数据由下面这个脚本同步生成：

```bash
node site-static/scripts/sync-data.mjs
```

## 本地开发

### 1. 根目录应用

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建：

```bash
npm run build
```

说明：

- 根目录应用会在 `predev` 和 `prebuild` 时执行 SQLite seed
- 适合本地开发，不适合直接发布到 GitHub Pages

### 2. 静态发布版

先同步数据：

```bash
node site-static/scripts/sync-data.mjs
```

再用任意静态服务器预览：

```bash
python3 -m http.server 4173 -d site-static
```

访问：

```text
http://127.0.0.1:4173
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
