import Link from "next/link";

export default function NotFound() {
  return (
    <main className="detail-shell">
      <div className="top-nav">
        <Link className="ghost-link" href="/">
          返回列表
        </Link>
      </div>

      <section className="detail-hero">
        <h1>页面不存在</h1>
        <p>当前页面可能已移动，或链接地址无效。</p>
      </section>
    </main>
  );
}
