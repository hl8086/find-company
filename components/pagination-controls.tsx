import { PageSizeSelect } from "@/components/page-size-select";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  buildHref: (overrides: Record<string, string | number | string[] | undefined>) => string;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
}

export function PaginationControls({
  page,
  pageSize,
  total,
  totalPages,
  buildHref
}: PaginationControlsProps) {
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="pagination-bar">
      <div className="pagination-summary">
        <span>共 {total} 条</span>
        <span>
          第 {page} / {totalPages} 页
        </span>
      </div>

      <div className="pagination-links">
        {page <= 1 ? (
          <span className="pagination-link disabled">上一页</span>
        ) : (
          <a className="pagination-link" href={buildHref({ page: page - 1 })}>
            上一页
          </a>
        )}

        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const showGap = previous && value - previous > 1;

          return (
            <span key={value} className="pagination-page-group">
              {showGap ? <span className="pagination-gap">…</span> : null}
              <a
                className={value === page ? "pagination-link active" : "pagination-link"}
                href={buildHref({ page: value })}
              >
                {value}
              </a>
            </span>
          );
        })}

        {page >= totalPages ? (
          <span className="pagination-link disabled">下一页</span>
        ) : (
          <a className="pagination-link" href={buildHref({ page: page + 1 })}>
            下一页
          </a>
        )}

        <PageSizeSelect
          options={[10, 50, 100].map((option) => ({
            label: `${option} 条`,
            value: String(option),
            href: buildHref({ page: 1, pageSize: option })
          }))}
          value={String(pageSize)}
        />
      </div>
    </div>
  );
}
