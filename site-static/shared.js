const INDUSTRY_GROUPS = [
  { name: "金融", keywords: ["银行", "证券", "保险", "金融", "投资银行"] },
  { name: "医疗健康", keywords: ["医药", "医疗", "生物", "生命科学", "器械", "科学仪器", "农化"] },
  { name: "汽车与出行", keywords: ["汽车", "出行", "轨道交通"] },
  { name: "半导体与芯片", keywords: ["半导体", "芯片", "显示"] },
  {
    name: "通信与电子",
    keywords: ["通信", "ICT", "电子信息", "安防", "智能物联", "消费电子", "智能终端", "智能硬件", "信息技术硬件"]
  },
  { name: "软件与企业服务", keywords: ["企业软件", "软件", "云计算", "咨询", "审计", "技术服务"] },
  {
    name: "互联网与平台",
    keywords: ["互联网", "电商", "内容", "平台", "本地生活", "广告与媒体", "办公软件", "教育科技", "游戏与互联网"]
  },
  {
    name: "消费品与零售",
    keywords: ["零售", "快消", "食品", "饮料", "消费品牌", "服饰", "乳业", "美妆", "潮流零售", "旅游与消费", "跨境电商与时尚"]
  },
  { name: "物流与供应链", keywords: ["物流", "供应链", "航运", "邮政", "航空运输"] },
  { name: "基建与工程", keywords: ["基建", "工程", "建筑"] },
  { name: "航空航天与军工", keywords: ["航空航天", "军工", "航天", "航空工业", "航空制造", "核能"] },
  { name: "能源与材料", keywords: ["能源", "电力", "油气", "光伏", "新能源", "电池", "储能", "化工", "材料", "钢铁", "建材", "金属", "资源", "工业气体", "环保"] },
  { name: "工业制造与自动化", keywords: ["工业", "制造", "自动化", "装备", "精密", "光学", "机器人"] },
  { name: "综合集团", keywords: ["综合", "综合性央企", "综合产业"] }
];

const CONFIDENCE_ORDER = {
  A: 0,
  B: 1,
  C: 2
};

export async function loadDataset() {
  const [companiesResponse, metaResponse] = await Promise.all([
    fetch("./data/companies.json"),
    fetch("./data/meta.json")
  ]);

  if (!companiesResponse.ok) {
    throw new Error(`Failed to load companies.json: ${companiesResponse.status}`);
  }

  if (!metaResponse.ok) {
    throw new Error(`Failed to load meta.json: ${metaResponse.status}`);
  }

  const [companies, meta] = await Promise.all([companiesResponse.json(), metaResponse.json()]);

  return { companies, meta };
}

export function getIndustryGroup(industry) {
  for (const group of INDUSTRY_GROUPS) {
    if (group.keywords.some((keyword) => industry.includes(keyword))) {
      return group.name;
    }
  }

  return "其他";
}

export function getIndustryGroups() {
  return INDUSTRY_GROUPS.map((group) => group.name).concat("其他");
}

export function getSearchableText(company) {
  return [
    company.name,
    company.nameEn,
    company.companyType,
    company.ownershipType,
    company.industry,
    company.description,
    company.hqCountry,
    company.chinaPresence,
    company.notes,
    ...(company.aliases || []),
    ...(company.tags || []),
    ...(company.provinces || []),
    ...(company.cities || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function parseListState(search) {
  const params = new URLSearchParams(search);

  return {
    q: (params.get("q") || "").trim(),
    companyType: params.getAll("companyType").filter(Boolean),
    industry: params.getAll("industry").filter(Boolean),
    province: params.getAll("province").filter(Boolean),
    linkStatus: params.getAll("linkStatus").filter(Boolean),
    page: normalizePositiveInt(params.get("page"), 1),
    pageSize: normalizePageSize(params.get("pageSize"))
  };
}

export function serializeListState(state) {
  const params = new URLSearchParams();

  if (state.q) {
    params.set("q", state.q);
  }

  appendMany(params, "companyType", state.companyType);
  appendMany(params, "industry", state.industry);
  appendMany(params, "province", state.province);
  appendMany(params, "linkStatus", state.linkStatus);

  if (state.pageSize !== 12) {
    params.set("pageSize", String(state.pageSize));
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }

  return params;
}

function appendMany(params, key, values) {
  for (const value of unique(values)) {
    params.append(key, value);
  }
}

export function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function normalizePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePageSize(value) {
  const parsed = normalizePositiveInt(value, 12);
  return [12, 24, 48].includes(parsed) ? parsed : 12;
}

export function filterCompanies(companies, state) {
  const keyword = state.q.toLowerCase();

  return companies.filter((company) => {
    if (keyword && !getSearchableText(company).includes(keyword)) {
      return false;
    }

    if (state.companyType.length > 0 && !state.companyType.includes(company.companyType)) {
      return false;
    }

    if (state.industry.length > 0 && !state.industry.includes(getIndustryGroup(company.industry))) {
      return false;
    }

    if (state.province.length > 0 && !company.provinces.some((province) => state.province.includes(province))) {
      return false;
    }

    if (state.linkStatus.length > 0) {
      const currentStatus = company.primaryJobUrlVerified ? "已核验" : "待复核";
      if (!state.linkStatus.includes(currentStatus)) {
        return false;
      }
    }

    return true;
  });
}

export function sortCompanies(companies) {
  return companies.slice().sort((left, right) => {
    const confidenceGap = (CONFIDENCE_ORDER[left.confidenceLevel] ?? 99) - (CONFIDENCE_ORDER[right.confidenceLevel] ?? 99);
    if (confidenceGap !== 0) {
      return confidenceGap;
    }

    const dateGap = right.campusHiringLastSeenAt.localeCompare(left.campusHiringLastSeenAt);
    if (dateGap !== 0) {
      return dateGap;
    }

    return left.name.localeCompare(right.name, "zh-CN");
  });
}

export function paginate(companies, page, pageSize) {
  const total = companies.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: companies.slice(start, end),
    total,
    totalPages,
    currentPage
  };
}

export function getFilterOptions(companies) {
  return {
    companyTypes: unique(companies.map((company) => company.companyType)).sort((left, right) => left.localeCompare(right, "zh-CN")),
    industries: unique(companies.map((company) => getIndustryGroup(company.industry))),
    provinces: unique(companies.flatMap((company) => company.provinces || [])).sort((left, right) => left.localeCompare(right, "zh-CN")),
    linkStatuses: ["已核验", "待复核"]
  };
}

export function getStats(companies) {
  return {
    total: companies.length,
    activeCampus: companies.filter((company) => company.campusHiringStatus === "active").length,
    verifiedLinks: companies.filter((company) => company.primaryJobUrlVerified).length
  };
}

export function getVisiblePages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages).filter((value) => value >= 1 && value <= totalPages).sort((left, right) => left - right);
}

export function formatCampusStatus(status) {
  switch (status) {
    case "active":
      return "当前可见校招信号";
    case "likely_active":
      return "高概率仍在招";
    case "uncertain":
      return "待复核";
    default:
      return status;
  }
}

export function formatJobUrlType(type) {
  switch (type) {
    case "official_campus":
      return "官方校招";
    case "official_careers":
      return "官方招聘";
    case "university_job_board":
      return "高校就业网";
    case "third_party_job_board":
      return "第三方招聘页";
    default:
      return type;
  }
}

export function formatSourceType(type) {
  switch (type) {
    case "official_campus":
      return "官方校招";
    case "official_careers":
      return "官方招聘";
    case "official_china_profile":
      return "官方中国业务页";
    case "annual_report":
      return "年报";
    case "esg_report":
      return "ESG 报告";
    case "university_job_board":
      return "高校就业网";
    case "third_party_job_board":
      return "第三方招聘页";
    case "manual_note":
      return "人工备注";
    default:
      return type;
  }
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
