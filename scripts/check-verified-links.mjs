import fs from "node:fs";
import { execFileSync } from "node:child_process";

const path = new URL("../data/companies.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(path, "utf8"));

const args = new Set(process.argv.slice(2));
const onlyFailures = !args.has("--all");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : Number.POSITIVE_INFINITY;

function inspectUrl(url) {
  try {
    const output = execFileSync(
      "curl",
      [
        "-I",
        "-L",
        "-sS",
        "--max-time",
        "20",
        "-o",
        "/dev/null",
        "-D",
        "-",
        "-w",
        "\nCURL_EFFECTIVE_URL:%{url_effective}\n",
        url
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );

    const statusMatches = [...output.matchAll(/HTTP\/[\d.]+\s+(\d{3})/g)];
    const finalStatus = statusMatches.length > 0 ? Number.parseInt(statusMatches.at(-1)[1], 10) : null;
    const effectiveUrlMatch = output.match(/CURL_EFFECTIVE_URL:(.+)/);
    const effectiveUrl = effectiveUrlMatch ? effectiveUrlMatch[1].trim() : url;
    const redirectedTo404 =
      /Location:\s*\/404\?/i.test(output) ||
      /errorpath=%2f/i.test(output) ||
      /\/404(?:\?|$)/i.test(effectiveUrl);
    const ok = finalStatus !== null && finalStatus < 400 && !redirectedTo404;

    return {
      ok,
      finalStatus,
      effectiveUrl,
      redirectedTo404,
      error: null
    };
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : String(error.message ?? error);
    return {
      ok: false,
      finalStatus: null,
      effectiveUrl: url,
      redirectedTo404: false,
      error: stderr || "curl failed"
    };
  }
}

const verifiedCompanies = data.filter((company) => company.primaryJobUrlVerified).slice(0, limit);
const results = verifiedCompanies.map((company) => ({
  id: company.id,
  name: company.name,
  url: company.primaryJobUrl,
  ...inspectUrl(company.primaryJobUrl)
}));

const failures = results.filter((result) => !result.ok);

console.log(
  JSON.stringify(
    {
      checkedCount: results.length,
      failureCount: failures.length,
      checkedAt: new Date().toISOString(),
      results: onlyFailures ? failures : results
    },
    null,
    2
  )
);
