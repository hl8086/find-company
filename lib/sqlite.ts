import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import companiesJson from "@/data/companies.json";
import { getIndustryGroupKeywords } from "@/lib/industry-groups";
import type { Company, Evidence } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data", "companies.sqlite");
const MIN_EMPLOYEE_SCALE = 301;
const SEED_VERSION = "2026-04-05-sqlite-v2";
const BASE_COMPANIES = companiesJson as Company[];

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  aliases_json: string;
  company_type: string;
  ownership_type: string;
  industry: string;
  description: string;
  hq_country: string;
  china_presence: string;
  employee_scale_text: string;
  employee_scale_value: number | null;
  employee_scale_scope: Company["employeeScaleScope"];
  employee_scale_verified: number;
  campus_hiring_status: Company["campusHiringStatus"];
  campus_hiring_last_seen_at: string;
  primary_job_url: string;
  primary_job_url_type: Company["primaryJobUrlType"];
  confidence_level: Company["confidenceLevel"];
  primary_job_url_verified: number;
  primary_job_url_verified_at: string | null;
  primary_job_url_note: string | null;
  notes: string | null;
  provinces_json: string;
  cities_json: string;
  tags_json: string;
};

type EvidenceRow = {
  id: string;
  company_id: string;
  source_type: Evidence["sourceType"];
  title: string;
  url: string;
  publisher: string;
  published_at: string | null;
  captured_at: string;
  excerpt: string;
  is_primary: number;
  supports_employee_scale: number;
  supports_campus_hiring: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __findJobDb: DatabaseSync | undefined;
}

function normalizeCompany(company: Company): Company {
  const employeeScaleValue =
    typeof company.employeeScaleValue === "number" && company.employeeScaleValue >= MIN_EMPLOYEE_SCALE
      ? company.employeeScaleValue
      : MIN_EMPLOYEE_SCALE;

  return {
    ...company,
    employeeScaleValue,
    employeeScaleText: `员工规模大于 300 人。${company.employeeScaleVerified ? "" : " 具体口径待补充。"}`
  };
}

function getSeedCompanies() {
  const seen = new Set<string>();

  return BASE_COMPANIES.filter((company) => {
    const key = company.slug || company.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).map(normalizeCompany);
}

function ensureSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_en TEXT,
      aliases_json TEXT NOT NULL,
      company_type TEXT NOT NULL,
      ownership_type TEXT NOT NULL,
      industry TEXT NOT NULL,
      description TEXT NOT NULL,
      hq_country TEXT NOT NULL,
      china_presence TEXT NOT NULL,
      employee_scale_text TEXT NOT NULL,
      employee_scale_value INTEGER,
      employee_scale_scope TEXT NOT NULL,
      employee_scale_verified INTEGER NOT NULL,
      campus_hiring_status TEXT NOT NULL,
      campus_hiring_last_seen_at TEXT NOT NULL,
      primary_job_url TEXT NOT NULL,
      primary_job_url_type TEXT NOT NULL,
      confidence_level TEXT NOT NULL,
      primary_job_url_verified INTEGER NOT NULL,
      primary_job_url_verified_at TEXT,
      primary_job_url_note TEXT,
      notes TEXT,
      provinces_json TEXT NOT NULL,
      cities_json TEXT NOT NULL,
      tags_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      publisher TEXT NOT NULL,
      published_at TEXT,
      captured_at TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      is_primary INTEGER NOT NULL,
      supports_employee_scale INTEGER NOT NULL,
      supports_campus_hiring INTEGER NOT NULL,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
    CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
    CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
    CREATE INDEX IF NOT EXISTS idx_companies_last_seen ON companies(campus_hiring_last_seen_at DESC);
    CREATE INDEX IF NOT EXISTS idx_evidence_company_id ON evidence(company_id);
  `);
}

function seedDatabase(db: DatabaseSync) {
  ensureSchema(db);

  const companies = getSeedCompanies();

  db.exec(`
    DELETE FROM evidence;
    DELETE FROM companies;
    DELETE FROM app_meta;
  `);

  const insertCompany = db.prepare(`
    INSERT INTO companies (
      id, slug, name, name_en, aliases_json, company_type, ownership_type, industry,
      description, hq_country, china_presence, employee_scale_text, employee_scale_value,
      employee_scale_scope, employee_scale_verified, campus_hiring_status,
      campus_hiring_last_seen_at, primary_job_url, primary_job_url_type, confidence_level,
      primary_job_url_verified, primary_job_url_verified_at, primary_job_url_note, notes,
      provinces_json, cities_json, tags_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertEvidence = db.prepare(`
    INSERT INTO evidence (
      id, company_id, source_type, title, url, publisher,
      published_at, captured_at, excerpt, is_primary,
      supports_employee_scale, supports_campus_hiring
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMeta = db.prepare(`INSERT INTO app_meta (key, value) VALUES (?, ?)`);

  db.exec("BEGIN");
  try {
    for (const company of companies) {
      insertCompany.run(
        company.id,
        company.slug,
        company.name,
        company.nameEn ?? null,
        JSON.stringify(company.aliases),
        company.companyType,
        company.ownershipType,
        company.industry,
        company.description,
        company.hqCountry,
        company.chinaPresence,
        company.employeeScaleText,
        company.employeeScaleValue ?? null,
        company.employeeScaleScope,
        company.employeeScaleVerified ? 1 : 0,
        company.campusHiringStatus,
        company.campusHiringLastSeenAt,
        company.primaryJobUrl,
        company.primaryJobUrlType,
        company.confidenceLevel,
        company.primaryJobUrlVerified ? 1 : 0,
        company.primaryJobUrlVerifiedAt ?? null,
        company.primaryJobUrlNote ?? null,
        company.notes ?? null,
        JSON.stringify(company.provinces),
        JSON.stringify(company.cities),
        JSON.stringify(company.tags)
      );

      for (const item of company.evidence) {
        insertEvidence.run(
          item.id,
          company.id,
          item.sourceType,
          item.title,
          item.url,
          item.publisher,
          item.publishedAt ?? null,
          item.capturedAt,
          item.excerpt ?? company.description,
          item.isPrimary ? 1 : 0,
          item.supportsEmployeeScale ? 1 : 0,
          item.supportsCampusHiring ? 1 : 0
        );
      }
    }

    insertMeta.run("seed_version", SEED_VERSION);
    insertMeta.run("company_count", String(companies.length));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function shouldReseed(db: DatabaseSync) {
  ensureSchema(db);

  const versionRow = db
    .prepare(`SELECT value FROM app_meta WHERE key = 'seed_version'`)
    .get() as { value?: string } | undefined;
  const countRow = db
    .prepare(`SELECT COUNT(*) AS count FROM companies`)
    .get() as { count?: number } | undefined;

  return versionRow?.value !== SEED_VERSION || countRow?.count !== getSeedCompanies().length;
}

function toCompany(row: CompanyRow, evidence: Evidence[]): Company {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en ?? undefined,
    aliases: JSON.parse(row.aliases_json),
    companyType: row.company_type,
    ownershipType: row.ownership_type,
    industry: row.industry,
    description: row.description,
    hqCountry: row.hq_country,
    chinaPresence: row.china_presence,
    employeeScaleText: row.employee_scale_text,
    employeeScaleValue: row.employee_scale_value ?? undefined,
    employeeScaleScope: row.employee_scale_scope,
    employeeScaleVerified: Boolean(row.employee_scale_verified),
    campusHiringStatus: row.campus_hiring_status,
    campusHiringLastSeenAt: row.campus_hiring_last_seen_at,
    primaryJobUrl: row.primary_job_url,
    primaryJobUrlType: row.primary_job_url_type,
    confidenceLevel: row.confidence_level,
    primaryJobUrlVerified: Boolean(row.primary_job_url_verified),
    primaryJobUrlVerifiedAt: row.primary_job_url_verified_at ?? undefined,
    primaryJobUrlNote: row.primary_job_url_note ?? undefined,
    notes: row.notes ?? undefined,
    provinces: JSON.parse(row.provinces_json),
    cities: JSON.parse(row.cities_json),
    tags: JSON.parse(row.tags_json),
    evidence
  };
}

function toEvidence(row: EvidenceRow): Evidence {
  return {
    id: row.id,
    sourceType: row.source_type,
    title: row.title,
    url: row.url,
    publisher: row.publisher,
    publishedAt: row.published_at ?? undefined,
    capturedAt: row.captured_at,
    excerpt: row.excerpt,
    isPrimary: Boolean(row.is_primary),
    supportsEmployeeScale: Boolean(row.supports_employee_scale),
    supportsCampusHiring: Boolean(row.supports_campus_hiring)
  };
}

export function getDb() {
  if (!global.__findJobDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA foreign_keys = ON;");
    if (shouldReseed(db)) {
      seedDatabase(db);
    }
    global.__findJobDb = db;
  }

  return global.__findJobDb;
}

export function getTargetCompanyCount() {
  return getSeedCompanies().length;
}

export function getEvidenceByCompanyId(companyId: string) {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT *
        FROM evidence
        WHERE company_id = ?
        ORDER BY is_primary DESC, captured_at DESC, id ASC
      `
    )
    .all(companyId) as EvidenceRow[];

  return rows.map(toEvidence);
}

export function getCompanyBySlugFromDb(slug: string) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM companies WHERE slug = ?`).get(slug) as CompanyRow | undefined;
  if (!row) {
    return undefined;
  }

  return toCompany(row, getEvidenceByCompanyId(row.id));
}

export type CompanyQueryFilters = {
  q?: string;
  province?: string[];
  companyType?: string[];
  industry?: string[];
  linkStatus?: string[];
};

function buildWhereClause(filters: CompanyQueryFilters) {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.q?.trim()) {
    const keyword = `%${filters.q.trim().toLowerCase()}%`;
    clauses.push(`
      (
        LOWER(name) LIKE ?
        OR LOWER(COALESCE(name_en, '')) LIKE ?
        OR LOWER(description) LIKE ?
        OR LOWER(industry) LIKE ?
        OR LOWER(company_type) LIKE ?
        OR LOWER(ownership_type) LIKE ?
        OR LOWER(aliases_json) LIKE ?
        OR LOWER(provinces_json) LIKE ?
        OR LOWER(cities_json) LIKE ?
        OR LOWER(tags_json) LIKE ?
      )
    `);
    params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword);
  }

  if (filters.companyType && filters.companyType.length > 0) {
    clauses.push(`company_type IN (${filters.companyType.map(() => "?").join(", ")})`);
    params.push(...filters.companyType);
  }

  if (filters.industry && filters.industry.length > 0) {
    const industryClauses: string[] = [];

    for (const selected of filters.industry) {
      const keywords = getIndustryGroupKeywords(selected);
      if (keywords.length > 0) {
        industryClauses.push(`(${keywords.map(() => "industry LIKE ?").join(" OR ")})`);
        params.push(...keywords.map((keyword) => `%${keyword}%`));
        continue;
      }

      industryClauses.push(`industry = ?`);
      params.push(selected);
    }

    clauses.push(`(${industryClauses.join(" OR ")})`);
  }

  if (filters.province && filters.province.length > 0) {
    clauses.push(`(${filters.province.map(() => "provinces_json LIKE ?").join(" OR ")})`);
    params.push(...filters.province.map((value) => `%"${value}"%`));
  }

  if (filters.linkStatus && filters.linkStatus.length > 0) {
    const statusClauses: string[] = [];

    if (filters.linkStatus.includes("已核验")) {
      statusClauses.push("primary_job_url_verified = 1");
    }

    if (filters.linkStatus.includes("待复核")) {
      statusClauses.push("primary_job_url_verified = 0");
    }

    if (statusClauses.length > 0) {
      clauses.push(`(${statusClauses.join(" OR ")})`);
    }
  }

  return {
    sql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
}

export function getCompaniesPage(filters: CompanyQueryFilters, page: number, pageSize: number) {
  const db = getDb();
  const { sql, params } = buildWhereClause(filters);
  const countRow = db
    .prepare(`SELECT COUNT(*) AS count FROM companies ${sql}`)
    .get(...params) as { count: number };
  const total = countRow.count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = db
    .prepare(
      `
        SELECT *
        FROM companies
        ${sql}
        ORDER BY confidence_level ASC, campus_hiring_last_seen_at DESC, name ASC
        LIMIT ? OFFSET ?
      `
    )
    .all(...params, pageSize, offset) as CompanyRow[];

  return {
    companies: rows.map((row) => toCompany(row, [])),
    total,
    page: currentPage,
    pageSize,
    totalPages
  };
}

export function getAllCompaniesFromDb() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT *
        FROM companies
        ORDER BY confidence_level ASC, campus_hiring_last_seen_at DESC, name ASC
      `
    )
    .all() as CompanyRow[];

  return rows.map((row) => toCompany(row, []));
}
