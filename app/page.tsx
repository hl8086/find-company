import { CompanyCard } from "@/components/company-card";
import { PaginationControls } from "@/components/pagination-controls";
import { TableHeaderFilters } from "@/components/table-header-filters";
import { getFilterOptions, getPagedCompanies } from "@/lib/company-data";
import type { CompanyFilters } from "@/lib/company-data";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE_OPTIONS = new Set(["10", "50", "100"]);

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getValues(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function getPositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createHref(params: Record<string, string | number | string[] | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === 1 || value === "1") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item) {
          continue;
        }
        search.append(key, item);
      }
      continue;
    }

    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `/?${query}` : "/";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const pageSizeInput = getValue(params.pageSize);
  const pageSize = PAGE_SIZE_OPTIONS.has(pageSizeInput) ? Number(pageSizeInput) : 10;
  const requestedPage = getPositiveInt(getValue(params.page), 1);

  const filterDefaults = {
    q: getValue(params.q),
    province: getValues(params.province),
    companyType: getValues(params.companyType),
    industry: getValues(params.industry),
    linkStatus: getValues(params.linkStatus)
  };
  const filters: CompanyFilters = filterDefaults;
  const pageResult = getPagedCompanies(filters, requestedPage, pageSize);
  const options = getFilterOptions();

  const buildHref = (overrides: Record<string, string | number | string[] | undefined>) =>
    createHref({
      q: filterDefaults.q,
      province: filterDefaults.province,
      companyType: filterDefaults.companyType,
      industry: filterDefaults.industry,
      linkStatus: filterDefaults.linkStatus,
      page: pageResult.page,
      pageSize,
      ...overrides
    });

  const resetHref = createHref({
    pageSize
  });

  return (
    <main className="shell">
      <section className="results-section" id="results">
        <div className="company-table">
          <TableHeaderFilters
            companyTypes={options.companyTypes}
            currentPage={pageResult.page}
            defaults={filterDefaults}
            industries={options.industries}
            linkStatuses={options.linkStatuses}
            pageSize={pageSize}
            provinces={options.provinces}
          />

          {pageResult.total > 0 ? (
            <>
              <div className="company-table-body">
                {pageResult.companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>

              <PaginationControls
                buildHref={buildHref}
                page={pageResult.page}
                pageSize={pageResult.pageSize}
                total={pageResult.total}
                totalPages={pageResult.totalPages}
              />
            </>
          ) : (
            <div className="empty-state">
              <h2>没有匹配结果</h2>
              <p className="muted">可以调整当前筛选条件，或直接返回全部公司列表。</p>
              <div className="empty-state-actions">
                <a className="button" href={resetHref}>
                  返回全部公司
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
