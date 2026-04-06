# site-static

这个目录是独立于根目录应用的 GitHub Pages 发布版。

特性：

- 纯静态站点
- 不依赖 SQLite
- 不依赖 Node 服务端
- 使用 `site-static/data/companies.json` 作为前端数据源
- 支持筛选、搜索、分页、详情页

本目录的数据文件由脚本生成：

```bash
node site-static/scripts/sync-data.mjs
```

本地预览：

```bash
python3 -m http.server 4173 -d site-static
```

然后访问：

```text
http://127.0.0.1:4173
```

发布到 GitHub Pages 时，直接上传整个 `site-static/` 目录即可。
