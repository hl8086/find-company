# GitHub Pages 发布文档

## 当前方案

仓库里已经保留了两套实现：

- 根目录应用：`Next.js + SQLite`，继续作为本地研究版
- `site-static/`：纯静态 GitHub Pages 发布版

发布时不要直接上传根目录应用，应该发布 `site-static/`。

## 为什么要单独做静态版

当前根目录应用不适合直接发 GitHub Pages，原因很明确：

1. 构建前会执行 SQLite seed。
2. 运行时依赖 `node:sqlite`。
3. 首页和详情页当前是服务端取数。

GitHub Pages 只能托管静态文件，因此发布版需要避免：

- 运行时 SQLite 查询
- Node 服务端 API
- 服务端分页、筛选和搜索

## 现在已经落地的目录

```text
find-job/
├─ data/
│  └─ companies.json
├─ docs/
│  └─ github-pages-deploy.md
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
└─ site-static/
   ├─ index.html
   ├─ company.html
   ├─ about.html
   ├─ 404.html
   ├─ app.js
   ├─ company.js
   ├─ shared.js
   ├─ styles.css
   ├─ package.json
   ├─ data/
   │  ├─ companies.json
   │  └─ meta.json
   └─ scripts/
      └─ sync-data.mjs
```

## `site-static/` 的工作方式

这套发布版是纯静态站：

- 页面文件：`HTML + CSS + 浏览器端 JavaScript`
- 数据源：`site-static/data/companies.json`
- 详情页：`company.html?slug=<slug>`
- 筛选、搜索、分页：全部在浏览器中完成

这意味着：

- 不需要 SQLite
- 不需要构建服务端
- 不需要 Next.js 运行时
- 可以直接上传整个目录到 GitHub Pages

## 数据同步方式

静态版的数据来自根目录的 `data/companies.json`。

同步命令：

```bash
node site-static/scripts/sync-data.mjs
```

这个脚本会生成两个文件：

- `site-static/data/companies.json`
- `site-static/data/meta.json`

其中 `meta.json` 包含：

- `snapshotDate`
- `generatedAt`
- `totalCompanies`

## 本地预览

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

如果本地环境限制端口绑定，可以换你自己的静态服务器工具。

## GitHub Pages 发布方式

推荐使用 `GitHub Actions` 自动发布。

仓库里已经提供工作流文件：

- `.github/workflows/deploy-pages.yml`

这个工作流会做四件事：

1. checkout 仓库
2. 运行 `node site-static/scripts/sync-data.mjs`
3. 上传整个 `site-static/` 目录
4. 发布到 GitHub Pages

## GitHub 仓库设置

进入仓库页面：

`Settings -> Pages`

将 Source 设为：

- `GitHub Actions`

## 触发部署

默认在这些情况下触发：

- push 到 `main`
- 手动点击 `Run workflow`

首次部署常用命令：

```bash
git add .
git commit -m "Add static GitHub Pages site"
git push origin main
```

## 部署后的地址

项目站点地址通常是：

```text
https://<github-username>.github.io/<repo-name>/
```

如果仓库名是 `find-job`，则一般会是：

```text
https://<github-username>.github.io/find-job/
```

## 发布前检查

发布前至少确认这些点：

- `site-static/data/companies.json` 已生成
- `site-static/data/meta.json` 已生成
- 首页能正常加载列表
- 筛选、分页、关键词搜索可用
- `company.html?slug=...` 能打开详情页
- 外链按钮能跳到招聘链接

## 不建议的做法

以下做法不建议用于 GitHub Pages：

- 直接发布根目录的 `Next.js + SQLite` 版本
- 在 Pages 上运行 SQLite 查询
- 保留服务端分页或服务端筛选
- 把 GitHub Pages 当成后端服务来用

## 后续可增强项

静态版上线后，可以继续补这些能力：

- 增加更多筛选维度
- 增加排序方式
- 增加“仅看官方校招”之类的快捷筛选
- 为详情页补返回时保留筛选状态
- 用 GitHub Actions 定时刷新数据
