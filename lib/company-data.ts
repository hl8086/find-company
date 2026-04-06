import type { Company } from "@/lib/types";
import { CHINA_PROVINCES } from "@/lib/china-provinces";
import { getIndustryGroup, INDUSTRY_GROUPS } from "@/lib/industry-groups";
import {
  getAllCompaniesFromDb,
  getCompaniesPage,
  getCompanyBySlugFromDb,
  getTargetCompanyCount,
  type CompanyQueryFilters
} from "@/lib/sqlite";

export type CompanyFilters = CompanyQueryFilters;

export function getAllCompanies() {
  return getAllCompaniesFromDb();
}

export function getCompanyBySlug(slug: string) {
  return getCompanyBySlugFromDb(slug);
}

export function getPagedCompanies(filters: CompanyFilters, page: number, pageSize: number) {
  return getCompaniesPage(filters, page, pageSize);
}

export function filterCompanies(filters: CompanyFilters) {
  return getCompaniesPage(filters, 1, getTargetCompanyCount()).companies;
}

export function getFilterOptions() {
  const list = getAllCompanies();

  return {
    companyTypes: Array.from(new Set(list.map((company) => company.companyType))).sort(),
    linkStatuses: ["已核验", "待复核"],
    provinces: [...CHINA_PROVINCES],
    industries: Array.from(new Set(list.map((company) => getIndustryGroup(company.industry)))).sort(
      (left, right) => {
        const leftIndex = INDUSTRY_GROUPS.findIndex((item) => item.name === left);
        const rightIndex = INDUSTRY_GROUPS.findIndex((item) => item.name === right);
        return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
          (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
      }
    )
  };
}

export function getStats() {
  const list = getAllCompanies();

  return {
    total: list.length,
    activeCampus: list.filter((company) => company.campusHiringStatus === "active").length,
    officialLinks: list.filter((company) =>
      ["official_campus", "official_careers"].includes(company.primaryJobUrlType)
    ).length
  };
}

export function formatCampusStatus(status: Company["campusHiringStatus"]) {
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

export function formatJobUrlType(type: Company["primaryJobUrlType"]) {
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

export function formatSourceType(type: Company["evidence"][number]["sourceType"]) {
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
