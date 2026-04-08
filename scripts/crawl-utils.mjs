import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const rootDir = process.cwd();
export const dataDir = path.join(rootDir, "data");
export const companiesPath = path.join(dataDir, "companies.json");
export const crawlSourcesPath = path.join(dataDir, "crawl-sources.json");
export const jobsPath = path.join(dataDir, "jobs.json");
export const crawlRunsPath = path.join(dataDir, "crawl-runs.json");

const REQUEST_TIMEOUT_MS = 20000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DISCOVERY_KEYWORDS = [
  "招聘",
  "校招",
  "校园",
  "应届生",
  "实习",
  "careers",
  "career",
  "jobs",
  "campus",
  "students",
  "graduate",
  "join",
  "join-us",
  "recruit"
];

const STRONG_JOB_TITLE_PATTERNS = [
  /工程师/,
  /开发/,
  /前端/,
  /后端/,
  /测试/,
  /算法/,
  /数据/,
  /产品经理?/,
  /设计师?/,
  /运营(?!商)/,
  /销售/,
  /市场/,
  /供应链/,
  /制造/,
  /财务/,
  /法务/,
  /人力/,
  /职能/,
  /管培生/,
  /培训生/,
  /实习/,
  /校招/,
  /应届/,
  /Java/i,
  /C\+\+/,
  /Android/i,
  /iOS/i,
  /AI/i,
  /芯片/,
  /硬件/,
  /软件/,
  /engineer/i,
  /developer/i,
  /designer/i,
  /intern/i,
  /graduate/i
];

const EXCLUDED_JOB_TITLE_PATTERNS = [
  /业务$/,
  /消费者业务/,
  /企业业务/,
  /运营商业务/,
  /解决方案/,
  /校园招聘$/,
  /社会招聘$/,
  /招聘流程/,
  /校招流程/,
  /常见问题/,
  /FAQ/i,
  /关于我们/,
  /加入我们$/,
  /品牌/,
  /新闻/,
  /首页/
];

const GENERIC_LINK_TEXT = new Set([
  "首页",
  "主页",
  "更多",
  "查看更多",
  "查看全部",
  "点击查看",
  "招聘信息",
  "校园招聘",
  "社会招聘",
  "校招岗位",
  "岗位列表",
  "了解更多",
  "立即投递",
  "申请职位",
  "职位详情",
  "详情",
  "校招",
  "实习"
]);

const COMMON_RECRUIT_PATHS = ["/careers", "/jobs", "/campus", "/recruit", "/join", "/join-us"];

const LOCATION_PATTERNS = [
  "北京",
  "上海",
  "深圳",
  "广州",
  "杭州",
  "成都",
  "西安",
  "南京",
  "武汉",
  "苏州",
  "长沙",
  "合肥",
  "重庆",
  "天津",
  "青岛",
  "厦门",
  "东莞",
  "珠海",
  "佛山",
  "全国"
];

export function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function parseArgs(argv) {
  const args = { company: null, source: null, limit: Number.POSITIVE_INFINITY, dryRun: false, verbose: false };

  for (const item of argv) {
    if (item === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (item === "--verbose") {
      args.verbose = true;
      continue;
    }

    if (item.startsWith("--company=")) {
      args.company = item.slice("--company=".length);
      continue;
    }

    if (item.startsWith("--source=")) {
      args.source = item.slice("--source=".length);
      continue;
    }

    if (item.startsWith("--limit=")) {
      const parsed = Number.parseInt(item.slice("--limit=".length), 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.limit = parsed;
      }
    }
  }

  return args;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createHash(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

export function stripTags(input) {
  return normalizeWhitespace(
    input
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/gi, '"')
  );
}

export function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function looksLikeRecruitmentUrl(value) {
  const normalized = String(value || "").toLowerCase();
  return DISCOVERY_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function scoreRecruitmentCandidate(url, text = "") {
  const normalizedUrl = String(url || "").toLowerCase();
  const normalizedText = String(text || "").toLowerCase();
  let score = 0;

  for (const keyword of DISCOVERY_KEYWORDS) {
    const needle = keyword.toLowerCase();
    if (normalizedUrl.includes(needle)) {
      score += 3;
    }

    if (normalizedText.includes(needle)) {
      score += 2;
    }
  }

  if (normalizedUrl.includes("/campus")) {
    score += 3;
  }

  if (normalizedUrl.includes("/job") || normalizedUrl.includes("/jobs")) {
    score += 2;
  }

  return score;
}

export async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        pragma: "no-cache",
        "cache-control": "no-cache"
      }
    });
    const html = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      html,
      contentType: response.headers.get("content-type") || ""
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json,text/plain,*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        pragma: "no-cache",
        "cache-control": "no-cache",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let data = null;

    if (text) {
      data = JSON.parse(text);
    }

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      data
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function safeResolveUrl(candidate, baseUrl) {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

export function extractLinks(html, pageUrl) {
  const results = [];
  const anchorRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorRegex)) {
    const href = normalizeWhitespace(match[2]);
    if (!href || href.startsWith("javascript:") || href.startsWith("#")) {
      continue;
    }

    const url = safeResolveUrl(href, pageUrl);
    if (!url) {
      continue;
    }

    const text = stripTags(match[3]);
    results.push({ url, text });
  }

  return results;
}

export async function discoverResolvedUrl(source) {
  const candidates = new Map();

  function addCandidate(url, text = "", extraScore = 0) {
    if (!url) {
      return;
    }

    const previous = candidates.get(url);
    const score = scoreRecruitmentCandidate(url, text) + extraScore;

    if (!previous || score > previous.score) {
      candidates.set(url, { url, text, score });
    }
  }

  addCandidate(source.seedUrl, source.label, 1);

  const seedResult = await fetchHtml(source.seedUrl);
  if (seedResult.ok && seedResult.html) {
    for (const link of extractLinks(seedResult.html, seedResult.finalUrl || source.seedUrl)) {
      try {
        const sourceOrigin = new URL(source.seedUrl).origin;
        if (new URL(link.url).origin !== sourceOrigin) {
          continue;
        }
      } catch {
        continue;
      }

      addCandidate(link.url, link.text);
    }
  }

  for (const commonPath of COMMON_RECRUIT_PATHS) {
    addCandidate(safeResolveUrl(commonPath, source.seedUrl), commonPath, 2);
  }

  const ranked = Array.from(candidates.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  let best = {
    url: source.resolvedUrl || source.seedUrl,
    score: -1,
    finalUrl: source.resolvedUrl || source.seedUrl
  };

  for (const candidate of ranked) {
    try {
      const result = await fetchHtml(candidate.url);
      const bodyText = stripTags(result.html).toLowerCase();
      let score = candidate.score;

      if (result.ok) {
        score += 2;
      }

      if (looksLikeRecruitmentUrl(result.finalUrl)) {
        score += 3;
      }

      if (DISCOVERY_KEYWORDS.some((keyword) => bodyText.includes(keyword.toLowerCase()))) {
        score += 2;
      }

      if (score > best.score) {
        best = {
          url: candidate.url,
          score,
          finalUrl: result.finalUrl || candidate.url
        };
      }
    } catch {
      continue;
    }
  }

  return {
    resolvedUrl: best.finalUrl || best.url || source.seedUrl,
    score: best.score
  };
}

function looksLikeJobTitle(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized || normalized.length < 4 || normalized.length > 80) {
    return false;
  }

  if (GENERIC_LINK_TEXT.has(normalized)) {
    return false;
  }

  if (EXCLUDED_JOB_TITLE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  return STRONG_JOB_TITLE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function detectJobType(title, snippet) {
  const combined = `${title} ${snippet}`.toLowerCase();

  if (combined.includes("实习") || combined.includes("intern")) {
    return "intern";
  }

  if (combined.includes("校招") || combined.includes("应届") || combined.includes("graduate")) {
    return "campus";
  }

  if (combined.includes("全职") || combined.includes("正式")) {
    return "full-time";
  }

  return undefined;
}

function detectLocation(snippet) {
  for (const location of LOCATION_PATTERNS) {
    if (snippet.includes(location)) {
      return location;
    }
  }

  return undefined;
}

function extractDescriptionSnippet(html, startIndex) {
  const snippet = stripTags(html.slice(Math.max(0, startIndex - 180), startIndex + 220));
  return snippet.length > 280 ? `${snippet.slice(0, 280)}...` : snippet;
}

export function extractJobsFromHtml({ company, html, source, pageUrl, fetchedAt }) {
  const jobs = [];
  const seen = new Set();
  const anchorRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorRegex)) {
    const href = normalizeWhitespace(match[2]);
    const title = stripTags(match[3]);

    if (!looksLikeJobTitle(title)) {
      continue;
    }

    const applyUrl = safeResolveUrl(href, pageUrl);
    if (!applyUrl) {
      continue;
    }

    const snippet = extractDescriptionSnippet(html, match.index ?? 0);
    const location = detectLocation(snippet);
    const fingerprint = createHash(
      [company.id, source.id, normalizeWhitespace(title).toLowerCase(), location || "", applyUrl].join("|")
    );

    if (seen.has(fingerprint)) {
      continue;
    }

    seen.add(fingerprint);
    jobs.push({
      id: `${company.id}-${fingerprint.slice(0, 12)}`,
      companyId: company.id,
      sourceId: source.id,
      title: normalizeWhitespace(title),
      location,
      department: undefined,
      jobType: detectJobType(title, snippet),
      education: undefined,
      deadline: undefined,
      applyUrl,
      descriptionText: snippet || undefined,
      extractedFromUrl: pageUrl,
      fetchedAt,
      firstSeenAt: fetchedAt,
      lastSeenAt: fetchedAt,
      isActive: true,
      fingerprint
    });
  }

  return jobs.slice(0, 40);
}

function toDateString(value) {
  if (!value) {
    return undefined;
  }

  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : undefined;
}

function buildHuaweiCampusDetailUrl(item) {
  const detailUrl = new URL("campus-recruitment-detail.html", "https://career.huawei.com/reccampportal/portal5/");
  detailUrl.searchParams.set("jobId", String(item.jobId));
  detailUrl.searchParams.set("dataSource", String(item.dataSource ?? 1));
  detailUrl.searchParams.set("jobType", "0");
  detailUrl.searchParams.set("recruitType", "CR");
  detailUrl.searchParams.set("sourceType", "001");
  return detailUrl.toString();
}

async function extractHuaweiCampusJobs({ company, source, fetchedAt }) {
  const headers = {
    "x-jalor-tenantAlias": "hcm",
    referer: source.resolvedUrl || source.seedUrl
  };

  async function fetchPage(page) {
    const query = new URLSearchParams({
      jobTypes: "2",
      jobType: "0",
      language: "zh_CN",
      orderBy: "ISS_STARTDATE_DESC_AND_IS_HOT_JOB",
      reqTime: String(Date.now())
    });
    const url = `https://career.huawei.com/reccampportal/services/portal/portalpub/getJob/newHr/page/100/${page}?${query}`;
    const result = await fetchJson(url, { headers });

    if (!result.ok || !result.data) {
      throw new Error(`Huawei jobs API failed with status ${result.status}`);
    }

    return result.data;
  }

  const firstPage = await fetchPage(1);
  const totalPages = Math.max(1, Number(firstPage?.pageVO?.totalPages || 1));
  const items = [...(firstPage?.result || [])];

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchPage(page);
    items.push(...(nextPage?.result || []));
  }

  return items
    .filter((item) => item && item.jobId && normalizeWhitespace(item.jobname || item.nameCn))
    .map((item) => {
      const title = normalizeWhitespace(item.jobname || item.nameCn);
      const detailUrl = buildHuaweiCampusDetailUrl(item);
      const location = normalizeWhitespace(String(item.jobArea || item.jobAddress || "").replaceAll("中国/", ""));
      const descriptionText = normalizeWhitespace(
        [
          item.mainBusiness ? `岗位职责：${item.mainBusiness}` : "",
          item.jobRequire ? `岗位要求：${item.jobRequire}` : ""
        ]
          .filter(Boolean)
          .join("\n")
      );
      const fingerprint = createHash([company.id, source.id, item.jobId].join("|"));

      return {
        id: `${company.id}-${item.jobId}`,
        companyId: company.id,
        sourceId: source.id,
        title,
        location: location || undefined,
        department: normalizeWhitespace(item.jobFamilyName || item.deptName || "") || undefined,
        jobType: "campus",
        education: normalizeWhitespace(item.degree || "") || undefined,
        deadline: toDateString(item.expirationDate),
        applyUrl: detailUrl,
        descriptionText: descriptionText || undefined,
        extractedFromUrl: source.resolvedUrl || source.seedUrl,
        fetchedAt,
        firstSeenAt: fetchedAt,
        lastSeenAt: fetchedAt,
        isActive: true,
        fingerprint
      };
    });
}

export async function extractJobsWithAdapter({ company, source, fetchedAt }) {
  if (source.id === "huawei-campus" || company.slug === "huawei") {
    return extractHuaweiCampusJobs({ company, source, fetchedAt });
  }

  return null;
}
