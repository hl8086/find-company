import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="detail-shell">
      <div className="top-nav">
        <Link className="ghost-link" href="/">
          返回列表
        </Link>
      </div>

      <section className="detail-hero">
        <span className="hero-eyebrow">Methodology</span>
        <h1>数据口径</h1>
        <p>
          当前版本优先验证三个问题：这家公司是否在中国有校招信号、是否能直达招聘信息页面、是否能找到可靠的员工规模口径。
        </p>
      </section>

      <section className="detail-grid">
        <div className="detail-panel">
          <h2>纳入标准</h2>
          <div className="detail-list">
            <div className="detail-item">
              <dt>校招判断</dt>
              <dd>优先看官方校招页和官方招聘页，其次看高校就业网和可信第三方页面。</dd>
            </div>
            <div className="detail-item">
              <dt>员工规模</dt>
              <dd>优先采用中国官网、年报、ESG 或中国业务页里的员工口径，其次保留全球口径。</dd>
            </div>
            <div className="detail-item">
              <dt>时间窗</dt>
              <dd>校招信号默认看最近 12 个月，避免把早已失效的历史页面当成当前校招。</dd>
            </div>
            <div className="detail-item">
              <dt>直达链接</dt>
              <dd>列表页统一优先跳转到官方校招页，其次官方招聘页，再次是高校就业网或第三方页。</dd>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
