import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..", "..");
const sourcePath = path.join(rootDir, "data", "companies.json");
const outputDir = path.join(rootDir, "site-static", "data");
const outputCompaniesPath = path.join(outputDir, "companies.json");
const outputMetaPath = path.join(outputDir, "meta.json");

const companies = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const snapshotDate = companies.reduce((latest, company) => {
  return company.campusHiringLastSeenAt > latest ? company.campusHiringLastSeenAt : latest;
}, "1970-01-01");

const meta = {
  snapshotDate,
  generatedAt: new Date().toISOString(),
  totalCompanies: companies.length
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputCompaniesPath, `${JSON.stringify(companies, null, 2)}\n`);
fs.writeFileSync(outputMetaPath, `${JSON.stringify(meta, null, 2)}\n`);

console.log(`Synced ${companies.length} companies to ${outputDir}`);
