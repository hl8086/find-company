import {
  companiesPath,
  crawlSourcesPath,
  discoverResolvedUrl,
  nowIso,
  parseArgs,
  readJson,
  writeJson
} from "./crawl-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const companies = readJson(companiesPath, []);
const sources = readJson(crawlSourcesPath, []);

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

const updatedSources = [...sources];
const summary = [];

for (const source of selectedSources) {
  const index = updatedSources.findIndex((item) => item.id === source.id);

  try {
    const result = await discoverResolvedUrl(source);
    const nextSource = {
      ...source,
      resolvedUrl: result.resolvedUrl,
      lastResolvedAt: nowIso(),
      lastError: undefined
    };

    updatedSources[index] = nextSource;
    summary.push({
      sourceId: source.id,
      companyId: source.companyId,
      resolvedUrl: result.resolvedUrl,
      score: result.score
    });

    if (args.verbose) {
      console.log(`[discover] ${source.id} -> ${result.resolvedUrl} (score=${result.score})`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updatedSources[index] = {
      ...source,
      lastResolvedAt: nowIso(),
      lastError: message
    };
    summary.push({
      sourceId: source.id,
      companyId: source.companyId,
      error: message
    });
    console.warn(`[discover] ${source.id} failed: ${message}`);
  }
}

if (!args.dryRun) {
  writeJson(crawlSourcesPath, updatedSources);
}

console.log(
  JSON.stringify(
    {
      checkedCount: selectedSources.length,
      updatedAt: nowIso(),
      dryRun: args.dryRun,
      summary
    },
    null,
    2
  )
);
