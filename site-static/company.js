import {
  escapeHtml,
  formatCampusStatus,
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
  const { companies, meta } = await loadDataset();
  const company = companies.find((item) => item.slug === slug);

  if (!company) {
    renderMissing(`未找到 slug 为 ${slug} 的公司`);
    return;
  }

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
        </dl>
      </div>

      <div class="detail-panel">
        <h2>备注</h2>
        <p>${escapeHtml(company.notes || "当前无额外备注。")}</p>
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
