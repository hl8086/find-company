import {
  escapeHtml,
  filterCompanies,
  formatCampusStatus,
  getFilterOptions,
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
  tableHead: document.querySelector("#table-head"),
  tableBody: document.querySelector("#table-body"),
  emptyState: document.querySelector("#empty-state"),
  resetButton: document.querySelector("#reset-button"),
  paginationBar: document.querySelector("#pagination-bar"),
  paginationSummary: document.querySelector("#pagination-summary"),
  paginationLinks: document.querySelector("#pagination-links"),
  externalLinkModal: document.querySelector("#external-link-modal"),
  externalLinkUrl: document.querySelector("#external-link-url"),
  externalLinkCancel: document.querySelector("#external-link-cancel"),
  externalLinkConfirm: document.querySelector("#external-link-confirm")
};

let dataset = [];
let options = null;
let openFilterKey = null;
let qSelection = null;
let qDraft = state.q;
let qIsComposing = false;
let qCommitTimer = null;

initialize().catch((error) => {
  console.error(error);
  elements.tableBody.innerHTML = `
    <div class="empty-state">
      <h2>数据加载失败</h2>
      <p class="muted">${escapeHtml(error.message)}</p>
    </div>
  `;
});

async function initialize() {
  const loaded = await loadDataset();
  dataset = loaded.companies;
  options = getFilterOptions(dataset);

  wireGlobalEvents();
  render();
}

function wireGlobalEvents() {
  elements.resetButton.addEventListener("click", () => {
    qDraft = "";
    state.q = "";
    state.companyType = [];
    state.industry = [];
    state.province = [];
    state.linkStatus = [];
    state.page = 1;
    state.pageSize = 10;
    commitState();
  });

  elements.externalLinkModal.addEventListener("click", (event) => {
    if (event.target === elements.externalLinkModal) {
      closeExternalModal();
    }
  });

  elements.externalLinkCancel.addEventListener("click", closeExternalModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeExternalModal();
      closeFilterMenus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("details[data-filter-menu]")) {
      closeFilterMenus();
    }
  });

  window.addEventListener("popstate", () => {
    const nextState = parseListState(window.location.search);
    Object.assign(state, nextState);
    qDraft = state.q;
    render();
  });
}

function commitState(push = false) {
  const params = serializeListState(state).toString();
  const nextUrl = params ? `?${params}` : window.location.pathname;
  const method = push ? "pushState" : "replaceState";
  window.history[method](null, "", nextUrl);
  render();
}

function render() {
  const filtered = sortCompanies(filterCompanies(dataset, state));
  const pageResult = paginate(filtered, state.page, state.pageSize);
  state.page = pageResult.currentPage;

  renderTableHead();
  renderTableBody(pageResult.items);
  renderPagination(pageResult);

  elements.emptyState.classList.toggle("hidden", pageResult.total > 0);
  elements.tableBody.classList.toggle("hidden", pageResult.total === 0);
  elements.paginationBar.classList.toggle("hidden", pageResult.total === 0);
}

function renderTableHead() {
  elements.tableHead.innerHTML = `
    <div class="${getHeadCellClassName(Boolean(state.q.trim()))}">
      <details class="header-filter" data-filter-menu="q" ${openFilterKey === "q" ? "open" : ""}>
        <summary class="header-filter-summary" title="公司">
          <span class="${state.q.trim() ? "header-filter-label active" : "header-filter-label"}">公司</span>
          <span class="${state.q.trim() ? "header-filter-caret active" : "header-filter-caret"}" aria-hidden="true"></span>
        </summary>
        <div class="header-filter-menu">
          <input id="filter-q" class="input header-filter-input" type="text" placeholder="搜索公司" value="${escapeHtml(qDraft)}">
          ${qDraft ? '<button class="header-filter-clear" type="button" data-clear-filter="q">清空</button>' : ""}
        </div>
      </details>
    </div>

    <div class="${getHeadCellClassName(state.companyType.length > 0)}">
      ${renderMultiChoiceMenu("企业类型", "companyType", options.companyTypes, state.companyType)}
    </div>

    <div class="${getHeadCellClassName(state.industry.length > 0)}">
      ${renderMultiChoiceMenu("行业", "industry", options.industries, state.industry)}
    </div>

    <div class="${getHeadCellClassName(state.province.length > 0)}">
      ${renderMultiChoiceMenu("工作地点", "province", options.provinces, state.province)}
    </div>

    <div class="${getHeadCellClassName(state.linkStatus.length > 0)}">
      ${renderMultiChoiceMenu("招聘链接状态", "linkStatus", options.linkStatuses, state.linkStatus)}
    </div>

    <div class="company-head-cell company-head-cell-end">
      <span>操作</span>
      ${hasActiveFilters() ? '<button class="header-filter-reset" type="button" data-reset-all="true">清空</button>' : ""}
    </div>
  `;

  wireTableHeadEvents();
}

function renderMultiChoiceMenu(label, key, values, selectedValues) {
  const active = selectedValues.length > 0;
  return `
    <details class="header-filter" data-filter-menu="${key}" ${openFilterKey === key ? "open" : ""}>
      <summary class="header-filter-summary" title="${escapeHtml(label)}">
        <span class="${active ? "header-filter-label active" : "header-filter-label"}">${escapeHtml(label)}</span>
        <span class="${active ? "header-filter-caret active" : "header-filter-caret"}" aria-hidden="true"></span>
      </summary>
      <div class="header-filter-menu">
        ${active ? `<button class="header-filter-clear" type="button" data-clear-filter="${key}">清空</button>` : ""}
        <div class="header-filter-list">
          ${values
            .map((value) => {
              const selected = selectedValues.includes(value);
              return `
                <button class="${selected ? "header-filter-option selected" : "header-filter-option"}" type="button" data-toggle-filter="${key}" data-value="${escapeHtml(value)}">
                  <span class="header-filter-check">${selected ? "✓" : ""}</span>
                  <span>${escapeHtml(value)}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    </details>
  `;
}

function wireTableHeadEvents() {
  const qInput = document.querySelector("#filter-q");
  if (qInput) {
    qInput.addEventListener("compositionstart", () => {
      qIsComposing = true;
    });

    qInput.addEventListener("compositionend", (event) => {
      qIsComposing = false;
      qDraft = event.currentTarget.value;
      qSelection = {
        start: event.currentTarget.selectionStart ?? event.currentTarget.value.length,
        end: event.currentTarget.selectionEnd ?? event.currentTarget.value.length
      };
      queueQCommit(true);
    });

    qInput.addEventListener("input", (event) => {
      qDraft = event.currentTarget.value;
      qSelection = {
        start: event.currentTarget.selectionStart ?? event.currentTarget.value.length,
        end: event.currentTarget.selectionEnd ?? event.currentTarget.value.length
      };
      openFilterKey = "q";
      if (!qIsComposing) {
        queueQCommit(false);
      }
    });
  }

  document.querySelectorAll("[data-clear-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.clearFilter;
      openFilterKey = key;
      if (key === "q") {
        qDraft = "";
        state.q = "";
      } else {
        state[key] = [];
      }
      state.page = 1;
      commitState();
    });
  });

  document.querySelectorAll("[data-toggle-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.toggleFilter;
      const value = button.dataset.value;
      openFilterKey = key;
      state[key] = toggleValue(state[key], value);
      state.page = 1;
      commitState();
    });
  });

  document.querySelectorAll("[data-reset-all]").forEach((button) => {
    button.addEventListener("click", () => {
      qDraft = "";
      state.q = "";
      state.companyType = [];
      state.industry = [];
      state.province = [];
      state.linkStatus = [];
      state.page = 1;
      commitState();
    });
  });

  document.querySelectorAll("details[data-filter-menu]").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) {
        if (openFilterKey === details.dataset.filterMenu) {
          openFilterKey = null;
        }
        return;
      }

      openFilterKey = details.dataset.filterMenu;

      document.querySelectorAll("details[data-filter-menu]").forEach((other) => {
        if (other !== details) {
          other.open = false;
        }
      });
    });
  });

  if (openFilterKey === "q" && qInput) {
    qInput.focus({ preventScroll: true });
    if (qSelection) {
      qInput.setSelectionRange(qSelection.start, qSelection.end);
    }
  }
}

function queueQCommit(immediate) {
  if (qCommitTimer) {
    window.clearTimeout(qCommitTimer);
    qCommitTimer = null;
  }

  const apply = () => {
    state.q = qDraft.trim();
    state.page = 1;
    commitState();
  };

  if (immediate) {
    apply();
    return;
  }

  qCommitTimer = window.setTimeout(() => {
    qCommitTimer = null;
    apply();
  }, 180);
}

function renderTableBody(companies) {
  elements.tableBody.innerHTML = companies
    .map((company) => {
      const locationLabel = company.provinces[0] === "全国" ? "全国" : company.provinces.join(" / ");
      return `
        <article class="company-row">
          <div class="company-row-cell company-row-main">
            <h3>
              <a href="${escapeHtml(company.primaryJobUrl)}" target="_blank" rel="noreferrer">${escapeHtml(company.name)}</a>
            </h3>
          </div>

          <div class="company-row-cell">
            <span class="row-label">企业类型</span>
            <span class="row-value">${escapeHtml(company.companyType)}</span>
          </div>

          <div class="company-row-cell">
            <span class="row-label">行业</span>
            <span class="row-value">${escapeHtml(company.industry)}</span>
          </div>

          <div class="company-row-cell">
            <span class="row-label">工作地点</span>
            <span class="row-value row-ellipsis" title="${escapeHtml(locationLabel)}">${escapeHtml(locationLabel)}</span>
          </div>

          <div class="company-row-cell">
            <span class="row-label">招聘链接状态</span>
            <span class="${company.primaryJobUrlVerified ? "chip success" : "chip warning"}">${company.primaryJobUrlVerified ? "已核验" : "待复核"}</span>
          </div>

          <div class="company-row-actions">
            <button class="button row-button external-link-trigger" type="button" data-href="${escapeHtml(company.primaryJobUrl)}">查看招聘</button>
            <a class="button-secondary row-button" href="./company.html?slug=${encodeURIComponent(company.slug)}">详情</a>
          </div>
        </article>
      `;
    })
    .join("");

  elements.tableBody.querySelectorAll(".external-link-trigger").forEach((button) => {
    button.addEventListener("click", () => openExternalModal(button.dataset.href));
  });
}

function renderPagination(pageResult) {
  elements.paginationSummary.innerHTML = `
    <span>共 ${pageResult.total} 条</span>
    <span>第 ${pageResult.currentPage} / ${pageResult.totalPages} 页</span>
  `;

  const pages = getVisiblePages(pageResult.currentPage, pageResult.totalPages);
  const pieces = [];

  pieces.push(renderPageLink("上一页", pageResult.currentPage - 1, pageResult.currentPage <= 1, false));

  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous && value - previous > 1) {
      pieces.push('<span class="pagination-gap">…</span>');
    }
    pieces.push(renderPageLink(String(value), value, false, value === pageResult.currentPage));
  });

  pieces.push(renderPageLink("下一页", pageResult.currentPage + 1, pageResult.currentPage >= pageResult.totalPages, false));
  pieces.push(renderPageSizeSelect(pageResult.pageSize));

  elements.paginationLinks.innerHTML = pieces.join("");

  elements.paginationLinks.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const nextPage = Number(link.dataset.page);
      state.page = nextPage;
      commitState(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const pageSizeSelect = elements.paginationLinks.querySelector("#page-size-select");
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (event) => {
      state.pageSize = Number(event.currentTarget.value);
      state.page = 1;
      commitState();
    });
  }
}

function renderPageLink(label, page, disabled, active) {
  if (disabled) {
    return `<span class="pagination-link disabled">${escapeHtml(label)}</span>`;
  }

  return `<a class="${active ? "pagination-link active" : "pagination-link"}" href="${escapeHtml(buildPageHref(page))}" data-page="${page}">${escapeHtml(label)}</a>`;
}

function renderPageSizeSelect(value) {
  return `
    <label class="page-size-select-wrap">
      <span>每页</span>
      <select id="page-size-select" class="select page-size-select">
        ${[10, 50, 100]
          .map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option} 条</option>`)
          .join("")}
      </select>
    </label>
  `;
}

function buildPageHref(page) {
  const params = serializeListState({
    ...state,
    page
  }).toString();

  return params ? `?${params}` : window.location.pathname;
}

function getHeadCellClassName(active, alignEnd = false) {
  if (active && alignEnd) {
    return "company-head-cell company-head-cell-active company-head-cell-end";
  }

  if (active) {
    return "company-head-cell company-head-cell-active";
  }

  if (alignEnd) {
    return "company-head-cell company-head-cell-end";
  }

  return "company-head-cell";
}

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : unique([...values, value]);
}

function hasActiveFilters() {
  return Boolean(
    state.q ||
      state.companyType.length > 0 ||
      state.industry.length > 0 ||
      state.province.length > 0 ||
      state.linkStatus.length > 0
  );
}

function closeFilterMenus() {
  openFilterKey = null;
  qSelection = null;
  if (qCommitTimer) {
    window.clearTimeout(qCommitTimer);
    qCommitTimer = null;
  }
  document.querySelectorAll("details[data-filter-menu]").forEach((details) => {
    details.open = false;
  });
}

function openExternalModal(href) {
  elements.externalLinkUrl.textContent = href;
  elements.externalLinkConfirm.href = href;
  elements.externalLinkModal.classList.remove("hidden");
}

function closeExternalModal() {
  elements.externalLinkUrl.textContent = "";
  elements.externalLinkConfirm.href = "#";
  elements.externalLinkModal.classList.add("hidden");
}
