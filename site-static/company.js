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
    <div class="detail-topbar">
      <a class="ghost-button" href="./">返回列表</a>
      <a class="ghost-button" href="./about.html">查看口径说明</a>
    </div>

    <section class="detail-hero">
      <p class="eyebrow">Snapshot ${escapeHtml(meta.snapshotDate)}</p>
      <div class="detail-title-row">
        <div>
          <h1>${escapeHtml(company.name)}</h1>
          <p>${escapeHtml(company.description)}</p>
        </div>
        <div class="detail-hero-actions">
          <span class="confidence-badge confidence-${escapeHtml(company.confidenceLevel)}">${escapeHtml(company.confidenceLevel)} 级</span>
          <a class="primary-button" href="${escapeHtml(company.primaryJobUrl)}" target="_blank" rel="noreferrer">打开招聘页</a>
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <article class="panel detail-panel">
        <h2>基础信息</h2>
        <dl class="info-list">
          <div><dt>企业类型</dt><dd>${escapeHtml(company.companyType)} / ${escapeHtml(company.ownershipType)}</dd></div>
          <div><dt>行业</dt><dd>${escapeHtml(company.industry)}</dd></div>
          <div><dt>总部国家/地区</dt><dd>${escapeHtml(company.hqCountry)}</dd></div>
          <div><dt>中国业务</dt><dd>${escapeHtml(company.chinaPresence)}</dd></div>
          <div><dt>校招状态</dt><dd>${escapeHtml(formatCampusStatus(company.campusHiringStatus))}</dd></div>
          <div><dt>最近校招信号</dt><dd>${escapeHtml(company.campusHiringLastSeenAt)}</dd></div>
          <div><dt>链接类型</dt><dd>${escapeHtml(formatJobUrlType(company.primaryJobUrlType))}</dd></div>
          <div><dt>链接状态</dt><dd>${company.primaryJobUrlVerified ? "已核验" : "待复核"}</dd></div>
          <div><dt>工作省份</dt><dd>${escapeHtml(company.provinces.join("、"))}</dd></div>
          <div><dt>覆盖城市</dt><dd>${escapeHtml(company.cities.join("、"))}</dd></div>
          <div><dt>标签</dt><dd>${escapeHtml(company.tags.join("、"))}</dd></div>
          <div><dt>员工口径</dt><dd>${escapeHtml(company.employeeScaleText)}</dd></div>
        </dl>
      </article>

      <article class="panel detail-panel">
        <h2>备注</h2>
        <p>${escapeHtml(company.notes || "当前无额外备注。")}</p>
      </article>

      <article class="panel detail-panel detail-panel-wide">
        <h2>证据列表</h2>
        <div class="evidence-list">
          ${company.evidence
            .map(
              (item) => `
                <article class="evidence-card">
                  <div class="tag-row">
                    <span class="tag-chip">${escapeHtml(formatSourceType(item.sourceType))}</span>
                    ${item.isPrimary ? '<span class="tag-chip tag-chip-strong">主证据</span>' : ""}
                    ${item.supportsEmployeeScale ? '<span class="tag-chip">支持规模</span>' : ""}
                    ${item.supportsCampusHiring ? '<span class="tag-chip">支持校招</span>' : ""}
                  </div>
                  <h3><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h3>
                  <p>${escapeHtml(item.excerpt)}</p>
                  <p class="evidence-meta">
                    ${escapeHtml(item.publisher)}
                    <span>抓取时间 ${escapeHtml(item.capturedAt)}</span>
                    ${item.publishedAt ? `<span>页面时间 ${escapeHtml(item.publishedAt)}</span>` : ""}
                  </p>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderMissing(message) {
  root.innerHTML = `
    <section class="panel loading-panel">
      <p class="eyebrow">Not Found</p>
      <h1>没有找到公司详情</h1>
      <p>${escapeHtml(message)}</p>
      <a class="ghost-button" href="./">返回列表</a>
    </section>
  `;
}
