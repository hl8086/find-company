import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const JSON_PATH = path.join(process.cwd(), "data", "companies.json");
const DB_PATH = path.join(process.cwd(), "data", "companies.sqlite");
const MIN_EMPLOYEE_SCALE = 301;
const SEED_VERSION = "2026-04-05-sqlite-v2";

const templates = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

function getSeedCompanies() {
  const seen = new Set();

  return templates
    .filter((company) => {
      const key = company.slug || company.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((company) => ({
      ...company,
      employeeScaleValue:
        typeof company.employeeScaleValue === "number" && company.employeeScaleValue >= MIN_EMPLOYEE_SCALE
          ? company.employeeScaleValue
          : MIN_EMPLOYEE_SCALE,
      employeeScaleText: `员工规模大于 300 人。${company.employeeScaleVerified ? "" : " 具体口径待补充。"}`
    }));
}

function ensureSchema(db) {
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

function seed(db) {
  ensureSchema(db);

  const companies = getSeedCompanies();

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

  db.exec(`
    DELETE FROM evidence;
    DELETE FROM companies;
    DELETE FROM app_meta;
  `);

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
    console.log(`Seeded ${companies.length} companies into ${DB_PATH}`);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");
seed(db);
db.close();
