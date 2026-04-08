import {
  companiesPath,
  crawlRunsPath,
  crawlSourcesPath,
  discoverResolvedUrl,
  extractJobsFromHtml,
  extractJobsWithAdapter,
  fetchHtml,
  jobsPath,
  nowIso,
  parseArgs,
  readJson,
  writeJson
} from "./crawl-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const companies = readJson(companiesPath, []);
const sources = readJson(crawlSourcesPath, []);
const existingJobs = readJson(jobsPath, []);
const existingRuns = readJson(crawlRunsPath, []);

const companyIds = new Set(
  companies
    .filter((company) => {
      if (!args.company) {
        return true;
      }

      return company.id === args.company || company.slug === args.company;
    })
    .map((company) => company.id)
);

const selectedSources = sources
  .filter((source) => source.enabled)
  .filter((source) => (args.company ? companyIds.has(source.companyId) : true))
  .filter((source) => (args.source ? source.id === args.source : true))
  .slice(0, args.limit);

if (selectedSources.length === 0) {
  console.log("No enabled crawl sources matched the current filter.");
  process.exit(0);
}

const nextSources = [...sources];
let nextJobs = [...existingJobs];
const nextRuns = [...existingRuns];
const summary = [];

for (const source of selectedSources) {
  const company = companies.find((item) => item.id === source.companyId);
  if (!company) {
    console.warn(`[crawl] skip ${source.id}: company ${source.companyId} not found`);
    continue;
  }

  const startedAt = nowIso();
  const sourceIndex = nextSources.findIndex((item) => item.id === source.id);

  try {
    let workingSource = { ...source };
    if (!workingSource.resolvedUrl) {
      const discovered = await discoverResolvedUrl(workingSource);
      workingSource.resolvedUrl = discovered.resolvedUrl;
      workingSource.lastResolvedAt = nowIso();
    }

    const crawlUrl = workingSource.resolvedUrl || workingSource.seedUrl;
    const finishedAt = nowIso();
    let finalResolvedUrl = crawlUrl;
    let extractedJobs = await extractJobsWithAdapter({
      company,
      source: workingSource,
      fetchedAt: finishedAt
    });

    if (!extractedJobs) {
      const page = await fetchHtml(crawlUrl);

      if (!page.ok || !page.html) {
        throw new Error(`request failed with status ${page.status}`);
      }

      finalResolvedUrl = page.finalUrl || crawlUrl;
      extractedJobs = extractJobsFromHtml({
        company,
        html: page.html,
        source: workingSource,
        pageUrl: finalResolvedUrl,
        fetchedAt: finishedAt
      });
    }

    const sourceJobs = nextJobs.filter((job) => job.sourceId === source.id);
    const extractedByFingerprint = new Map(extractedJobs.map((job) => [job.fingerprint, job]));
    const updatedSourceJobs = [];

    for (const job of sourceJobs) {
      const latest = extractedByFingerprint.get(job.fingerprint);
      if (latest) {
        updatedSourceJobs.push({
          ...job,
          ...latest,
          firstSeenAt: job.firstSeenAt,
          lastSeenAt: finishedAt,
          isActive: true
        });
        extractedByFingerprint.delete(job.fingerprint);
      } else {
        updatedSourceJobs.push({
          ...job,
          isActive: false
        });
      }
    }

    for (const job of extractedByFingerprint.values()) {
      updatedSourceJobs.push(job);
    }

    nextJobs = nextJobs.filter((job) => job.sourceId !== source.id).concat(updatedSourceJobs);
    nextSources[sourceIndex] = {
      ...workingSource,
      lastCrawledAt: finishedAt,
      lastSuccessAt: extractedJobs.length > 0 ? finishedAt : workingSource.lastSuccessAt,
      lastError: extractedJobs.length > 0 ? undefined : "No job-like entries matched current rules."
    };

    nextRuns.push({
      id: `${source.id}-${finishedAt}`,
      sourceId: source.id,
      companyId: source.companyId,
      startedAt,
      completedAt: finishedAt,
      status: extractedJobs.length > 0 ? "success" : "no_jobs",
      resolvedUrl: finalResolvedUrl,
      jobsFound: extractedJobs.length,
      errorMessage: extractedJobs.length > 0 ? undefined : "No job-like entries matched current rules."
    });

    summary.push({
      sourceId: source.id,
      companyId: source.companyId,
      resolvedUrl: finalResolvedUrl,
      jobsFound: extractedJobs.length
    });

    if (args.verbose) {
      console.log(`[crawl] ${source.id} -> ${extractedJobs.length} jobs`);
    }
  } catch (error) {
    const finishedAt = nowIso();
    const message = error instanceof Error ? error.message : String(error);

    nextSources[sourceIndex] = {
      ...source,
      lastCrawledAt: finishedAt,
      lastError: message
    };

    nextJobs = nextJobs.map((job) => {
      if (job.sourceId !== source.id) {
        return job;
      }

      return {
        ...job,
        isActive: false
      };
    });

    nextRuns.push({
      id: `${source.id}-${finishedAt}`,
      sourceId: source.id,
      companyId: source.companyId,
      startedAt,
      completedAt: finishedAt,
      status: "error",
      resolvedUrl: source.resolvedUrl || source.seedUrl,
      jobsFound: 0,
      errorMessage: message
    });

    summary.push({
      sourceId: source.id,
      companyId: source.companyId,
      error: message
    });

    console.warn(`[crawl] ${source.id} failed: ${message}`);
  }
}

if (!args.dryRun) {
  writeJson(crawlSourcesPath, nextSources);
  writeJson(jobsPath, nextJobs);
  writeJson(crawlRunsPath, nextRuns);
}

console.log(
  JSON.stringify(
    {
      crawledCount: selectedSources.length,
      totalJobs: nextJobs.length,
      dryRun: args.dryRun,
      updatedAt: nowIso(),
      summary
    },
    null,
    2
  )
);
