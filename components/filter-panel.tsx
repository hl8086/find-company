type FilterPanelProps = {
  defaults: {
    q: string;
    province: string;
    companyType: string;
    industry: string;
    campusHiringStatus: string;
  };
  options: {
    companyTypes: string[];
    provinces: string[];
    industries: string[];
  };
};

export function FilterPanel({ defaults, options }: FilterPanelProps) {
  return (
    <aside className="panel panel-horizontal">
      <h2>筛选条件</h2>
      <form className="form-grid">
        <div className="field">
          <label htmlFor="q">关键词</label>
          <input
            className="input"
            defaultValue={defaults.q}
            id="q"
            name="q"
            placeholder="公司名、行业、城市、标签"
            type="text"
          />
        </div>

        <div className="field">
          <label htmlFor="province">工作地点</label>
          <select className="select" defaultValue={defaults.province} id="province" name="province">
            <option value="">全部省份</option>
            {options.provinces.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="companyType">企业类型</label>
          <select className="select" defaultValue={defaults.companyType} id="companyType" name="companyType">
            <option value="">全部</option>
            {options.companyTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="industry">行业</label>
          <select className="select" defaultValue={defaults.industry} id="industry" name="industry">
            <option value="">全部</option>
            {options.industries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="campusHiringStatus">校招状态</label>
          <select
            className="select"
            defaultValue={defaults.campusHiringStatus}
            id="campusHiringStatus"
            name="campusHiringStatus"
          >
            <option value="">全部</option>
            <option value="active">当前可见校招信号</option>
            <option value="likely_active">高概率仍在招</option>
            <option value="uncertain">待复核</option>
          </select>
        </div>
        <div className="actions">
          <button className="button" type="submit">
            应用筛选
          </button>
          <a className="ghost-link" href="/">
            清空
          </a>
        </div>
      </form>
    </aside>
  );
}
