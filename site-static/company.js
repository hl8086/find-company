import {
  escapeHtml,
  formatCampusStatus,
  formatCrawlPriority,
  formatExtractMode,
  formatFetchMode,
  formatJobStatus,
  formatJobType,
  formatJobUrlType,
  formatSourceType,
  loadDataset
} from "./shared.js";

const root = document.querySelector("#detail-root");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  renderMissing("缺少 slug 参数");
} else {
  initialize().catch((error) => {
    console.error(error);
    renderMissing(error.message);
  });
}

async function initialize() {
  const { companies, jobs, sources, meta } = await loadDataset();
  const company = companies.find((item) => item.slug === slug);

  if (!company) {
    renderMissing(`未找到 slug 为 ${slug} 的公司`);
    return;
  }

  const companyJobs = jobs
    .filter((item) => item.companyId === company.id)
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }

      return (right.lastSeenAt || "").localeCompare(left.lastSeenAt || "", "zh-CN");
    });
  const companySources = sources
    .filter((item) => item.companyId === company.id)
    .sort((left, right) => left.label.localeCompare(right.label, "zh-CN"));
  const activeJobs = companyJobs.filter((item) => item.isActive).length;
  const latestSeenAt = companyJobs.reduce((latest, item) => {
    if (!item.lastSeenAt) {
      return latest;
    }

    return !latest || item.lastSeenAt > latest ? item.lastSeenAt : latest;
  }, "");

  document.title = `${company.name} | 校招公司池`;

  root.innerHTML = `
    <div class="top-nav">
      <a class="ghost-link" href="./">返回列表</a>
      <a class="ghost-link" href="./about.html">查看口径说明</a>
    </div>

    <section class="detail-hero">
      <div class="detail-tags">
        <span class="chip">${escapeHtml(company.companyType)}</span>
        <span class="chip">${escapeHtml(company.ownershipType)}</span>
        <span class="chip success">${escapeHtml(company.confidenceLevel)} 级置信度</span>
        <span class="chip">快照 ${escapeHtml(meta.snapshotDate)}</span>
        <span class="chip">${companyJobs.length} 条岗位快照</span>
      </div>
      <h1>${escapeHtml(company.name)}</h1>
      <p>${escapeHtml(company.description)}</p>
      <div class="company-actions compact-actions">
        <a class="button" href="${escapeHtml(company.primaryJobUrl)}" target="_blank" rel="noreferrer">打开招聘信息</a>
        <span class="chip">${escapeHtml(formatJobUrlType(company.primaryJobUrlType))}</span>
      </div>
    </section>

    <section class="detail-grid">
      <div class="detail-panel">
        <h2>基础信息</h2>
        <dl class="detail-list">
          <div class="detail-item"><dt>行业</dt><dd>${escapeHtml(company.industry)}</dd></div>
          <div class="detail-item"><dt>总部国家/地区</dt><dd>${escapeHtml(company.hqCountry)}</dd></div>
          <div class="detail-item"><dt>中国业务</dt><dd>${escapeHtml(company.chinaPresence)}</dd></div>
          <div class="detail-item"><dt>校招状态</dt><dd>${escapeHtml(formatCampusStatus(company.campusHiringStatus))}</dd></div>
          <div class="detail-item"><dt>最近校招信号</dt><dd>${escapeHtml(company.campusHiringLastSeenAt)}</dd></div>
          <div class="detail-item"><dt>招聘链接状态</dt><dd>${company.primaryJobUrlVerified ? "已核验" : "待复核"}</dd></div>
          <div class="detail-item"><dt>工作省份</dt><dd>${escapeHtml(company.provinces.join("、"))}</dd></div>
          <div class="detail-item"><dt>覆盖城市</dt><dd>${escapeHtml(company.cities.join("、"))}</dd></div>
          <div class="detail-item"><dt>标签</dt><dd>${escapeHtml(company.tags.join("、"))}</dd></div>
          <div class="detail-item"><dt>员工口径</dt><dd>${escapeHtml(company.employeeScaleText)}</dd></div>
          <div class="detail-item"><dt>岗位快照状态</dt><dd>${activeJobs > 0 ? `当前有 ${activeJobs} 条仍在快照中` : "当前没有活跃岗位快照"}${latestSeenAt ? ` · 最近更新时间 ${escapeHtml(latestSeenAt)}` : ""}</dd></div>
        </dl>
      </div>

      <div class="detail-panel">
        <h2>备注</h2>
        <p>${escapeHtml(company.notes || "当前无额外备注。")}</p>
      </div>

      <div class="detail-panel">
        <h2>抓取源</h2>
        ${
          companySources.length > 0
            ? `
          <div class="job-list">
            ${companySources
              .map(
                (source) => `
                  <article class="job-card">
                    <div class="evidence-tags">
                      <span class="chip">${escapeHtml(formatJobUrlType(source.sourceType))}</span>
                      <span class="chip">${escapeHtml(formatFetchMode(source.fetchMode))}</span>
                      <span class="chip">${escapeHtml(formatExtractMode(source.extractMode))}</span>
                      <span class="chip">${escapeHtml(formatCrawlPriority(source.priority))}</span>
                      <span class="${source.enabled ? "chip success" : "chip warning"}">${source.enabled ? "已启用" : "未启用"}</span>
                    </div>
                    <h3>${escapeHtml(source.label)}</h3>
                    <p class="muted">入口：<a href="${escapeHtml(source.seedUrl)}" target="_blank" rel="noreferrer">${escapeHtml(source.seedUrl)}</a></p>
                    <p class="muted">解析结果：<a href="${escapeHtml(source.resolvedUrl || source.seedUrl)}" target="_blank" rel="noreferrer">${escapeHtml(source.resolvedUrl || source.seedUrl)}</a></p>
                    <div class="job-meta">
                      <span>刷新频率 ${escapeHtml(String(source.intervalHours))}h</span>
                      ${source.lastResolvedAt ? `<span>· 最近发现 ${escapeHtml(source.lastResolvedAt)}</span>` : ""}
                      ${source.lastCrawledAt ? `<span>· 最近抓取 ${escapeHtml(source.lastCrawledAt)}</span>` : ""}
                      ${source.lastSuccessAt ? `<span>· 最近成功 ${escapeHtml(source.lastSuccessAt)}</span>` : ""}
                    </div>
                    <p class="muted">${escapeHtml(source.lastError || source.notes || "当前未记录额外抓取说明。")}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        `
            : `<p>当前还没有为这家公司启用岗位抓取源。</p>`
        }
      </div>

      <div class="detail-panel">
        <h2>岗位快照</h2>
        ${
          companyJobs.length > 0
            ? `
          <div class="job-list">
            ${companyJobs
              .map(
                (job) => `
                  <article class="job-card">
                    <div class="evidence-tags">
                      <span class="${job.isActive ? "chip success" : "chip warning"}">${escapeHtml(formatJobStatus(job.isActive))}</span>
                      <span class="chip">${escapeHtml(formatJobType(job.jobType))}</span>
                      ${job.location ? `<span class="chip">${escapeHtml(job.location)}</span>` : ""}
                    </div>
                    <h3><a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noreferrer">${escapeHtml(job.title)}</a></h3>
                    <p class="muted">${escapeHtml(job.descriptionText || "当前岗位仅保留标题与投递链接快照。")}</p>
                    <div class="job-meta">
                      ${job.department ? `<span>部门 ${escapeHtml(job.department)}</span>` : ""}
                      ${job.deadline ? `<span>· 截止 ${escapeHtml(job.deadline)}</span>` : ""}
                      <span>· 首次出现 ${escapeHtml(job.firstSeenAt)}</span>
                      <span>· 最近出现 ${escapeHtml(job.lastSeenAt)}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
            : `<p>当前还没有成功抓到具体岗位。可以先运行 <code>npm run jobs:crawl</code> 生成第一批岗位快照。</p>`
        }
      </div>

      <div class="detail-panel">
        <h2>证据列表</h2>
        <div class="evidence-list">
          ${company.evidence
            .map(
              (item) => `
                <article class="evidence-card">
                  <div class="evidence-tags">
                    <span class="chip">${escapeHtml(formatSourceType(item.sourceType))}</span>
                    ${item.isPrimary ? '<span class="chip success">主证据</span>' : ""}
                    ${item.supportsEmployeeScale ? '<span class="chip">支持规模</span>' : ""}
                    ${item.supportsCampusHiring ? '<span class="chip">支持校招</span>' : ""}
                  </div>
                  <h3><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h3>
                  <p class="muted">${escapeHtml(item.excerpt)}</p>
                  <div class="evidence-meta">
                    <span>${escapeHtml(item.publisher)}</span>
                    <span> · 抓取时间 ${escapeHtml(item.capturedAt)}</span>
                    ${item.publishedAt ? `<span> · 页面时间 ${escapeHtml(item.publishedAt)}</span>` : ""}
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderMissing(message) {
  root.innerHTML = `
    <section class="panel loading-panel">
      <p class="hero-eyebrow">Not Found</p>
      <h1>没有找到公司详情</h1>
      <p>${escapeHtml(message)}</p>
      <a class="ghost-link" href="./">返回列表</a>
    </section>
  `;
}
