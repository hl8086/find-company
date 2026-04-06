import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLinkButton } from "@/components/external-link-button";
import {
  formatCampusStatus,
  formatJobUrlType,
  formatSourceType,
  getCompanyBySlug
} from "@/lib/company-data";

type CompanyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

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
          </dl>
        </div>

        <div className="detail-panel">
          <h2>备注</h2>
          <p>{company.notes ?? "当前无额外备注。"}</p>
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
