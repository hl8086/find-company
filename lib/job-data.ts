import type { CrawlExtractMode, CrawlFetchMode, CrawlPriority, CrawlSource, Job, JobType } from "@/lib/types";
import crawlSourcesJson from "@/data/crawl-sources.json";
import jobsJson from "@/data/jobs.json";

const JOBS = jobsJson as Job[];
const CRAWL_SOURCES = crawlSourcesJson as CrawlSource[];

function compareDateDesc(left?: string, right?: string) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left < right ? 1 : left > right ? -1 : 0;
}

export function getJobsByCompanyId(companyId: string) {
  return JOBS.filter((job) => job.companyId === companyId).sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    const dateCompare = compareDateDesc(left.lastSeenAt, right.lastSeenAt);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return left.title.localeCompare(right.title, "zh-CN");
  });
}

export function getCrawlSourcesByCompanyId(companyId: string) {
  return CRAWL_SOURCES.filter((source) => source.companyId === companyId).sort((left, right) => {
    const priorityRank = getPriorityRank(left.priority) - getPriorityRank(right.priority);
    if (priorityRank !== 0) {
      return priorityRank;
    }

    return left.label.localeCompare(right.label, "zh-CN");
  });
}

export function getJobStatsByCompanyId(companyId: string) {
  const jobs = getJobsByCompanyId(companyId);

  return {
    total: jobs.length,
    active: jobs.filter((job) => job.isActive).length,
    latestSeenAt: jobs.reduce<string | undefined>((latest, job) => {
      if (!job.lastSeenAt) {
        return latest;
      }

      if (!latest || job.lastSeenAt > latest) {
        return job.lastSeenAt;
      }

      return latest;
    }, undefined)
  };
}

function getPriorityRank(priority: CrawlPriority) {
  switch (priority) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
    default:
      return 3;
  }
}

export function formatJobType(type?: JobType) {
  switch (type) {
    case "intern":
      return "实习";
    case "campus":
      return "校招";
    case "full-time":
      return "全职";
    default:
      return "未标注";
  }
}

export function formatJobStatus(active: boolean) {
  return active ? "仍在快照中" : "最近未再次出现";
}

export function formatCrawlPriority(priority: CrawlPriority) {
  switch (priority) {
    case "high":
      return "高优先级";
    case "medium":
      return "中优先级";
    case "low":
      return "低优先级";
    default:
      return priority;
  }
}

export function formatFetchMode(mode: CrawlFetchMode) {
  switch (mode) {
    case "http":
      return "HTTP 抓取";
    case "browser":
      return "浏览器抓取";
    default:
      return mode;
  }
}

export function formatExtractMode(mode: CrawlExtractMode) {
  switch (mode) {
    case "rule":
      return "规则提取";
    case "llm":
      return "LLM 提取";
    default:
      return mode;
  }
}
