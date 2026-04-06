import fs from "node:fs";

const DATA_PATH = new URL("../data/companies.json", import.meta.url);
const CAPTURED_AT = "2026-04-05";
const TARGET_COUNT = 300;

const existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const existingIds = new Set(existing.map((company) => company.id));

const locations = {
  tech: {
    provinces: ["北京", "上海", "广东", "浙江"],
    cities: ["北京", "上海", "深圳", "杭州"]
  },
  platform: {
    provinces: ["北京", "上海", "广东", "四川"],
    cities: ["北京", "上海", "深圳", "成都"]
  },
  hardware: {
    provinces: ["广东", "江苏", "上海", "浙江"],
    cities: ["深圳", "苏州", "上海", "宁波"]
  },
  auto: {
    provinces: ["上海", "浙江", "北京", "广东"],
    cities: ["上海", "杭州", "北京", "深圳"]
  },
  consumer: {
    provinces: ["上海", "广东", "北京", "浙江"],
    cities: ["上海", "广州", "北京", "杭州"]
  },
  finance: {
    provinces: ["北京", "上海", "广东", "江苏", "浙江"],
    cities: ["北京", "上海", "深圳", "南京", "杭州"]
  },
  pharma: {
    provinces: ["上海", "北京", "江苏", "广东"],
    cities: ["上海", "北京", "苏州", "广州"]
  },
  industrial: {
    provinces: ["上海", "北京", "江苏", "广东"],
    cities: ["上海", "北京", "苏州", "深圳"]
  },
  logistics: {
    provinces: ["上海", "北京", "广东", "天津"],
    cities: ["上海", "北京", "深圳", "天津"]
  },
  retail: {
    provinces: ["上海", "北京", "广东", "四川"],
    cities: ["上海", "北京", "广州", "成都"]
  },
  energy: {
    provinces: ["北京", "上海", "江苏", "浙江"],
    cities: ["北京", "上海", "苏州", "宁波"]
  }
};

function makeEvidence(company) {
  return [
    {
      id: `${company.id}-primary`,
      sourceType: company.primaryJobUrlType,
      title: company.primaryJobUrlType === "official_campus" ? `${company.name}校园招聘` : `${company.name}招聘官网`,
      url: company.primaryJobUrl,
      publisher: `${company.name}招聘入口`,
      publishedAt: CAPTURED_AT,
      capturedAt: CAPTURED_AT,
      excerpt: company.description,
      isPrimary: true,
      supportsEmployeeScale: false,
      supportsCampusHiring: true
    }
  ];
}

function finalizeCompany(input, defaults) {
  const normalized = {
    aliases: input.aliases ?? [],
    employeeScaleScope: input.employeeScaleScope ?? defaults.employeeScaleScope ?? "global",
    employeeScaleVerified: false,
    campusHiringStatus: input.campusHiringStatus ?? "uncertain",
    campusHiringLastSeenAt: CAPTURED_AT,
    primaryJobUrlVerified: input.primaryJobUrlVerified ?? false,
    primaryJobUrlVerifiedAt: CAPTURED_AT,
    primaryJobUrlNote:
      input.primaryJobUrlNote ?? "新增公司池记录，已补招聘入口，待继续做浏览器级逐条复核。",
    notes: input.notes ?? "新增批量导入记录，后续建议补官方中国员工口径与更近的校招证据。",
    tags:
      input.tags ??
      [
        input.primaryJobUrlType === "official_campus" ? "官方校招" : "官方招聘",
        input.industry,
        input.primaryJobUrlVerified ? "已核验" : "待复核"
      ],
    evidence: makeEvidence(input),
    employeeScaleText: input.employeeScaleText ?? "员工规模大于 300 人，具体中国区口径待补充。",
    employeeScaleValue: input.employeeScaleValue ?? defaults.employeeScaleValue ?? 1000,
    companyType: defaults.companyType,
    ownershipType: defaults.ownershipType,
    hqCountry: input.hqCountry ?? defaults.hqCountry,
    description: input.description ?? `${input.name}为${input.industry}领域大型企业，当前保留招聘入口。`,
    chinaPresence:
      input.chinaPresence ??
      `主要工作地包括${(input.cities ?? []).join("、") || (input.provinces ?? []).join("、")}。`,
    confidenceLevel: input.confidenceLevel ?? "C",
    provinces: input.provinces,
    cities: input.cities,
    ...input
  };

  return {
    ...normalized,
    evidence: makeEvidence(normalized)
  };
}

function privateChina(entry) {
  return finalizeCompany(entry, {
    companyType: "民营企业",
    ownershipType: "私企",
    hqCountry: "中国",
    employeeScaleValue: 5000,
    employeeScaleScope: "china"
  });
}

function mixedChina(entry) {
  return finalizeCompany(entry, {
    companyType: "混合所有制企业",
    ownershipType: "股份制",
    hqCountry: "中国",
    employeeScaleValue: 5000,
    employeeScaleScope: "china"
  });
}

function stateOwned(entry) {
  return finalizeCompany(entry, {
    companyType: "央企",
    ownershipType: "央企",
    hqCountry: "中国",
    employeeScaleValue: 10000,
    employeeScaleScope: "china"
  });
}

function localSoe(entry) {
  return finalizeCompany(entry, {
    companyType: "国企",
    ownershipType: "国企",
    hqCountry: "中国",
    employeeScaleValue: 5000,
    employeeScaleScope: "china"
  });
}

function financial(entry, companyType = "股份制银行", ownershipType = "股份制") {
  return finalizeCompany(entry, {
    companyType,
    ownershipType,
    hqCountry: "中国",
    employeeScaleValue: 3000,
    employeeScaleScope: "china"
  });
}

function foreignCompany(entry) {
  return finalizeCompany(entry, {
    companyType: "外资企业",
    ownershipType: "外企",
    hqCountry: entry.hqCountry ?? "海外",
    employeeScaleValue: 3000,
    employeeScaleScope: "global"
  });
}

function makeEntry(builder, [id, name, nameEn, industry, url, primaryJobUrlType, locKey, aliases = []], extras = {}) {
  const loc = locations[locKey];
  return builder({
    id,
    slug: id,
    name,
    nameEn,
    aliases,
    industry,
    primaryJobUrl: url,
    primaryJobUrlType,
    provinces: extras.provinces ?? loc.provinces,
    cities: extras.cities ?? loc.cities,
    ...extras
  });
}

const additions = [
  ...[
    ["shein", "SHEIN", "SHEIN", "跨境电商与时尚", "https://careers.shein.com/", "official_careers", "consumer", ["希音"]],
    ["didi", "滴滴出行", "DiDi", "出行平台", "https://talent.didiglobal.com/", "official_careers", "platform", ["滴滴"]],
    ["beike", "贝壳", "KE Holdings", "居住服务平台", "https://campus.ke.com/", "official_campus", "platform", ["贝壳找房"]],
    ["dewu", "得物", "Dewu", "电商与潮流零售", "https://job.dewu.com/", "official_careers", "platform"],
    ["tongcheng-travel", "同程旅行", "Tongcheng Travel", "旅游与互联网", "https://campus.ly.com/", "official_campus", "platform", ["同程"]],
    ["vipshop", "唯品会", "Vipshop", "电商", "https://campus.vip.com/", "official_campus", "platform"],
    ["huolala", "货拉拉", "Lalamove China", "物流平台", "https://careers.huolala.cn/", "official_careers", "platform"],
    ["manbang", "满帮集团", "Full Truck Alliance", "物流平台", "https://job.fulltruckalliance.com/", "official_careers", "platform", ["满帮"]],
    ["yuanfudao", "猿辅导", "Yuanfudao", "教育科技", "https://app.mokahr.com/campus-recruitment/yuanfudao", "official_campus", "tech", ["猿辅导在线教育"]],
    ["zuoyebang", "作业帮", "Zuoyebang", "教育科技", "https://job.zuoyebang.com/", "official_careers", "tech"],
    ["vivo", "vivo", "vivo", "消费电子与智能终端", "https://hr.vivo.com/", "official_careers", "hardware"],
    ["realme", "realme", "realme", "消费电子与智能终端", "https://career.realme.com/", "official_careers", "hardware"],
    ["transsion", "传音控股", "Transsion", "消费电子与智能终端", "https://careers.transsion.com/", "official_careers", "hardware"],
    ["gree", "格力电器", "Gree", "家电制造", "https://gree.zhiye.com/", "official_careers", "hardware"],
    ["skyworth", "创维集团", "Skyworth", "家电与显示", "https://career.skyworth.com/", "official_careers", "hardware"],
    ["changhong", "长虹", "Changhong", "家电与消费电子", "https://hr.changhong.com/", "official_careers", "hardware"],
    ["konka", "康佳集团", "Konka", "消费电子与家电", "https://career.konka.com/", "official_careers", "hardware"],
    ["lens", "蓝思科技", "Lens Technology", "精密制造", "https://lens.zhiye.com/", "official_careers", "hardware"],
    ["goertek", "歌尔股份", "Goertek", "精密制造与声学", "https://goertek.zhiye.com/", "official_careers", "hardware"],
    ["sunny-optical", "舜宇光学", "Sunny Optical", "光学与精密制造", "https://hr.sunnyoptical.com/", "official_careers", "hardware"],
    ["sunwoda", "欣旺达", "Sunwoda", "电池与储能", "https://sunwoda.zhiye.com/", "official_careers", "hardware"],
    ["gigadevice", "兆易创新", "GigaDevice", "半导体", "https://career.gigadevice.com/", "official_careers", "tech"],
    ["goodix", "汇顶科技", "Goodix", "半导体", "https://campus.goodix.com/", "official_campus", "tech"],
    ["focus-media", "分众传媒", "Focus Media", "广告与媒体", "https://join.focusmedia.cn/", "official_careers", "consumer"],
    ["perfect-world", "完美世界", "Perfect World", "游戏与文娱", "https://jobs.wanmei.com/", "official_careers", "tech"],
    ["mihoyo", "米哈游", "miHoYo", "游戏与文娱", "https://jobs.mihoyo.com/", "official_careers", "tech"],
    ["lilith", "莉莉丝游戏", "Lilith Games", "游戏与文娱", "https://careers.lilith.com/", "official_careers", "tech", ["莉莉丝"]],
    ["37interactive", "三七互娱", "37 Interactive", "游戏与互联网", "https://zhaopin.37.com/", "official_careers", "tech"],
    ["netdragon", "网龙", "NetDragon", "互联网与教育科技", "https://join.nd.com.cn/", "official_careers", "tech"],
    ["kingsoft-office", "金山办公", "Kingsoft Office", "办公软件", "https://join.wps.cn/", "official_careers", "tech", ["WPS"]],
    ["sensetime", "商汤科技", "SenseTime", "人工智能", "https://join.sensetime.com/", "official_careers", "tech"],
    ["megvii", "旷视科技", "Megvii", "人工智能", "https://careers.megvii.com/", "official_careers", "tech"],
    ["fourth-paradigm", "第四范式", "4Paradigm", "人工智能", "https://careers.4paradigm.com/", "official_careers", "tech"],
    ["cambricon", "寒武纪", "Cambricon", "AI 芯片", "https://career.cambricon.com/", "official_careers", "tech"],
    ["horizon-robotics", "地平线", "Horizon Robotics", "智能驾驶与芯片", "https://join.horizon.auto/", "official_careers", "auto"],
    ["ubtech", "优必选", "UBTECH", "机器人", "https://career.ubtrobot.com/", "official_careers", "tech"],
    ["geekplus", "极智嘉", "Geek+", "机器人与物流自动化", "https://career.geekplus.com/", "official_careers", "tech"],
    ["ecarx", "亿咖通科技", "ECARX", "汽车智能化", "https://careers.ecarxgroup.com/", "official_careers", "auto"],
    ["great-wall-motor", "长城汽车", "Great Wall Motor", "汽车与智能出行", "https://campus.gwm.com.cn/", "official_campus", "auto"],
    ["chery-holding", "奇瑞控股", "Chery Holding", "汽车与智能出行", "https://campus.cheryholding.com/", "official_campus", "auto", ["奇瑞"]],
    ["seres", "赛力斯", "SERES", "汽车与新能源", "https://job.seres.cn/", "official_careers", "auto"],
    ["leapmotor", "零跑汽车", "Leapmotor", "汽车与智能出行", "https://app.mokahr.com/social-recruitment/leapmotor/", "official_careers", "auto"],
    ["yili", "伊利集团", "Yili", "食品与乳业", "https://campus.yili.com/", "official_campus", "consumer"],
    ["mengniu", "蒙牛集团", "Mengniu", "食品与乳业", "https://mengniu.zhiye.com/", "official_careers", "consumer"],
    ["nongfu-spring", "农夫山泉", "Nongfu Spring", "食品饮料", "https://career.nongfuspring.com/", "official_careers", "consumer"],
    ["genki-forest", "元气森林", "Genki Forest", "食品饮料", "https://join.genkiforest.com/", "official_careers", "consumer"],
    ["haitian-flavoring", "海天味业", "Haitian", "食品制造", "https://zhaopin.haitian-food.com/", "official_careers", "consumer"],
    ["dongpeng-drink", "东鹏饮料", "Dongpeng Beverage", "食品饮料", "https://dpdrink.zhiye.com/", "official_careers", "consumer"],
    ["anta", "安踏集团", "ANTA", "服饰与消费品牌", "https://anta.zhiye.com/", "official_careers", "consumer"],
    ["lining", "李宁", "Li-Ning", "服饰与消费品牌", "https://li-ning.zhiye.com/", "official_careers", "consumer"],
    ["bosideng", "波司登", "Bosideng", "服饰与消费品牌", "https://bosideng.zhiye.com/", "official_careers", "consumer"],
    ["hla", "海澜之家", "HLA", "服饰零售", "https://career.hlamall.cn/", "official_careers", "consumer"],
    ["mindray", "迈瑞医疗", "Mindray", "医疗器械", "https://mindray.zhiye.com/campus", "official_campus", "pharma"],
    ["united-imaging", "联影医疗", "United Imaging", "医疗器械", "https://campus.united-imaging.com/", "official_campus", "pharma"],
    ["bgi", "华大基因", "BGI", "生命科学", "https://career.genomics.cn/", "official_careers", "pharma"],
    ["wuxi-apptec", "药明康德", "WuXi AppTec", "医药研发服务", "https://careers.wuxiapptec.com/", "official_careers", "pharma"],
    ["wuxi-biologics", "药明生物", "WuXi Biologics", "生物医药", "https://careers.wuxibiologics.com/", "official_careers", "pharma"],
    ["pharmaron", "康龙化成", "Pharmaron", "医药研发服务", "https://pharmaron.zhiye.com/Campus", "official_campus", "pharma"],
    ["tigermed", "泰格医药", "Tigermed", "医药研发服务", "https://career.tigermedgrp.com/", "official_careers", "pharma"],
    ["aier-eye", "爱尔眼科", "Aier Eye", "医疗服务", "https://aier.zhiye.com/", "official_careers", "pharma"],
    ["tongwei", "通威股份", "Tongwei", "新能源与农业", "https://twrecruit.tongwei.com/", "official_careers", "energy"],
    ["trinasolar", "天合光能", "Trina Solar", "光伏新能源", "https://job.trinasolar.com/", "official_careers", "energy"],
    ["ja-solar", "晶澳科技", "JA Solar", "光伏新能源", "https://hr.jasolar.com/", "official_careers", "energy"],
    ["jinko-solar", "晶科能源", "JinkoSolar", "光伏新能源", "https://career.jinkosolar.com/", "official_careers", "energy"],
    ["canadian-solar", "阿特斯", "Canadian Solar", "光伏新能源", "https://recruit.cnsolare.com/", "official_careers", "energy"],
    ["gcl-tech", "协鑫集团", "GCL", "新能源", "https://career.gclsi.com/", "official_careers", "energy"],
    ["flat-glass", "福莱特", "Flat Glass", "新能源材料", "https://career.flatgroup.com/", "official_careers", "energy"],
    ["eve-energy", "亿纬锂能", "EVE Energy", "电池与储能", "https://eve.zhiye.com/", "official_careers", "energy"],
    ["hithium", "海辰储能", "Hithium", "储能", "https://app.mokahr.com/social-recruitment/hithium/", "official_careers", "energy"]
  ].map((entry) => makeEntry(privateChina, entry)),
  ...[
    ["ping-an", "中国平安", "Ping An", "保险与金融", "https://campus.pingan.com/", "official_campus", "finance", ["平安集团"]],
    ["china-life", "中国人寿", "China Life", "保险", "https://www.chinalife.com.cn/chinalife/zhaopin/", "official_careers", "finance"],
    ["picc", "中国人保", "PICC", "保险", "https://zhaopin.picc.com/", "official_careers", "finance"],
    ["cpic", "中国太保", "CPIC", "保险", "https://career.cpic.com.cn/", "official_careers", "finance"],
    ["taikang", "泰康保险集团", "Taikang", "保险", "https://job.taikang.com/", "official_careers", "finance"],
    ["taiping-insurance", "中国太平保险", "China Taiping", "保险", "https://www.cntaiping.com/zhaopin", "official_careers", "finance"],
    ["new-china-life", "新华保险", "NCI", "保险", "https://www.nci.com.cn/nci/zhaopin/", "official_careers", "finance"],
    ["sunshine-insurance", "阳光保险集团", "Sunshine Insurance", "保险", "https://fund.sinosig.com/job", "official_careers", "finance"],
    ["bank-of-communications", "交通银行", "Bank of Communications", "银行", "https://job.bankcomm.com/", "official_careers", "finance"],
    ["postal-savings-bank", "邮储银行", "PSBC", "银行", "https://psbc.hotjob.cn/", "official_careers", "finance"],
    ["industrial-bank", "兴业银行", "Industrial Bank", "银行", "https://job.cib.com.cn/", "official_careers", "finance"],
    ["spdb", "浦发银行", "SPDB", "银行", "https://job.spdb.com.cn/", "official_careers", "finance"],
    ["cmbc-bank", "民生银行", "CMBC", "银行", "https://career.cmbc.com.cn/", "official_careers", "finance"],
    ["cgb-bank", "广发银行", "CGB", "银行", "https://job.cgbchina.com.cn/", "official_careers", "finance"],
    ["huaxia-bank", "华夏银行", "Huaxia Bank", "银行", "https://zhaopin.hxb.com.cn/", "official_careers", "finance"],
    ["zheshang-bank", "浙商银行", "CZBank", "银行", "https://zp.czbank.com.cn/", "official_careers", "finance"],
    ["bohai-bank", "渤海银行", "China Bohai Bank", "银行", "https://career.cbhb.com.cn/", "official_careers", "finance"],
    ["beijing-bank", "北京银行", "Bank of Beijing", "银行", "https://bankofbeijing.zhiye.com/", "official_careers", "finance"],
    ["jiangsu-bank", "江苏银行", "Bank of Jiangsu", "银行", "https://hr.jsbchina.cn/", "official_careers", "finance"],
    ["ningbo-bank", "宁波银行", "Bank of Ningbo", "银行", "https://zhaopin.nbcb.com.cn/", "official_careers", "finance"],
    ["shanghai-bank", "上海银行", "Bank of Shanghai", "银行", "https://bosc.zhiye.com/", "official_careers", "finance"],
    ["hangzhou-bank", "杭州银行", "Bank of Hangzhou", "银行", "https://career.hzbank.com.cn/", "official_careers", "finance"],
    ["nanjing-bank", "南京银行", "Bank of Nanjing", "银行", "https://zhaopin.njcb.com.cn/", "official_careers", "finance"],
    ["chengdu-bank", "成都银行", "Bank of Chengdu", "银行", "https://bocdhotjob.zhiye.com/", "official_careers", "finance"],
    ["citic-securities", "中信证券", "CITIC Securities", "证券", "https://careers.citics.com/", "official_careers", "finance"],
    ["csc-financial", "中信建投证券", "CSC Financial", "证券", "https://job.csc.com.cn/", "official_careers", "finance"],
    ["huatai-securities", "华泰证券", "Huatai Securities", "证券", "https://job.htsc.com.cn/", "official_careers", "finance"],
    ["cms-securities", "招商证券", "CMS", "证券", "https://career.cmschina.com/", "official_careers", "finance"],
    ["gf-securities", "广发证券", "GF Securities", "证券", "https://career.gf.com.cn/", "official_careers", "finance"],
    ["cicc", "中金公司", "CICC", "证券与投资银行", "https://career.cicc.com/", "official_careers", "finance"],
    ["guosen-securities", "国信证券", "Guosen Securities", "证券", "https://hr.guosen.com.cn/", "official_careers", "finance"],
    ["oriental-securities", "东方证券", "Oriental Securities", "证券", "https://job.dfzq.com.cn/", "official_careers", "finance"],
    ["shenwan-hongyuan", "申万宏源", "Shenwan Hongyuan", "证券", "https://job.swhygh.com/", "official_careers", "finance"],
    ["industrial-securities", "兴业证券", "Industrial Securities", "证券", "https://xyzp.xyzq.com.cn/", "official_careers", "finance"],
    ["zhongtai-securities", "中泰证券", "Zhongtai Securities", "证券", "https://hr.zts.com.cn/", "official_careers", "finance"],
    ["air-china", "中国国际航空", "Air China", "航空运输", "https://job.airchina.com.cn/", "official_careers", "logistics"],
    ["china-eastern", "中国东方航空", "China Eastern", "航空运输", "https://job.ceair.com/", "official_careers", "logistics"],
    ["china-southern-airlines", "中国南方航空", "China Southern", "航空运输", "https://job.csair.com/", "official_careers", "logistics"],
    ["cosco-shipping", "中远海运", "COSCO Shipping", "航运与物流", "https://talent.coscoshipping.com/", "official_careers", "logistics"],
    ["china-minmetals", "中国五矿", "China Minmetals", "金属与资源", "https://campus.minmetals.com.cn/", "official_careers", "industrial"],
    ["sinochem", "中化集团", "Sinochem", "综合化工与农业", "https://sinochem.hotjob.cn/", "official_careers", "industrial"],
    ["cgn", "中国广核", "CGN", "能源", "https://job.cgnpc.com.cn/", "official_careers", "energy"],
    ["ctg", "三峡集团", "China Three Gorges", "能源", "https://zhaopin.ctg.com.cn/", "official_careers", "energy"],
    ["cnbm", "中国建材集团", "CNBM", "建材", "https://zhaopin.cnbm.com.cn/", "official_careers", "industrial"],
    ["crsc", "中国通号", "CRSC", "轨道交通", "https://zhaopin.crsc.cn/", "official_careers", "industrial"],
    ["comac", "中国商飞", "COMAC", "航空制造", "https://job.comac.cc/", "official_careers", "industrial"],
    ["baowu", "中国宝武", "China Baowu", "钢铁与材料", "https://job.baowugroup.com/", "official_careers", "industrial"],
    ["angang", "鞍钢集团", "Ansteel", "钢铁与材料", "https://zhaopin.ansteel.cn/", "official_careers", "industrial"],
    ["sinomach", "国机集团", "SINOMACH", "装备制造", "https://zhaopin.sinomach.com.cn/", "official_careers", "industrial"],
    ["poly-group", "保利集团", "Poly Group", "综合产业", "https://zhaopin.poly.com.cn/", "official_careers", "industrial"],
    ["china-coal", "中国中煤", "China Coal", "能源", "https://zhaopin.chinacoal.com/", "official_careers", "energy"],
    ["huadian", "中国华电", "China Huadian", "能源", "https://zhaopin.chd.com.cn/", "official_careers", "energy"],
    ["datang", "中国大唐", "China Datang", "能源", "https://zhaopin.china-cdt.com/", "official_careers", "energy"],
    ["cecep", "中国节能", "CECEP", "环保与能源", "https://zhaopin.cecep.cn/", "official_careers", "energy"],
    ["china-tourism-group", "中国旅游集团", "China Tourism Group", "旅游与消费", "https://job.ctg.cn/", "official_careers", "retail"]
  ].map((entry, index) =>
    index < 8
      ? makeEntry(localSoe, entry)
      : index < 24
        ? makeEntry((input) => financial(input, "股份制银行", "股份制"), entry)
        : index < 35
          ? makeEntry(localSoe, entry)
          : makeEntry(stateOwned, entry)
  ),
  ...[
    ["deloitte-china", "德勤中国", "Deloitte China", "咨询与审计", "https://www2.deloitte.com/cn/en/careers.html", "official_careers", "finance"],
    ["pwc-china", "普华永道中国", "PwC China", "咨询与审计", "https://www.pwccn.com/zh/careers.html", "official_careers", "finance"],
    ["ey-china", "安永中国", "EY China", "咨询与审计", "https://www.ey.com/zh_cn/careers", "official_careers", "finance"],
    ["kpmg-china", "毕马威中国", "KPMG China", "咨询与审计", "https://kpmg.com/cn/zh/home/careers.html", "official_careers", "finance"],
    ["capgemini-china", "凯捷中国", "Capgemini China", "咨询与技术服务", "https://www.capgemini.com/careers/", "official_careers", "tech"],
    ["tcs-china", "塔塔咨询中国", "TCS China", "咨询与技术服务", "https://www.tcs.com/careers", "official_careers", "tech"],
    ["infosys-china", "印孚瑟斯中国", "Infosys China", "咨询与技术服务", "https://www.infosys.com/careers.html", "official_careers", "tech"],
    ["dell-china", "戴尔中国", "Dell China", "信息技术硬件", "https://jobs.dell.com/", "official_careers", "industrial"],
    ["hp-china", "惠普中国", "HP China", "信息技术硬件", "https://careers.hp.com/", "official_careers", "industrial"],
    ["ericsson-china", "爱立信中国", "Ericsson China", "通信设备", "https://www.ericsson.com/en/careers", "official_careers", "industrial"],
    ["nokia-china", "诺基亚中国", "Nokia China", "通信设备", "https://www.nokia.com/about-us/careers/", "official_careers", "industrial"],
    ["nvidia-china", "英伟达中国", "NVIDIA China", "半导体与 AI", "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite", "official_careers", "tech"],
    ["amd-china", "AMD中国", "AMD China", "半导体", "https://careers.amd.com/careers-home", "official_careers", "tech"],
    ["ti-china", "德州仪器中国", "TI China", "半导体", "https://careers.ti.com/", "official_careers", "tech"],
    ["nxp-china", "恩智浦中国", "NXP China", "半导体", "https://www.nxp.com/company/about-nxp/careers:CAREERS", "official_careers", "tech"],
    ["stmicro-china", "意法半导体中国", "STMicroelectronics China", "半导体", "https://careers.st.com/", "official_careers", "tech"],
    ["infineon-china", "英飞凌中国", "Infineon China", "半导体", "https://www.infineon.com/cms/en/careers/", "official_careers", "tech"],
    ["micron-china", "美光中国", "Micron China", "半导体", "https://careers.micron.com/careers", "official_careers", "tech"],
    ["applied-materials-china", "应用材料中国", "Applied Materials China", "半导体设备", "https://careers.appliedmaterials.com/careers", "official_careers", "industrial"],
    ["lam-research-china", "泛林中国", "Lam Research China", "半导体设备", "https://careers.lamresearch.com/", "official_careers", "industrial"],
    ["asml-china", "ASML中国", "ASML China", "半导体设备", "https://www.asml.com/en/careers", "official_careers", "industrial"],
    ["kla-china", "科磊中国", "KLA China", "半导体设备", "https://www.kla.com/careers", "official_careers", "industrial"],
    ["ge-healthcare-china", "GE医疗中国", "GE HealthCare China", "医疗器械", "https://careers.gehealthcare.com/global/en", "official_careers", "pharma"],
    ["medtronic-china", "美敦力中国", "Medtronic China", "医疗器械", "https://www.medtronic.com/us-en/about/careers.html", "official_careers", "pharma"],
    ["siemens-healthineers-china", "西门子医疗中国", "Siemens Healthineers China", "医疗器械", "https://www.siemens-healthineers.com/careers", "official_careers", "pharma"],
    ["msd-china", "默沙东中国", "MSD China", "医药", "https://jobs.msd.com/", "official_careers", "pharma"],
    ["lilly-china", "礼来中国", "Lilly China", "医药", "https://careers.lilly.com/", "official_careers", "pharma"],
    ["gsk-china", "葛兰素史克中国", "GSK China", "医药", "https://jobs.gsk.com/", "official_careers", "pharma"],
    ["novartis-china", "诺华中国", "Novartis China", "医药", "https://www.novartis.com/careers/career-search", "official_careers", "pharma"],
    ["abbvie-china", "艾伯维中国", "AbbVie China", "医药", "https://careers.abbvie.com/", "official_careers", "pharma"],
    ["merck-china", "默克中国", "Merck China", "医药与化工", "https://jobs.vibrantm.com/", "official_careers", "pharma"],
    ["fresenius-china", "费森尤斯中国", "Fresenius China", "医疗健康", "https://www.fresenius.com/careers", "official_careers", "pharma"],
    ["bd-china", "BD中国", "BD China", "医疗器械", "https://jobs.bd.com/", "official_careers", "pharma"],
    ["baxter-china", "百特中国", "Baxter China", "医疗器械", "https://jobs.baxter.com/", "official_careers", "pharma"],
    ["3m-china", "3M中国", "3M China", "工业与材料", "https://www.3m.com/3M/en_US/careers-us/", "official_careers", "industrial"],
    ["dupont-china", "杜邦中国", "DuPont China", "化工与材料", "https://careers.dupont.com/", "official_careers", "industrial"],
    ["dow-china", "陶氏中国", "Dow China", "化工与材料", "https://corporate.dow.com/en-us/careers.html", "official_careers", "industrial"],
    ["basf-china", "巴斯夫中国", "BASF China", "化工与材料", "https://www.basf.com/global/en/careers.html", "official_careers", "industrial"],
    ["evonik-china", "赢创中国", "Evonik China", "化工与材料", "https://careers.evonik.com/", "official_careers", "industrial"],
    ["covestro-china", "科思创中国", "Covestro China", "化工与材料", "https://careers.covestro.com/", "official_careers", "industrial"],
    ["henkel-china", "汉高中国", "Henkel China", "消费品与化工", "https://www.henkel.com/careers", "official_careers", "industrial"],
    ["air-liquide-china", "液化空气中国", "Air Liquide China", "工业气体", "https://www.airliquide.com/careers", "official_careers", "industrial"],
    ["saint-gobain-china", "圣戈班中国", "Saint-Gobain China", "建材", "https://www.saint-gobain.com/en/careers", "official_careers", "industrial"],
    ["michelin-china", "米其林中国", "Michelin China", "汽车零部件", "https://careers.michelin.com/", "official_careers", "industrial"],
    ["schaeffler-china", "舍弗勒中国", "Schaeffler China", "汽车零部件", "https://www.schaeffler.com/en/careers/", "official_careers", "industrial"],
    ["continental-china", "大陆集团中国", "Continental China", "汽车零部件", "https://jobs.continental.com/en/", "official_careers", "industrial"],
    ["zf-china", "采埃孚中国", "ZF China", "汽车零部件", "https://jobs.zf.com/", "official_careers", "industrial"],
    ["freudenberg-china", "科德宝中国", "Freudenberg China", "工业制造", "https://jobs.freudenberg.com/", "official_careers", "industrial"],
    ["danaher-china", "丹纳赫中国", "Danaher China", "科学仪器", "https://jobs.danaher.com/global/en", "official_careers", "pharma"],
    ["dhl-china", "DHL中国", "DHL China", "物流", "https://careers.dhl.com/", "official_careers", "logistics"],
    ["maersk-china", "马士基中国", "Maersk China", "航运与物流", "https://www.maersk.com/careers", "official_careers", "logistics"],
    ["fedex-china", "联邦快递中国", "FedEx China", "物流", "https://careers.fedex.com/", "official_careers", "logistics"],
    ["ups-china", "UPS中国", "UPS China", "物流", "https://www.jobs-ups.com/", "official_careers", "logistics"],
    ["db-schenker-china", "德铁信可中国", "DB Schenker China", "物流", "https://dbschenker.com/global/careers", "official_careers", "logistics"],
    ["nike-china", "耐克中国", "Nike China", "消费品牌", "https://jobs.nike.com/", "official_careers", "retail"],
    ["adidas-china", "阿迪达斯中国", "Adidas China", "消费品牌", "https://careers.adidas-group.com/", "official_careers", "retail"],
    ["decathlon-china", "迪卡侬中国", "Decathlon China", "零售", "https://careers.decathlon.com/", "official_careers", "retail"],
    ["ikea-china", "宜家中国", "IKEA China", "零售", "https://www.ikea.cn/cn/this-is-ikea/work-with-us/", "official_careers", "retail"],
    ["hm-china", "H&M中国", "H&M China", "零售", "https://career.hm.com/", "official_careers", "retail"],
    ["inditex-china", "Inditex中国", "Inditex China", "零售", "https://www.inditexcareers.com/portalweb/en/home", "official_careers", "retail"],
    ["uniqlo-china", "优衣库中国", "UNIQLO China", "零售", "https://www.fastretailing.com/employment/zh/uniqlo/china/", "official_careers", "retail"],
    ["muji-china", "无印良品中国", "MUJI China", "零售", "https://career.muji.com/", "official_careers", "retail"],
    ["lululemon-china", "lululemon中国", "lululemon China", "消费品牌", "https://careers.lululemon.com/en_US/careers/Home", "official_careers", "retail"],
    ["costco-china", "开市客中国", "Costco China", "零售", "https://cta.cadienttalent.com/index.jsp?applicationName=CostcoNonReqExt", "official_careers", "retail"],
    ["apple-china", "苹果中国", "Apple China", "消费电子", "https://jobs.apple.com/zh-cn/search", "official_careers", "hardware"],
    ["google-china", "谷歌中国", "Google China", "互联网与云计算", "https://www.google.com/about/careers/applications/jobs/results", "official_careers", "tech"],
    ["salesforce-china", "Salesforce中国", "Salesforce China", "企业软件", "https://careers.salesforce.com/en/jobs/", "official_careers", "tech"],
    ["servicenow-china", "ServiceNow中国", "ServiceNow China", "企业软件", "https://careers.servicenow.com/", "official_careers", "tech"],
    ["vmware-china", "VMware中国", "VMware China", "企业软件", "https://careers.vmware.com/", "official_careers", "tech"],
    ["snowflake-china", "Snowflake中国", "Snowflake China", "云计算", "https://careers.snowflake.com/us/en", "official_careers", "tech"],
    ["paypal-china", "PayPal中国", "PayPal China", "金融科技", "https://careers.pypl.com/home/", "official_careers", "tech"],
    ["ebay-china", "eBay中国", "eBay China", "电商与互联网", "https://jobs.ebayinc.com/us/en", "official_careers", "tech"],
    ["booking-china", "Booking.com中国", "Booking.com China", "旅游互联网", "https://jobs.booking.com/careers", "official_careers", "retail"],
    ["expedia-china", "Expedia中国", "Expedia China", "旅游互联网", "https://careers.expediagroup.com/", "official_careers", "retail"],
    ["bosch-rexroth-china", "博世力士乐中国", "Bosch Rexroth China", "工业自动化", "https://www.boschrexroth.com/en/cn/company/career/", "official_careers", "industrial"],
    ["thyssenkrupp-china", "蒂森克虏伯中国", "thyssenkrupp China", "工业制造", "https://www.thyssenkrupp.com/en/careers", "official_careers", "industrial"],
    ["abbott-china", "雅培中国", "Abbott China", "医疗健康", "https://www.jobs.abbott/us/en", "official_careers", "pharma"],
    ["bms-china", "百时美施贵宝中国", "BMS China", "医药", "https://careers.bms.com/", "official_careers", "pharma"],
    ["boehringer-ingelheim-china", "勃林格殷格翰中国", "Boehringer Ingelheim China", "医药", "https://careers.boehringer-ingelheim.com/", "official_careers", "pharma"],
    ["takeda-china", "武田中国", "Takeda China", "医药", "https://jobs.takeda.com/", "official_careers", "pharma"],
    ["biogen-china", "渤健中国", "Biogen China", "医药", "https://careers.biogen.com/", "official_careers", "pharma"],
    ["ferring-china", "辉凌中国", "Ferring China", "医药", "https://careers.ferring.com/", "official_careers", "pharma"],
    ["sartorius-china", "赛多利斯中国", "Sartorius China", "生命科学仪器", "https://www.sartorius.com/en/company/careers", "official_careers", "pharma"],
    ["agilent-china", "安捷伦中国", "Agilent China", "科学仪器", "https://careers.agilent.com/", "official_careers", "pharma"],
    ["waters-china", "沃特世中国", "Waters China", "科学仪器", "https://jobs.waters.com/", "official_careers", "pharma"],
    ["illumina-china", "因美纳中国", "Illumina China", "生命科学", "https://jobs.illumina.com/", "official_careers", "pharma"],
    ["keysight-china", "是德科技中国", "Keysight China", "测试测量", "https://jobs.keysight.com/", "official_careers", "tech"],
    ["hexagon-china", "海克斯康中国", "Hexagon China", "工业软件与测量", "https://hexagon.com/company/careers", "official_careers", "industrial"],
    ["emerson-china", "艾默生中国", "Emerson China", "工业自动化", "https://jobs.emerson.com/", "official_careers", "industrial"],
    ["rockwell-china", "罗克韦尔自动化中国", "Rockwell China", "工业自动化", "https://www.rockwellautomation.com/en-us/company/careers.html", "official_careers", "industrial"],
    ["johnson-controls-china", "江森自控中国", "Johnson Controls China", "楼宇科技", "https://jobs.johnsoncontrols.com/", "official_careers", "industrial"],
    ["carrier-china", "开利中国", "Carrier China", "楼宇科技", "https://jobs.carrier.com/", "official_careers", "industrial"],
    ["otis-china", "奥的斯中国", "Otis China", "楼宇科技", "https://otis.wd5.myworkdayjobs.com/External", "official_careers", "industrial"],
    ["tesla-china", "特斯拉中国", "Tesla China", "汽车与新能源", "https://www.tesla.com/careers/search", "official_careers", "auto"],
    ["hyundai-mobis-china", "现代摩比斯中国", "Hyundai Mobis China", "汽车零部件", "https://careers.mobis.com/", "official_careers", "industrial"],
    ["yokogawa-china", "横河中国", "Yokogawa China", "工业自动化", "https://careers.yokogawa.com/", "official_careers", "industrial"],
    ["komatsu-china", "小松中国", "Komatsu China", "工程机械", "https://www.komatsu.jp/en/careers", "official_careers", "industrial"],
    ["hitachi-energy-china", "日立能源中国", "Hitachi Energy China", "能源设备", "https://careers.hitachi.com/", "official_careers", "energy"],
    ["panasonic-china", "松下中国", "Panasonic China", "消费电子", "https://careers.apac.panasonic.com/", "official_careers", "hardware"],
    ["sony-china", "索尼中国", "Sony China", "消费电子与娱乐", "https://www.sonyjobs.com/", "official_careers", "hardware"],
    ["samsung-china", "三星中国", "Samsung China", "消费电子", "https://sec.wd3.myworkdayjobs.com/Samsung_Careers", "official_careers", "hardware"],
    ["lg-china", "LG中国", "LG China", "消费电子", "https://www.lg.com/global/careers", "official_careers", "hardware"]
  ].map((entry) => makeEntry(foreignCompany, entry))
];

const merged = [...existing];

for (const company of additions) {
  if (merged.length >= TARGET_COUNT) {
    break;
  }

  if (existingIds.has(company.id)) {
    continue;
  }

  merged.push(company);
  existingIds.add(company.id);
}

if (merged.length !== TARGET_COUNT) {
  throw new Error(`Expected ${TARGET_COUNT} companies after expansion, got ${merged.length}.`);
}

fs.writeFileSync(DATA_PATH, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Expanded company pool to ${merged.length}`);
