export const INDUSTRY_GROUPS = [
  { name: "金融", keywords: ["银行", "证券", "保险", "金融", "投资银行"] },
  { name: "医疗健康", keywords: ["医药", "医疗", "生物", "生命科学", "器械", "科学仪器", "农化"] },
  { name: "汽车与出行", keywords: ["汽车", "出行", "轨道交通"] },
  { name: "半导体与芯片", keywords: ["半导体", "芯片", "显示"] },
  {
    name: "通信与电子",
    keywords: ["通信", "ICT", "电子信息", "安防", "智能物联", "消费电子", "智能终端", "智能硬件", "信息技术硬件"]
  },
  { name: "软件与企业服务", keywords: ["企业软件", "软件", "云计算", "咨询", "审计", "技术服务"] },
  {
    name: "互联网与平台",
    keywords: ["互联网", "电商", "内容", "平台", "本地生活", "广告与媒体", "办公软件", "教育科技", "游戏与互联网"]
  },
  {
    name: "消费品与零售",
    keywords: ["零售", "快消", "食品", "饮料", "消费品牌", "服饰", "乳业", "美妆", "潮流零售", "旅游与消费", "跨境电商与时尚"]
  },
  { name: "物流与供应链", keywords: ["物流", "供应链", "航运", "邮政", "航空运输"] },
  { name: "基建与工程", keywords: ["基建", "工程", "建筑"] },
  { name: "航空航天与军工", keywords: ["航空航天", "军工", "航天", "航空工业", "航空制造", "核能"] },
  { name: "能源与材料", keywords: ["能源", "电力", "油气", "光伏", "新能源", "电池", "储能", "化工", "材料", "钢铁", "建材", "金属", "资源", "工业气体", "环保"] },
  { name: "工业制造与自动化", keywords: ["工业", "制造", "自动化", "装备", "精密", "光学", "机器人"] },
  { name: "综合集团", keywords: ["综合", "综合性央企", "综合产业"] }
] as const;

export function getIndustryGroup(industry: string) {
  for (const group of INDUSTRY_GROUPS) {
    if (group.keywords.some((keyword) => industry.includes(keyword))) {
      return group.name;
    }
  }

  return "其他";
}

export function getIndustryGroupKeywords(groupName: string) {
  return INDUSTRY_GROUPS.find((group) => group.name === groupName)?.keywords ?? [];
}

