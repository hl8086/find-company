"use client";

import { useRouter } from "next/navigation";

type PageSizeSelectProps = {
  options: Array<{
    label: string;
    value: string;
    href: string;
  }>;
  value: string;
};

export function PageSizeSelect({ options, value }: PageSizeSelectProps) {
  const router = useRouter();

  return (
    <label className="page-size-select-wrap">
      <span>每页</span>
      <select
        className="select page-size-select"
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) {
            router.replace(next.href as Parameters<typeof router.replace>[0], { scroll: false });
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
