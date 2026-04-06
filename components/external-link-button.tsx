"use client";

import { useId, useState } from "react";

type ExternalLinkButtonProps = {
  href: string;
  label: string;
  className?: string;
};

export function ExternalLinkButton({ href, label, className }: ExternalLinkButtonProps) {
  const [open, setOpen] = useState(false);
  const dialogTitleId = useId();

  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        {label}
      </button>

      {open ? (
        <div className="external-link-modal-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="external-link-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 id={dialogTitleId}>即将跳转到招聘网站</h3>
            <p className="muted">将打开以下链接：</p>
            <p className="external-link-url" title={href}>
              {href}
            </p>
            <div className="external-link-actions">
              <button className="button-secondary" onClick={() => setOpen(false)} type="button">
                取消
              </button>
              <a className="button" href={href} rel="noreferrer" target="_blank">
                继续打开
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
