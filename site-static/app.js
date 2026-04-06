import {
  escapeHtml,
  filterCompanies,
  formatCampusStatus,
  formatJobUrlType,
  getFilterOptions,
  getIndustryGroup,
  getStats,
  getVisiblePages,
  loadDataset,
  paginate,
  parseListState,
  serializeListState,
  sortCompanies,
  unique
} from "./shared.js";

const state = parseListState(window.location.search);
const elements = {
  keywordInput: document.querySelector("#keyword-input"),
  pageSizeSelect: document.querySelector("#page-size-select"),
  resetButton: document.querySelector("#reset-button"),
  companyTypeOptions: document.querySelector("#company-type-options"),
  industryOptions: document.querySelector("#industry-options"),
  provinceOptions: document.querySelector("#province-options"),
  linkStatusOptions: document.querySelector("#link-status-options"),
  resultsGrid: document.querySelector("#results-grid"),
  pagination: document.querySelector("#pagination"),
  emptyState: document.querySelector("#empty-state"),
  activeFilters: document.querySelector("#active-filters"),
  resultsTitle: document.querySelector("#results-title"),
  snapshotDate: document.querySelector("#snapshot-date"),
  totalCount: document.querySelector("#total-count"),
  visibleCount: document.querySelector("#visible-count"),
  activeCampusCount: document.querySelector("#active-campus-count"),
  verifiedLinkCount: document.querySelector("#verified-link-count"),
  typeCount: document.querySelector("#type-count"),
  industryCount: document.querySelector("#industry-count"),
  provinceCount: document.querySelector("#province-count"),
  linkCount: document.querySelector("#link-count")
};

let dataset = [];
let meta = null;
let options = null;

initialize().catch((error) => {
  console.error(error);
  elements.resultsTitle.textContent = "数据加载失败";
  elements.resultsGrid.innerHTML = `
    <article class="panel empty-state">
      <h3>无法加载数据</h3>
      <p>${escapeHtml(error.message)}</p>
    </article>
  `;
});

async function initialize() {
  const loaded = await loadDataset();
  dataset = loaded.companies;
  meta = loaded.meta;
  options = getFilterOptions(dataset);

  wireEvents();
  hydrateControls();
  renderFilterOptions();
  render();
}

function wireEvents() {
  elements.keywordInput.addEventListener("input", () => {
    state.q = elements.keywordInput.value.trim();
    state.page = 1;
    commitState();
  });

  elements.pageSizeSelect.addEventListener("change", () => {
    state.pageSize = Number(elements.pageSizeSelect.value);
    state.page = 1;
    commitState();
  });

  elements.resetButton.addEventListener("click", () => {
    state.q = "";
    state.companyType = [];
    state.industry = [];
    state.province = [];
    state.linkStatus = [];
    state.page = 1;
    state.pageSize = 12;
    commitState();
  });

  window.addEventListener("popstate", () => {
    const nextState = parseListState(window.location.search);
    Object.assign(state, nextState);
    hydrateControls();
    render();
  });
}

function hydrateControls() {
  elements.keywordInput.value = state.q;
  elements.pageSizeSelect.value = String(state.pageSize);
}

function renderFilterOptions() {
  renderChoiceGroup(elements.companyTypeOptions, options.companyTypes, state.companyType, "companyType");
  renderChoiceGroup(elements.industryOptions, options.industries, state.industry, "industry");
  renderChoiceGroup(elements.provinceOptions, options.provinces, state.province, "province");
  renderChoiceGroup(elements.linkStatusOptions, options.linkStatuses, state.linkStatus, "linkStatus");
}

function renderChoiceGroup(container, values, selectedValues, key) {
  container.innerHTML = values
    .map((value) => {
      const isSelected = selectedValues.includes(value);
      return `
        <label class="choice-pill ${isSelected ? "is-selected" : ""}">
          <input type="checkbox" data-key="${key}" value="${escapeHtml(value)}" ${isSelected ? "checked" : ""}>
          <span>${escapeHtml(value)}</span>
        </label>
      `;
    })
    .join("");

  container.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.currentTarget;
      const value = target.value;
      const list = state[key];
      if (target.checked) {
        state[key] = unique(list.concat(value));
      } else {
        state[key] = list.filter((item) => item !== value);
      }
      state.page = 1;
      commitState();
    });
  });
}

function commitState(push = false) {
  const params = serializeListState(state);
  const query = params.toString();
  const nextUrl = query ? `?${query}` : "./";
  const method = push ? "pushState" : "replaceState";
  window.history[method](null, "", nextUrl);
  hydrateControls();
  renderFilterOptions();
  render();
}

function render() {
  const filtered = sortCompanies(filterCompanies(dataset, state));
  const pageResult = paginate(filtered, state.page, state.pageSize);
  state.page = pageResult.currentPage;

  const visibleStats = getStats(filtered);

  elements.snapshotDate.textContent = meta.snapshotDate;
  elements.totalCount.textContent = String(meta.totalCompanies);
  elements.visibleCount.textContent = String(pageResult.total);
  elements.activeCampusCount.textContent = `当前可见校招信号 ${visibleStats.activeCampus}`;
  elements.verifiedLinkCount.textContent = `已核验链接 ${visibleStats.verifiedLinks}`;
  elements.resultsTitle.textContent = `共 ${pageResult.total} 家，当前第 ${pageResult.currentPage} / ${pageResult.totalPages} 页`;
  elements.typeCount.textContent = String(state.companyType.length);
  elements.industryCount.textContent = String(state.industry.length);
  elements.provinceCount.textContent = String(state.province.length);
  elements.linkCount.textContent = String(state.linkStatus.length);

  renderActiveFilters();
  renderCards(pageResult.items);
  renderPagination(pageResult.currentPage, pageResult.totalPages);
  elements.emptyState.classList.toggle("hidden", pageResult.total > 0);
}

function renderActiveFilters() {
  const chips = [];

  if (state.q) {
    chips.push(renderFilterChip(`关键词: ${state.q}`, () => {
      state.q = "";
    }));
  }

  for (const value of state.companyType) {
    chips.push(renderFilterChip(value, () => {
      state.companyType = state.companyType.filter((item) => item !== value);
    }));
  }

  for (const value of state.industry) {
    chips.push(renderFilterChip(value, () => {
      state.industry = state.industry.filter((item) => item !== value);
    }));
  }

  for (const value of state.province) {
    chips.push(renderFilterChip(value, () => {
      state.province = state.province.filter((item) => item !== value);
    }));
  }

  for (const value of state.linkStatus) {
    chips.push(renderFilterChip(value, () => {
      state.linkStatus = state.linkStatus.filter((item) => item !== value);
    }));
  }

  elements.activeFilters.innerHTML = chips.join("");
  elements.activeFilters.classList.toggle("hidden", chips.length === 0);

  elements.activeFilters.querySelectorAll("button[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.remove;
      const value = button.dataset.value;

      if (type === "keyword") {
        state.q = "";
      } else {
        state[type] = state[type].filter((item) => item !== value);
      }

      state.page = 1;
      commitState();
    });
  });
}

function renderFilterChip(label) {
  const type = inferRemovalKey(label);
  return `<span class="active-filter-chip">
    ${escapeHtml(label)}
    <button type="button" data-remove="${type.key}" data-value="${escapeHtml(type.value)}" aria-label="移除 ${escapeHtml(label)}">×</button>
  </span>`;
}

function inferRemovalKey(label) {
  if (label.startsWith("关键词: ")) {
    return { key: "keyword", value: "" };
  }

  if (state.companyType.includes(label)) {
    return { key: "companyType", value: label };
  }

  if (state.industry.includes(label)) {
    return { key: "industry", value: label };
  }

  if (state.province.includes(label)) {
    return { key: "province", value: label };
  }

  return { key: "linkStatus", value: label };
}

function renderCards(companies) {
  elements.resultsGrid.innerHTML = companies
    .map((company) => {
      const locationLabel = company.provinces[0] === "全国" ? "全国" : company.provinces.join(" / ");
      const industryGroup = getIndustryGroup(company.industry);
      return `
        <article class="result-card">
          <div class="result-card-top">
            <div>
              <p class="card-eyebrow">${escapeHtml(company.companyType)} · ${escapeHtml(company.ownershipType)}</p>
              <h3>${escapeHtml(company.name)}</h3>
              <p class="card-description">${escapeHtml(company.description)}</p>
            </div>
            <span class="confidence-badge confidence-${escapeHtml(company.confidenceLevel)}">${escapeHtml(company.confidenceLevel)} 级</span>
          </div>

          <div class="card-meta-grid">
            <div>
              <span class="meta-label">行业</span>
              <strong>${escapeHtml(company.industry)}</strong>
              <span class="meta-subtle">${escapeHtml(industryGroup)}</span>
            </div>
            <div>
              <span class="meta-label">工作地点</span>
              <strong>${escapeHtml(locationLabel)}</strong>
              <span class="meta-subtle">${escapeHtml(company.cities.join(" / "))}</span>
            </div>
            <div>
              <span class="meta-label">校招状态</span>
              <strong>${escapeHtml(formatCampusStatus(company.campusHiringStatus))}</strong>
              <span class="meta-subtle">最近信号 ${escapeHtml(company.campusHiringLastSeenAt)}</span>
            </div>
            <div>
              <span class="meta-label">招聘链接</span>
              <strong>${escapeHtml(formatJobUrlType(company.primaryJobUrlType))}</strong>
              <span class="meta-subtle">${company.primaryJobUrlVerified ? "已核验" : "待复核"}</span>
            </div>
          </div>

          <div class="tag-row">
            ${(company.tags || []).slice(0, 5).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
          </div>

          <div class="card-actions">
            <a class="primary-button" href="${escapeHtml(company.primaryJobUrl)}" target="_blank" rel="noreferrer">查看招聘</a>
            <a class="secondary-button" href="./company.html?slug=${encodeURIComponent(company.slug)}">查看详情</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  const pages = getVisiblePages(page, totalPages);
  const pieces = [];

  pieces.push(renderPaginationButton("上一页", page > 1 ? page - 1 : null, page <= 1));

  for (let index = 0; index < pages.length; index += 1) {
    const current = pages[index];
    const previous = pages[index - 1];
    if (previous && current - previous > 1) {
      pieces.push(`<span class="pagination-gap">…</span>`);
    }
    pieces.push(renderPaginationButton(String(current), current, false, current === page));
  }

  pieces.push(renderPaginationButton("下一页", page < totalPages ? page + 1 : null, page >= totalPages));

  elements.pagination.innerHTML = pieces.join("");
  elements.pagination.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = Number(button.dataset.page);
      commitState(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderPaginationButton(label, nextPage, disabled, active = false) {
  const classes = ["pagination-button"];
  if (active) {
    classes.push("is-active");
  }

  return `
    <button class="${classes.join(" ")}" type="button" ${disabled ? "disabled" : `data-page="${nextPage}"`}>
      ${escapeHtml(label)}
    </button>
  `;
}
