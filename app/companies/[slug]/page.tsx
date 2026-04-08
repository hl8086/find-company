import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLinkButton } from "@/components/external-link-button";
import {
  formatCampusStatus,
  formatJobUrlType,
  formatSourceType,
  getCompanyBySlug
} from "@/lib/company-data";
import {
  formatCrawlPriority,
  formatExtractMode,
  formatFetchMode,
  formatJobStatus,
  formatJobType,
  getCrawlSourcesByCompanyId,
  getJobsByCompanyId,
  getJobStatsByCompanyId
} from "@/lib/job-data";

type CompanyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const sources = getCrawlSourcesByCompanyId(company.id);
  const jobs = getJobsByCompanyId(company.id);
  const jobStats = getJobStatsByCompanyId(company.id);

  return (
    <main className="detail-shell">
      <div className="top-nav">
        <Link className="ghost-link" href="/">
          返回列表
        </Link>
      </div>

      <section className="detail-hero">
        <div className="detail-tags">
          <span className="chip">{company.companyType}</span>
          <span className="chip">{company.ownershipType}</span>
          <span className="chip success">{company.confidenceLevel} 级置信度</span>
        </div>
        <h1>{company.name}</h1>
        <p>{company.description}</p>
        <div className="company-actions">
          <ExternalLinkButton className="button" href={company.primaryJobUrl} label="打开招聘信息" />
          <span className="chip">{formatJobUrlType(company.primaryJobUrlType)}</span>
          <span className="chip">{jobStats.total} 条岗位快照</span>
        </div>
      </section>

      <section className="detail-grid">
        <div className="detail-panel">
          <h2>基础信息</h2>
          <dl className="detail-list">
            <div className="detail-item">
              <dt>行业</dt>
              <dd>{company.industry}</dd>
            </div>
            <div className="detail-item">
              <dt>总部国家/地区</dt>
              <dd>{company.hqCountry}</dd>
            </div>
            <div className="detail-item">
              <dt>中国业务</dt>
              <dd>{company.chinaPresence}</dd>
            </div>
            <div className="detail-item">
              <dt>校招状态</dt>
              <dd>{formatCampusStatus(company.campusHiringStatus)}</dd>
            </div>
            <div className="detail-item">
              <dt>最近校招信号</dt>
              <dd>{company.campusHiringLastSeenAt}</dd>
            </div>
            <div className="detail-item">
              <dt>招聘链接状态</dt>
              <dd>
                {company.primaryJobUrlVerified ? "已核验" : "待复核"}
                {company.primaryJobUrlVerifiedAt ? ` · ${company.primaryJobUrlVerifiedAt}` : ""}
              </dd>
            </div>
            <div className="detail-item">
              <dt>工作省份</dt>
              <dd>{company.provinces.join("、")}</dd>
            </div>
            <div className="detail-item">
              <dt>覆盖城市</dt>
              <dd>{company.cities.join("、")}</dd>
            </div>
            <div className="detail-item">
              <dt>标签</dt>
              <dd>{company.tags.join("、")}</dd>
            </div>
            <div className="detail-item">
              <dt>岗位快照状态</dt>
              <dd>
                {jobStats.active > 0 ? `当前有 ${jobStats.active} 条仍在快照中` : "当前没有活跃岗位快照"}
                {jobStats.latestSeenAt ? ` · 最近更新时间 ${jobStats.latestSeenAt}` : ""}
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-panel">
          <h2>备注</h2>
          <p>{company.notes ?? "当前无额外备注。"}</p>
        </div>

        <div className="detail-panel">
          <h2>抓取源</h2>
          {sources.length > 0 ? (
            <div className="job-list">
              {sources.map((source) => (
                <article key={source.id} className="job-card">
                  <div className="evidence-tags">
                    <span className="chip">{formatJobUrlType(source.sourceType)}</span>
                    <span className="chip">{formatFetchMode(source.fetchMode)}</span>
                    <span className="chip">{formatExtractMode(source.extractMode)}</span>
                    <span className="chip">{formatCrawlPriority(source.priority)}</span>
                    {source.enabled ? <span className="chip success">已启用</span> : <span className="chip warning">未启用</span>}
                  </div>
                  <h3>{source.label}</h3>
                  <p className="muted">
                    入口：
                    <a href={source.seedUrl} rel="noreferrer" target="_blank">
                      {source.seedUrl}
                    </a>
                  </p>
                  <p className="muted">
                    解析结果：
                    <a href={source.resolvedUrl ?? source.seedUrl} rel="noreferrer" target="_blank">
                      {source.resolvedUrl ?? source.seedUrl}
                    </a>
                  </p>
                  <div className="job-meta">
                    <span>刷新频率 {source.intervalHours}h</span>
                    {source.lastResolvedAt ? <span>· 最近发现 {source.lastResolvedAt}</span> : null}
                    {source.lastCrawledAt ? <span>· 最近抓取 {source.lastCrawledAt}</span> : null}
                    {source.lastSuccessAt ? <span>· 最近成功 {source.lastSuccessAt}</span> : null}
                  </div>
                  <p className="muted">
                    {source.lastError
                      ? `最近结果：${source.lastError}`
                      : source.notes ?? "当前未记录额外抓取说明。"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p>当前还没有为这家公司启用岗位抓取源。</p>
          )}
        </div>

        <div className="detail-panel">
          <h2>岗位快照</h2>
          {jobs.length > 0 ? (
            <div className="job-list">
              {jobs.map((job) => (
                <article key={job.id} className="job-card">
                  <div className="evidence-tags">
                    <span className={job.isActive ? "chip success" : "chip warning"}>
                      {formatJobStatus(job.isActive)}
                    </span>
                    <span className="chip">{formatJobType(job.jobType)}</span>
                    {job.location ? <span className="chip">{job.location}</span> : null}
                  </div>
                  <h3>
                    <a href={job.applyUrl} rel="noreferrer" target="_blank">
                      {job.title}
                    </a>
                  </h3>
                  <p className="muted">{job.descriptionText ?? "当前岗位仅保留标题与投递链接快照。"}</p>
                  <div className="job-meta">
                    {job.department ? <span>部门 {job.department}</span> : null}
                    {job.deadline ? <span>· 截止 {job.deadline}</span> : null}
                    <span>· 首次出现 {job.firstSeenAt}</span>
                    <span>· 最近出现 {job.lastSeenAt}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>当前还没有成功抓到具体岗位。可以先运行 `npm run jobs:crawl` 生成第一批岗位快照。</p>
          )}
        </div>

        <div className="detail-panel">
          <h2>证据列表</h2>
          <div className="evidence-list">
            {company.evidence.map((item) => (
              <article key={item.id} className="evidence-card">
                <div className="evidence-tags">
                  <span className="chip">{formatSourceType(item.sourceType)}</span>
                  {item.isPrimary ? <span className="chip success">主证据</span> : null}
                  {item.supportsEmployeeScale ? <span className="chip">支持规模</span> : null}
                  {item.supportsCampusHiring ? <span className="chip">支持校招</span> : null}
                </div>
                <h3>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p className="muted">{item.excerpt}</p>
                <div className="evidence-meta">
                  <span>{item.publisher}</span>
                  <span> · 抓取时间 {item.capturedAt}</span>
                  {item.publishedAt ? <span> · 页面时间 {item.publishedAt}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
