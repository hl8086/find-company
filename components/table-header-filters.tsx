"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TableHeaderFiltersProps = {
  companyTypes: string[];
  industries: string[];
  linkStatuses: string[];
  provinces: string[];
  currentPage: number;
  defaults: {
    q: string;
    companyType: string[];
    industry: string[];
    linkStatus: string[];
    province: string[];
  };
  pageSize: number;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildSearch(
  q: string,
  companyType: string[],
  industry: string[],
  linkStatus: string[],
  province: string[],
  pageSize: number,
  page?: number
) {
  const search = new URLSearchParams();

  if (q.trim()) {
    search.set("q", q.trim());
  }

  for (const value of uniqueValues(companyType)) {
    search.append("companyType", value);
  }

  for (const value of uniqueValues(industry)) {
    search.append("industry", value);
  }

  for (const value of uniqueValues(linkStatus)) {
    search.append("linkStatus", value);
  }

  for (const value of uniqueValues(province)) {
    search.append("province", value);
  }

  if (pageSize !== 10) {
    search.set("pageSize", String(pageSize));
  }

  if (page && page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function FilterIcon({ active }: { active: boolean }) {
  return <span className={active ? "header-filter-caret active" : "header-filter-caret"} aria-hidden="true" />;
}

type FilterMenuProps = {
  label: string;
  active: boolean;
  children: React.ReactNode;
};

function FilterMenu({ label, active, children }: FilterMenuProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <details
      ref={ref}
      className="header-filter"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="header-filter-summary" title={label}>
        <span className={active ? "header-filter-label active" : "header-filter-label"}>{label}</span>
        <FilterIcon active={active} />
      </summary>
      <div className="header-filter-menu">{children}</div>
    </details>
  );
}

type MultiChoiceMenuProps = {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
};

function MultiChoiceMenu({ label, options, selected, onToggle, onClear }: MultiChoiceMenuProps) {
  return (
    <FilterMenu active={selected.length > 0} label={label}>
      {selected.length > 0 ? (
        <button className="header-filter-clear" onClick={onClear} type="button">
          清空
        </button>
      ) : null}
      <div className="header-filter-list">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              className={isSelected ? "header-filter-option selected" : "header-filter-option"}
              onClick={() => onToggle(option)}
              type="button"
            >
              <span className="header-filter-check">{isSelected ? "✓" : ""}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </FilterMenu>
  );
}

function getHeadCellClassName(active: boolean, alignEnd = false) {
  if (active && alignEnd) {
    return "company-head-cell company-head-cell-active company-head-cell-end";
  }

  if (active) {
    return "company-head-cell company-head-cell-active";
  }

  if (alignEnd) {
    return "company-head-cell company-head-cell-end";
  }

  return "company-head-cell";
}

export function TableHeaderFilters({
  companyTypes,
  industries,
  linkStatuses,
  provinces,
  defaults,
  currentPage,
  pageSize
}: TableHeaderFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(defaults.q);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(defaults.companyType);
  const [selectedIndustries, setSelectedIndustries] = useState(defaults.industry);
  const [selectedLinkStatuses, setSelectedLinkStatuses] = useState(defaults.linkStatus);
  const [selectedProvinces, setSelectedProvinces] = useState(defaults.province);

  const defaultsKey = useMemo(
    () =>
      JSON.stringify({
        q: defaults.q,
        companyType: defaults.companyType,
        industry: defaults.industry,
        linkStatus: defaults.linkStatus,
        province: defaults.province
      }),
    [defaults]
  );

  useEffect(() => {
    setQ(defaults.q);
    setSelectedCompanyTypes(defaults.companyType);
    setSelectedIndustries(defaults.industry);
    setSelectedLinkStatuses(defaults.linkStatus);
    setSelectedProvinces(defaults.province);
  }, [defaults, defaultsKey]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalizedDefaults = {
        q: defaults.q.trim(),
        companyType: uniqueValues(defaults.companyType).slice().sort(),
        industry: uniqueValues(defaults.industry).slice().sort(),
        linkStatus: uniqueValues(defaults.linkStatus).slice().sort(),
        province: uniqueValues(defaults.province).slice().sort()
      };
      const normalizedCurrent = {
        q: q.trim(),
        companyType: uniqueValues(selectedCompanyTypes).slice().sort(),
        industry: uniqueValues(selectedIndustries).slice().sort(),
        linkStatus: uniqueValues(selectedLinkStatuses).slice().sort(),
        province: uniqueValues(selectedProvinces).slice().sort()
      };
      const filtersChanged =
        normalizedDefaults.q !== normalizedCurrent.q ||
        JSON.stringify(normalizedDefaults.companyType) !== JSON.stringify(normalizedCurrent.companyType) ||
        JSON.stringify(normalizedDefaults.industry) !== JSON.stringify(normalizedCurrent.industry) ||
        JSON.stringify(normalizedDefaults.linkStatus) !== JSON.stringify(normalizedCurrent.linkStatus) ||
        JSON.stringify(normalizedDefaults.province) !== JSON.stringify(normalizedCurrent.province);
      const nextSearch = buildSearch(
        q,
        selectedCompanyTypes,
        selectedIndustries,
        selectedLinkStatuses,
        selectedProvinces,
        pageSize,
        filtersChanged ? 1 : currentPage
      );
      const currentSearch = searchParams.toString();
      const normalizedNextSearch = nextSearch.startsWith("?") ? nextSearch.slice(1) : nextSearch;

      if (normalizedNextSearch === currentSearch) {
        return;
      }

      const nextHref = `${pathname}${nextSearch}` as Parameters<typeof router.replace>[0];
      router.replace(nextHref, { scroll: false });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [
    currentPage,
    defaults,
    pathname,
    pageSize,
    q,
    router,
    searchParams,
    selectedCompanyTypes,
    selectedIndustries,
    selectedLinkStatuses,
    selectedProvinces
  ]);

  function toggleValue(values: string[], value: string) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  return (
    <div className="company-table-head company-table-head-filters">
      <div className={getHeadCellClassName(Boolean(q.trim()))}>
        <FilterMenu active={Boolean(q.trim())} label="公司">
          <input
            autoFocus
            className="input header-filter-input"
            onChange={(event) => setQ(event.target.value)}
            placeholder="搜索公司"
            type="text"
            value={q}
          />
          {q ? (
            <button className="header-filter-clear" onClick={() => setQ("")} type="button">
              清空
            </button>
          ) : null}
        </FilterMenu>
      </div>

      <div className={getHeadCellClassName(selectedCompanyTypes.length > 0)}>
        <MultiChoiceMenu
          label="企业类型"
          onClear={() => setSelectedCompanyTypes([])}
          onToggle={(value) => setSelectedCompanyTypes((current) => toggleValue(current, value))}
          options={companyTypes}
          selected={selectedCompanyTypes}
        />
      </div>

      <div className={getHeadCellClassName(selectedIndustries.length > 0)}>
        <MultiChoiceMenu
          label="行业"
          onClear={() => setSelectedIndustries([])}
          onToggle={(value) => setSelectedIndustries((current) => toggleValue(current, value))}
          options={industries}
          selected={selectedIndustries}
        />
      </div>

      <div className={getHeadCellClassName(selectedProvinces.length > 0)}>
        <MultiChoiceMenu
          label="工作地点"
          onClear={() => setSelectedProvinces([])}
          onToggle={(value) => setSelectedProvinces((current) => toggleValue(current, value))}
          options={provinces}
          selected={selectedProvinces}
        />
      </div>

      <div className={getHeadCellClassName(selectedLinkStatuses.length > 0)}>
        <MultiChoiceMenu
          label="招聘链接状态"
          onClear={() => setSelectedLinkStatuses([])}
          onToggle={(value) => setSelectedLinkStatuses((current) => toggleValue(current, value))}
          options={linkStatuses}
          selected={selectedLinkStatuses}
        />
      </div>

      <div className="company-head-cell company-head-cell-end">
        <span>操作</span>
        {(
          q ||
          selectedCompanyTypes.length > 0 ||
          selectedIndustries.length > 0 ||
          selectedLinkStatuses.length > 0 ||
          selectedProvinces.length > 0
        ) ? (
          <button
            className="header-filter-reset"
            onClick={() => {
              setQ("");
              setSelectedCompanyTypes([]);
              setSelectedIndustries([]);
              setSelectedLinkStatuses([]);
              setSelectedProvinces([]);
            }}
            type="button"
          >
            清空
          </button>
        ) : null}
      </div>
    </div>
  );
}
