# 基于当前仓库的校园招聘信息聚合方案

## 1. 先判断当前项目处于什么阶段

这个仓库现在已经不是“从零开始做招聘站”的状态，而是已经有一套能运行的基础设施：

- 数据主文件是 `data/companies.json`
- 根目录应用是 `Next.js + SQLite`
- `site-static/` 是 GitHub Pages 静态发布版
- 已有链接核验脚本：`scripts/check-verified-links.mjs`
- 已有 JSON -> SQLite 的 seed 流程：`scripts/seed-sqlite.mjs`
- 已有 JSON -> 静态站数据同步流程：`site-static/scripts/sync-data.mjs`

当前产品本质上是：

1. 维护一份“有校招信号的公司池”
2. 为每家公司保留一个相对可信的招聘入口
3. 在列表页和详情页里展示公司信息、招聘入口和证据

所以后续方案不应该突然切成另一套完全独立的 `Python + FastAPI + PostgreSQL + Redis` 新系统。  
更合理的路线是：在现有仓库上逐步增加“岗位发现、岗位抓取、岗位结构化、岗位展示”能力。

---

## 2. 目标重述

你真正要解决的问题不是“做一个爬虫”，而是下面这条链路：

```text
公司种子链接
  -> 找到真实招聘页
  -> 提取岗位信息
  -> 做结构化和去重
  -> 存入当前仓库数据层
  -> 展示到 Next.js 和静态站
  -> 定时复查和更新
```

目标建议拆成两层：

- 第一层：继续把“公司池 + 官方招聘入口”做准
- 第二层：在有把握的公司上，逐步补全“具体岗位列表”

这样做的原因很简单：

- 当前仓库已经有公司层数据模型
- 岗位层抓取复杂度明显更高
- 如果直接一步到位做全自动岗位聚合，失败率、维护成本和误抓风险都会很高

---

## 3. 现有仓库建议演进成什么架构

### 3.1 总体架构

```text
data/companies.json
    -> 公司源配置与可信招聘入口
    -> 抓取脚本（发现页 / 渲染 / 提取）
    -> 标准化数据输出
    -> SQLite / JSON 快照
    -> Next.js 展示
    -> site-static 静态发布
```

### 3.2 分层设计

#### A. 源配置层

继续以公司为主键，但给每家公司补抓取配置，而不是只存一个 `primaryJobUrl`。

建议新增一层“抓取源”概念：

- `seedUrl`：你手上收集到的原始入口
- `resolvedUrl`：程序发现的真实招聘页
- `sourceType`：官网校招 / 官网招聘 / 第三方入口
- `fetchMode`：`http` / `browser`
- `extractMode`：`rule` / `llm`
- `crawlPriority`：高 / 中 / 低
- `crawlIntervalHours`
- `lastResolvedAt`
- `lastCrawledAt`
- `lastSuccessAt`

#### B. 发现层

解决“给我的 URL 不一定精准”的问题。

处理顺序建议是：

1. 先访问种子页，提取站内链接
2. 用招聘关键词给候选链接打分
3. 优先访问高分链接
4. 若没有结果，再尝试常见路径
5. 仍无结果时，把公司标记为“需要人工复核”

关键词示例：

- 中文：`招聘`、`校招`、`校园招聘`、`应届生`、`加入我们`
- 英文：`careers`、`jobs`、`campus`、`students`、`join-us`

常见路径示例：

- `/careers`
- `/jobs`
- `/campus`
- `/recruit`
- `/join`
- `/join-us`

#### C. 抓取层

建议分两种模式，不要一开始全部上浏览器渲染：

- `http`：适合静态 HTML 页，快，便宜，稳定
- `browser`：适合 JS 渲染站点，用 Playwright 处理

策略：

1. 先尝试 `fetch`
2. 抓不到有效正文或岗位列表时再回退到 Playwright
3. 不做无差别全站深爬，只抓招聘相关页面

#### D. 提取层

这一层不要直接依赖 LLM 做主流程，建议优先级如下：

1. 规则提取
2. DOM 块识别
3. 结构化列表页解析
4. LLM 兜底提取

原因：

- 规则方案更便宜
- 对固定招聘站点更稳定
- 调试难度更低
- LLM 更适合处理长文本、异形页面、半结构化说明页

建议采用“规则优先、LLM 兜底”的混合模式。

#### E. 存储层

当前仓库可以继续保留：

- `data/*.json` 作为源数据和快照
- SQLite 作为查询层和本地开发存储

没必要在第一阶段就引入 PostgreSQL 和 Redis。  
只有当你出现下面这些需求时，再考虑升级：

- 岗位量达到几十万级
- 需要多任务并发抓取
- 需要复杂队列、重试和分布式调度
- 需要在线 API 对外服务

#### F. 展示层

展示层不要立刻推翻现有页面，建议在当前 UI 上演进：

1. 公司列表页仍保留
2. 公司详情页从“公司说明页”升级为“公司 + 招聘入口 + 岗位列表”
3. 再新增独立的“岗位列表页”

这样路径更顺：

- 先保持当前产品可用
- 再逐步增加“岗位视角”
- 静态站也能同步演进

---

## 4. 推荐的数据模型调整

### 4.1 公司层

`Company` 可以继续保留，但建议新增抓取相关字段，或者拆出独立的 `sources` 文件。

如果继续放在 `companies.json` 里，建议补这些字段：

```ts
type CrawlSource = {
  id: string;
  seedUrl: string;
  resolvedUrl?: string;
  sourceType: "official_campus" | "official_careers" | "third_party_job_board";
  fetchMode: "http" | "browser";
  extractMode: "rule" | "llm";
  priority: "high" | "medium" | "low";
  intervalHours: number;
  enabled: boolean;
  lastResolvedAt?: string;
  lastCrawledAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
};
```

### 4.2 岗位层

建议新增独立岗位模型，不要把岗位直接塞回公司备注里。

```ts
type Job = {
  id: string;
  companyId: string;
  sourceId: string;
  title: string;
  location?: string;
  department?: string;
  jobType?: "intern" | "campus" | "full-time";
  education?: string;
  deadline?: string;
  applyUrl: string;
  descriptionText?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  isActive: boolean;
  fingerprint: string;
};
```

### 4.3 建议新增的文件

```text
data/
  companies.json
  jobs.json
  crawl-sources.json
  crawl-runs.json
```

第一阶段可以先用 JSON 文件，后面再同步进 SQLite。

---

## 5. 抓取方案怎么设计才更适合这个仓库

### 5.1 推荐技术路线

优先推荐继续使用 Node.js 技术栈，原因是：

- 当前仓库已经是 Node/Next.js
- 现有脚本全部是 `.mjs`
- 数据同步、构建、静态发布链路已经在 Node 里
- 降低跨语言维护成本

推荐组合：

- 页面抓取：Playwright
- HTML 清洗：Readability / Cheerio
- 规则提取：站点适配器
- LLM 兜底：只在规则失败时调用
- 定时调度：GitHub Actions cron 或本地 cron

不推荐一开始就拆出独立 Python 服务。

### 5.2 每次抓取的标准流程

```text
读取 crawl-sources
  -> 选择需要刷新的 source
  -> 发现真实招聘页
  -> 抓取页面
  -> 结构化提取岗位
  -> 标准化字段
  -> 计算 fingerprint 去重
  -> 更新 jobs.json / SQLite
  -> 生成抓取日志
  -> 同步到 site-static
```

### 5.3 去重策略

岗位去重不能只靠标题。

建议 fingerprint 组成：

```text
companyId + normalizedTitle + normalizedLocation + applyUrl
```

如果有些站点链接会变化，可以退化为：

```text
companyId + normalizedTitle + normalizedLocation + normalizedDepartment
```

### 5.4 状态同步策略

每次抓取后不要直接删除旧岗位，而是做状态变更：

- 本次仍存在：更新 `lastSeenAt`
- 本次新发现：新增并标记 `isActive = true`
- 连续多次未出现：标记 `isActive = false`

这样可以保留历史轨迹，后续也方便做“新发布岗位”提示。

---

## 6. 前端应该怎么演进

### 6.1 保留当前页面主线

当前站点已经有：

- 公司列表页
- 公司详情页
- 搜索、筛选、分页
- 静态发布版

这部分不要重做，直接扩展。

### 6.2 具体改造建议

### 第一步：改详情页

现在详情页主要展示：

- 公司基本信息
- 招聘入口
- 证据列表

建议补成：

- 公司基本信息
- 招聘入口
- 最近抓取时间
- 岗位列表
- 岗位状态提示

### 第二步：新增岗位列表页

独立页面建议支持：

- 关键词搜索：职位名 / 公司名 / 城市
- 行业筛选
- 城市筛选
- 岗位类型筛选
- 是否仍在招聘
- 截止日期排序
- 最近抓取时间展示

### 第三步：保留“跳原链接”优先

这个站点的定位不应该是替代企业官网投递，而应该是：

- 帮用户发现岗位
- 帮用户缩短找入口的时间
- 帮用户快速跳回官方申请页

所以“查看原链接 / 去官方投递”应该始终是主按钮。

---

## 7. 调度和部署怎么做更稳

### 7.1 第一阶段调度

先用最轻量的方式：

- 本地手动执行抓取脚本
- GitHub Actions 定时跑

例如：

- 热门公司：每 6 小时
- 普通公司：每 24 小时
- 更新慢的公司：每 48 小时或每周一次

### 7.2 第二阶段调度

如果后面 source 数量和失败重试需求变多，再引入：

- 任务队列
- 分级重试
- 独立 worker

但这不应该是当前第一优先级。

### 7.3 当前仓库更适合的部署方式

当前已经具备两种发布路径：

- 本地研究版：根目录 Next.js + SQLite
- 对外展示版：`site-static/` 发布到 GitHub Pages

因此更合理的闭环是：

```text
定时抓取
  -> 更新 data/*.json
  -> seed SQLite
  -> sync static data
  -> 发布静态站
```

---

## 8. 开源项目怎么选

下面这些项目适合参考或直接复用，尤其是爬虫这一段。

### 8.1 Playwright

- 用途：浏览器渲染、点击、等待页面异步加载
- 适合：JS 渲染招聘站、SPA 招聘页
- 官方站点：https://playwright.dev/

结论：这是当前仓库最值得优先引入的基础能力。

### 8.2 Crawlee

- 用途：任务队列、URL 管理、重试、限速、抓取工作流
- 官方站点：https://crawlee.dev/

结论：如果后面 source 规模扩大，Crawlee 很适合做抓取编排层；但第一版也可以先不用，避免过早加复杂度。

### 8.3 Firecrawl

- 用途：把网页转成更适合 LLM 处理的 markdown/结构化内容
- 项目地址：https://github.com/firecrawl/firecrawl

结论：更适合做“快速验证”和“LLM 友好提取”辅助层，不建议直接成为主抓取链路核心，因为你当前更需要可控、低成本、可调试的流程。

### 8.4 Scrapy

- 官方文档：https://docs.scrapy.org/

结论：成熟，但它更适合 Python 栈。当前仓库已经是 Node 主导，除非你明确要把采集系统拆成独立服务，否则不建议现在引入。

---

## 9. 建议实施顺序

### Phase 0：继续把当前公司池做稳

- 补齐公司数据规范
- 继续校验 `primaryJobUrl`
- 把“待复核 / 已核验 / 最后确认时间”维护好

输出：

- 更稳定的 `companies.json`
- 更可靠的静态站基础数据

### Phase 1：增加抓取源配置

- 为公司增加 `crawlSources`
- 区分 `seedUrl` 和 `resolvedUrl`
- 增加抓取频率、抓取模式、启用状态

输出：

- `crawl-sources.json`
- 可执行的 source 注册表

### Phase 2：先做招聘页发现器

- 输入原始 URL
- 输出最可能的真实招聘页
- 把发现结果写回 source

输出：

- `scripts/discover-job-pages.mjs`

### Phase 3：先做少量公司岗位抓取 MVP

先从 4 家结构清晰的公司开始：

- 华为
- 腾讯
- 阿里巴巴
- 比亚迪

优先做规则提取，不要一开始全交给 LLM。

输出：

- `scripts/crawl-jobs.mjs`
- `data/jobs.json`

### Phase 4：更新详情页和岗位页

- 详情页展示岗位列表
- 新增岗位聚合页
- 支持岗位维度搜索和筛选

输出：

- 用户能从“公司池”走到“岗位池”

### Phase 5：接入定时刷新

- GitHub Actions 定时执行
- 自动同步静态站数据
- 失败告警先写日志，后续再接通知

输出：

- 一个可持续刷新的招聘聚合站

---

## 10. 关键判断

这个项目最容易踩的坑，不是代码写不出来，而是架构一下子做太重。

当前仓库的正确方向应该是：

- 继续以 `companies.json` 为主数据入口
- 用 Node 脚本补采集能力
- 用 Playwright 解决 JS 渲染页
- 用规则优先、LLM 兜底的提取策略
- 先把公司详情页升级，再做独立岗位页
- 先用 JSON + SQLite 跑通，再决定要不要升级到 Postgres

一句话总结：

不要另起一套招聘系统；要把当前这个“公司池项目”平滑演进成“公司池 + 岗位聚合”的项目。
