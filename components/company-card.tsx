import Link from "next/link";
import { ExternalLinkButton } from "@/components/external-link-button";
import type { Company } from "@/lib/types";

type CompanyCardProps = {
  company: Company;
};

export function CompanyCard({ company }: CompanyCardProps) {
  const locationLabel =
    company.provinces[0] === "全国" ? "全国" : company.provinces.join(" / ");

  return (
    <article className="company-row">
      <div className="company-row-cell company-row-main">
        <h3>
          <a href={company.primaryJobUrl} target="_blank" rel="noreferrer">
            {company.name}
          </a>
        </h3>
      </div>

      <div className="company-row-cell">
        <span className="row-label">企业类型</span>
        <span className="row-value">{company.companyType}</span>
      </div>

      <div className="company-row-cell">
        <span className="row-label">行业</span>
        <span className="row-value">{company.industry}</span>
      </div>

      <div className="company-row-cell">
        <span className="row-label">工作地点</span>
        <span className="row-value row-ellipsis" title={locationLabel}>
          {locationLabel}
        </span>
      </div>

      <div className="company-row-cell">
        <span className="row-label">招聘链接状态</span>
        <span className={company.primaryJobUrlVerified ? "chip success" : "chip warning"}>
          {company.primaryJobUrlVerified ? "已核验" : "待复核"}
        </span>
      </div>

      <div className="company-row-actions">
        <ExternalLinkButton className="button row-button" href={company.primaryJobUrl} label="查看招聘" />
        <Link className="button-secondary row-button" href={`/companies/${company.slug}`}>
          详情
        </Link>
      </div>
    </article>
  );
}
