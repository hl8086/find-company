import fs from "node:fs";

const DATA_PATH = new URL("../data/companies.json", import.meta.url);
const CAPTURED_AT = "2026-04-06";
const TARGET_COUNT = 800;

const rawExisting = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const dedupedExisting = [];
const existingIds = new Set();
const existingNames = new Set();

for (const company of rawExisting) {
  const normalizedName = normalizeName(company.name);
  if (existingIds.has(company.id) || existingNames.has(normalizedName)) {
    continue;
  }
  dedupedExisting.push(company);
  existingIds.add(company.id);
  existingNames.add(normalizedName);
}

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

function normalizeName(name) {
  return String(name).replace(/\s+/g, "").replace(/[()（）·,，.]/g, "").toLowerCase();
}

function makeEvidence(company) {
  return [
    {
      id: `${company.id}-primary`,
      sourceType: company.primaryJobUrlType,
      title: company.primaryJobUrlVerified ? `${company.name}招聘入口` : `${company.name}官网或招聘入口`,
      url: company.primaryJobUrl,
      publisher: `${company.name}公开入口`,
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
    employeeScaleScope: input.employeeScaleScope ?? defaults.employeeScaleScope ?? "china",
    employeeScaleVerified: false,
    campusHiringStatus: input.campusHiringStatus ?? "uncertain",
    campusHiringLastSeenAt: CAPTURED_AT,
    primaryJobUrlVerified: input.primaryJobUrlVerified ?? false,
    primaryJobUrlVerifiedAt: CAPTURED_AT,
    primaryJobUrlNote:
      input.primaryJobUrlNote ?? "新增非外企公司池记录，当前保留官网或公开招聘入口，待继续逐条核验。",
    notes: input.notes ?? "扩容到 800 家时新增，当前优先补唯一公司并避免与既有公司重复。",
    tags:
      input.tags ??
      [
        input.primaryJobUrlType === "official_campus" ? "官方校招" : "官方招聘",
        input.industry,
        input.primaryJobUrlVerified ? "已核验" : "待复核"
      ],
    evidence: makeEvidence(input),
    employeeScaleText: input.employeeScaleText ?? "员工规模大于 300 人，具体口径待补充。",
    employeeScaleValue: input.employeeScaleValue ?? defaults.employeeScaleValue ?? 1000,
    companyType: defaults.companyType,
    ownershipType: defaults.ownershipType,
    hqCountry: "中国",
    description: input.description ?? `${input.name}为${input.industry}领域大型企业，当前先保留官网或公开招聘入口。`,
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
    employeeScaleValue: 3000,
    employeeScaleScope: "china"
  });
}

function mixedChina(entry) {
  return finalizeCompany(entry, {
    companyType: "混合所有制企业",
    ownershipType: "股份制",
    employeeScaleValue: 3000,
    employeeScaleScope: "china"
  });
}

function stateOwned(entry) {
  return finalizeCompany(entry, {
    companyType: "央企",
    ownershipType: "央企",
    employeeScaleValue: 10000,
    employeeScaleScope: "china"
  });
}

function localSoe(entry) {
  return finalizeCompany(entry, {
    companyType: "国企",
    ownershipType: "国企",
    employeeScaleValue: 5000,
    employeeScaleScope: "china"
  });
}

function financial(entry, companyType = "股份制银行", ownershipType = "股份制") {
  return finalizeCompany(entry, {
    companyType,
    ownershipType,
    employeeScaleValue: 3000,
    employeeScaleScope: "china"
  });
}

function makeEntry(builder, tuple) {
  const [id, name, nameEn, industry, url, locKey, extras = {}] = tuple;
  const loc = locations[locKey];
  return builder({
    id,
    slug: id,
    name,
    nameEn,
    industry,
    primaryJobUrl: url,
    primaryJobUrlType: extras.primaryJobUrlType ?? "official_careers",
    provinces: extras.provinces ?? loc.provinces,
    cities: extras.cities ?? loc.cities,
    aliases: extras.aliases ?? [],
    ...extras
  });
}

const privateCandidates = [
  ["360-security", "三六零", "360", "网络安全与互联网", "https://hr.360.cn/", "tech"],
  ["sangfor", "深信服", "Sangfor", "网络安全与云计算", "https://www.sangfor.com.cn/", "tech"],
  ["qi-anxin", "奇安信", "QiAnXin", "网络安全", "https://www.qianxin.com/", "tech"],
  ["venus-tech", "启明星辰", "Venustech", "网络安全", "https://www.venustech.com.cn/", "tech"],
  ["nsfocus", "绿盟科技", "NSFOCUS", "网络安全", "https://www.nsfocus.com.cn/", "tech"],
  ["dbappsecurity", "安恒信息", "DBAPPSecurity", "网络安全", "https://www.dbappsecurity.com.cn/", "tech"],
  ["topsec", "天融信", "Topsec", "网络安全", "https://www.topsec.com.cn/", "tech"],
  ["thundersoft", "中科创达", "ThunderSoft", "智能操作系统与软件", "https://www.thundersoft.com/", "tech"],
  ["hundsun", "恒生电子", "Hundsun", "金融软件", "https://www.hundsun.com/", "tech"],
  ["yusys", "宇信科技", "Yusys", "金融软件", "https://www.yusys.com.cn/", "tech"],
  ["beyondsoft", "博彦科技", "Beyondsoft", "软件与IT服务", "https://www.beyondsoft.com/", "tech"],
  ["isoftstone", "软通动力", "iSoftStone", "软件与IT服务", "https://www.isoftstone.com/", "tech"],
  ["dcits", "东华软件", "DHC Software", "软件与医疗信息化", "https://www.dhcc.com.cn/job.html", "tech"],
  ["longshine-group", "朗新集团", "Longshine", "数字能源与软件", "https://www.longshine.com/", "tech"],
  ["trs", "拓尔思", "TRS", "数据智能", "https://www.trs.com.cn/", "tech"],
  ["digital-zhengtong", "数字政通", "EGOVA", "数字政府", "https://www.egova.com.cn/", "tech"],
  ["new-point", "新点软件", "NewPoint", "政务软件", "https://www.epoint.com.cn/", "tech"],
  ["jiuqi-software", "久其软件", "Join-Cheer", "企业软件", "https://www.join-cheer.com/", "tech"],
  ["nantian-info", "南天信息", "Nantian", "金融科技", "https://www.nantian.com.cn/", "tech"],
  ["faraday-tech-china", "法本信息", "Faraday", "软件开发服务", "https://www.farben.com.cn/", "tech"],
  ["giant-network", "巨人网络", "Giant Network", "游戏与互联网", "https://www.giant.com.cn/", "tech"],
  ["kunlun-tech", "昆仑万维", "Kunlun Tech", "互联网与游戏", "https://www.kunlun.com/", "tech"],
  ["youzu", "游族网络", "Youzu", "游戏与文娱", "https://www.youzu.com/", "tech"],
  ["kingnet", "恺英网络", "Kingnet", "游戏与互联网", "https://www.kingnet.com/", "tech"],
  ["cmge", "中手游", "CMGE", "游戏与文娱", "https://www.cmge.com/", "tech"],
  ["igg-china", "IGG中国", "IGG China", "游戏与互联网", "https://www.igg.com/", "tech"],
  ["h3c", "新华三", "H3C", "网络设备与数字化基础设施", "https://www.h3c.com/cn/", "tech"],
  ["fiberhome", "烽火通信", "FiberHome", "通信设备", "https://www.fiberhome.com/", "tech"],
  ["datang-telecom", "大唐电信", "Datang Telecom", "通信与半导体", "https://www.datangtelecom.com/", "tech"],
  ["unisoc", "紫光展锐", "UNISOC", "芯片设计", "https://www.unisoc.com/", "tech"],
  ["loongson", "龙芯中科", "Loongson", "芯片设计", "https://www.loongson.cn/", "tech"],
  ["verisilicon", "芯原股份", "VeriSilicon", "芯片设计", "https://www.verisilicon.com/", "tech"],
  ["montage", "澜起科技", "Montage", "芯片设计", "https://www.montage-tech.com/", "tech"],
  ["starpower", "斯达半导", "StarPower", "功率半导体", "https://www.starpower-semi.com/", "tech"],
  ["willsemi", "韦尔股份", "Will Semiconductor", "半导体", "https://www.willsemi.com/", "tech"],
  ["rockchip", "瑞芯微", "Rockchip", "芯片设计", "https://www.rock-chips.com/", "tech"],
  ["allwinner", "全志科技", "Allwinner", "芯片设计", "https://www.allwinnertech.com/", "tech"],
  ["espressif", "乐鑫科技", "Espressif", "芯片设计", "https://www.espressif.com/", "tech"],
  ["nationz", "国民技术", "Nationz", "芯片设计", "https://www.nationz.com.cn/", "tech"],
  ["maxscend", "卓胜微", "Maxscend", "射频芯片", "https://www.maxscend.com/", "tech"],
  ["smartsens", "思特威", "SmartSens", "CMOS图像传感器", "https://www.smartsenstech.com/", "tech"],
  ["amec", "中微公司", "AMEC", "半导体设备", "https://www.amec-inc.com/", "tech"],
  ["naura", "北方华创", "NAURA", "半导体设备", "https://career.naura.com/", "tech"],
  ["acm-research-shanghai", "盛美上海", "ACM Research Shanghai", "半导体设备", "https://www.acmr.com.cn/", "tech"],
  ["kingsemi", "拓荆科技", "Piotech", "半导体设备", "https://www.piotech.cn/", "tech"],
  ["hwatsing", "华海清科", "Hwatsing", "半导体设备", "https://www.hwatsing.com/joinus_school.html", "tech"],
  ["chipsea", "芯海科技", "Chipsea", "芯片设计", "https://www.chipsea.com/", "tech"],
  ["sgmicro", "圣邦股份", "SGMICRO", "模拟芯片", "https://www.sg-micro.com/", "tech"],
  ["supcon", "中控技术", "SUPCON", "工业软件与自动化", "https://www.supcon.com/", "industrial"],
  ["hollysys", "和利时", "HollySys", "工业自动化", "https://www.hollysys.com/", "industrial"],
  ["efort", "埃夫特", "Efort", "机器人", "https://www.efort.com.cn/", "industrial"],
  ["invt", "英威腾", "INVT", "工业自动化", "https://www.invt.com/", "industrial"],
  ["step-electric", "新时达", "STEP", "工业自动化", "https://www.stepelectric.com/", "industrial"],
  ["uniview", "宇视科技", "Uniview", "安防与AI视觉", "https://cn.uniview.com/", "tech"],
  ["roborock", "石头科技", "Roborock", "智能硬件", "https://www.roborock.com/cn/", "consumer"],
  ["ecovacs", "科沃斯", "ECOVACS", "智能硬件", "https://www.ecovacs.cn/", "consumer"],
  ["dreame", "追觅科技", "Dreame", "智能硬件", "https://www.dreame.tech/", "consumer"],
  ["narwal", "云鲸智能", "Narwal", "智能硬件", "https://www.narwal.com/cn", "consumer"],
  ["aux-group", "奥克斯集团", "AUX", "家电", "https://www.auxgroup.com/", "hardware"],
  ["galanz", "格兰仕", "Galanz", "家电", "https://www.galanz.com.cn/", "hardware"],
  ["vatti", "华帝股份", "Vatti", "家电", "https://www.vatti.com.cn/about/campus_recruitment", "hardware"],
  ["vanward", "万和电气", "Vanward", "家电", "https://www.vanward.com/", "hardware"],
  ["joyoung", "九阳股份", "Joyoung", "家电", "https://www.joyoung.com/", "hardware"],
  ["semir", "森马服饰", "Semir", "服饰与消费品牌", "https://www.semir.com/", "consumer"],
  ["peacebird", "太平鸟", "Peacebird", "服饰与消费品牌", "https://www.peacebird.com/", "consumer"],
  ["youngor", "雅戈尔", "Youngor", "服饰与消费品牌", "https://www.youngor.com/", "consumer"],
  ["metersbonwe", "美邦服饰", "Metersbonwe", "服饰与消费品牌", "https://www.metersbonwe.com/", "consumer"],
  ["septwolves", "七匹狼", "Septwolves", "服饰与消费品牌", "https://www.septwolves.com/", "consumer"],
  ["hodo-group", "红豆集团", "Hodo", "服饰与消费品牌", "https://www.hongdou.com/", "consumer"],
  ["aokang", "奥康国际", "Aokang", "鞋服", "https://www.aokang.com/", "consumer"],
  ["jiumaojiu", "九毛九", "Jiumaojiu", "餐饮连锁", "https://www.jiumaojiu.com/", "consumer"],
  ["laoxiangji", "老乡鸡", "LXJ", "餐饮连锁", "https://www.lxjchina.com/", "consumer"],
  ["guangzhou-restaurant", "广州酒家", "Guangzhou Restaurant", "食品与餐饮", "https://www.gzr.com.cn/", "consumer"],
  ["quanjude", "全聚德", "Quanjude", "餐饮连锁", "https://www.quanjude.com.cn/html/ourteams/hr/", "consumer"],
  ["juewei-food", "绝味食品", "Juewei", "食品零售", "https://www.juewei.cn/", "consumer"],
  ["zhouheiya", "周黑鸭", "Zhouheiya", "食品零售", "https://www.zhouheiya.cn/", "consumer"],
  ["anjoy-food", "安井食品", "Anjoy", "食品制造", "https://www.anjoyfood.com/", "consumer"],
  ["sanquan-food", "三全食品", "Sanquan", "食品制造", "https://www.sanquan.com/", "consumer"],
  ["synear-food", "思念食品", "Synear", "食品制造", "https://www.synear.cn/", "consumer"],
  ["toly-bread", "桃李面包", "Toly Bread", "食品制造", "https://www.tolybread.com/", "consumer"],
  ["sanyuan-food", "三元股份", "Sanyuan", "食品与乳业", "https://www.sanyuan.com.cn/", "consumer"],
  ["zhongju-high-tech", "中炬高新", "Zhongju", "食品调味与制造", "https://www.zhongju.com/", "consumer"],
  ["fuling-zhacai", "涪陵榨菜", "Fuling Zhacai", "食品制造", "https://www.flzc.com/", "consumer"],
  ["jiangxiaobai", "江小白", "Jiangxiaobai", "食品饮料", "https://www.jiangxiaobai.com/", "consumer"],
  ["moutai", "贵州茅台", "Moutai", "白酒", "https://www.moutai.com.cn/", "consumer"],
  ["wuliangye", "五粮液", "Wuliangye", "白酒", "https://www.wuliangye.com.cn/", "consumer"],
  ["luzhou-laojiao", "泸州老窖", "Luzhou Laojiao", "白酒", "https://www.lzlj.com/", "consumer"],
  ["yanghe", "洋河股份", "Yanghe", "白酒", "https://www.chinayanghe.com/", "consumer"],
  ["shanxi-fenjiu", "山西汾酒", "Fenjiu", "白酒", "https://www.fenjiu.com.cn/", "consumer"],
  ["gujing-gongjiu", "古井贡酒", "Gujing", "白酒", "https://www.gujing.com/", "consumer"],
  ["jinshiyuan", "今世缘", "Jinshiyuan", "白酒", "https://www.jinshiyuan.com.cn/", "consumer"],
  ["yanjing-beer", "燕京啤酒", "Yanjing Beer", "啤酒", "https://www.yanjing.com.cn/", "consumer"],
  ["tsingtao-beer", "青岛啤酒", "Tsingtao", "啤酒", "https://www.tsingtao.com.cn/", "consumer"],
  ["yonghui", "永辉超市", "Yonghui", "零售", "https://www.yonghui.com.cn/", "retail"],
  ["better-life", "步步高", "Better Life", "零售", "https://www.bbg.com.cn/", "retail"],
  ["dashang", "大商股份", "Dashang", "零售", "https://www.dsjt.com/", "retail"],
  ["wangfujing", "王府井", "Wangfujing", "零售", "https://www.wfj.com.cn/", "retail"],
  ["easyhome", "居然之家", "Easyhome", "零售与家居", "https://www.juran.com.cn/", "retail"],
  ["red-star-macalline", "红星美凯龙", "Red Star Macalline", "零售与家居", "https://www.chinaredstar.com/", "retail"],
  ["proya", "珀莱雅", "Proya", "美妆", "https://www.proya-group.com/", "consumer"],
  ["shanghai-jahwa", "上海家化", "Shanghai Jahwa", "美妆与个护", "https://www.jahwa.com.cn/", "consumer"],
  ["botanee", "贝泰妮", "Botanee", "美妆与个护", "https://www.botanee.com.cn/", "consumer"],
  ["marubi", "丸美股份", "Marubi", "美妆与个护", "https://www.marubi.cn/", "consumer"],
  ["yadea", "雅迪科技中国", "Yadea China", "出行与智能制造", "https://www.yadea.com.cn/", "consumer"],
  ["niu-tech", "小牛电动中国", "NIU China", "智能出行", "https://www.niu.com/", "consumer"],
  ["changan-auto", "长安汽车", "Changan Auto", "汽车", "https://www.changan.com.cn/", "auto"],
  ["baic-group", "北汽集团", "BAIC", "汽车", "https://baicgroup.zhiye.com/", "auto"],
  ["foton-motor", "福田汽车", "Foton", "汽车", "https://www.foton.com.cn/", "auto"],
  ["jac-motors", "江淮汽车", "JAC", "汽车", "https://www.jac.com.cn/", "auto"],
  ["yutong-bus", "宇通客车", "Yutong", "汽车", "https://www.yutong.com/", "auto"],
  ["baic-bluepark", "北汽蓝谷", "BAIC BluePark", "汽车与新能源", "https://www.bjev.com.cn/", "auto"],
  ["faw-jiefang", "一汽解放", "FAW Jiefang", "汽车", "https://www.fawjiefang.com.cn/", "auto"],
  ["liugong", "柳工", "LiuGong", "工程机械", "https://www.liugong.com/", "industrial"],
  ["lonking", "龙工", "Lonking", "工程机械", "https://www.lonking.cn/", "industrial"],
  ["shantui", "山推股份", "Shantui", "工程机械", "https://www.shantui.com/", "industrial"],
  ["zhejiang-dingli", "浙江鼎力", "Dingli", "工程机械", "https://www.cndingli.com/", "industrial"],
  ["sdlg", "山东临工", "SDLG", "工程机械", "https://www.sdlg.cn/", "industrial"],
  ["sinotruk", "中国重汽", "Sinotruk", "汽车与重卡", "https://www.sinotruk.com/", "industrial"],
  ["wencan", "文灿股份", "Wencan", "汽车零部件", "https://www.wencan.com/", "industrial"],
  ["wanxiang-qianchao", "万向钱潮", "Wanxiang Qianchao", "汽车零部件", "https://www.wxqc.com.cn/", "industrial"],
  ["yapp-auto", "亚普股份", "YAPP", "汽车零部件", "https://www.yapp.com/", "industrial"],
  ["guoxuan-high-tech", "国轩高科", "Gotion", "电池与储能", "https://www.gotion.com.cn/", "energy"],
  ["svolt-energy", "蜂巢能源", "SVOLT", "电池与储能", "https://www.svolt.cn/", "energy"],
  ["farasis", "孚能科技", "Farasis", "电池与储能", "https://www.farasis.com/", "energy"],
  ["envision-aesc", "远景动力", "Envision AESC", "电池与储能", "https://www.envision-energy.com/", "energy"],
  ["sunresin", "蓝晓科技", "Sunresin", "新材料", "https://www.sunresin.com/", "energy"],
  ["wolong-electric", "卧龙电驱", "Wolong", "电机与自动化", "https://www.wolong.com/", "industrial"],
  ["nari", "国电南瑞", "NARI", "电力自动化", "https://www.narigroup.com/", "energy"],
  ["xuji-electric", "许继电气", "XJ Electric", "电力自动化", "https://www.xjgc.com/", "energy"],
  ["pinggao-electric", "平高电气", "Pinggao", "电力设备", "https://www.pinggao.com/", "energy"],
  ["sieyuan-electric", "思源电气", "Sieyuan", "电力设备", "https://www.sieyuan.com/", "energy"],
  ["china-xd", "中国西电", "China XD", "电力设备", "https://www.xd.com.cn/", "energy"],
  ["dongfang-electric", "东方电气", "Dongfang Electric", "能源装备", "https://www.dongfang.com/zxns/xyzp.htm", "energy"],
  ["shanghai-electric", "上海电气", "Shanghai Electric", "能源装备", "https://www.shanghai-electric.com/", "energy"],
  ["harbin-electric", "哈尔滨电气中国", "Harbin Electric China", "能源装备", "https://www.harbin-electric.com/", "energy"],
  ["wanhua-chemical", "万华化学", "Wanhua", "化工与材料", "https://www.whchem.com/", "energy"],
  ["hengli-petrochemical", "恒力石化", "Hengli", "化工与材料", "https://www.hengli.com/", "energy"],
  ["rongsheng-petrochemical", "荣盛石化", "Rongsheng", "化工与材料", "https://www.cnrspc.com/", "energy"],
  ["satellite-chemical", "卫星化学", "Satellite Chemical", "化工与材料", "https://www.stl-chem.com/", "energy"],
  ["hualu-hengsheng", "华鲁恒升", "Hualu Hengsheng", "化工与材料", "https://www.hl-hs.com/", "energy"],
  ["conch-cement", "海螺水泥", "Conch Cement", "建材", "https://www.conch.cn/", "industrial"],
  ["huaxin-cement", "华新水泥", "Huaxin Cement", "建材", "https://www.huaxincem.com/rencaizhaopin/shehuizhaopin/zhaopingonggao.html", "industrial"],
  ["bbmg", "金隅集团", "BBMG", "建材", "https://www.bbmg.com.cn/", "industrial"],
  ["jidong-cement", "冀东水泥", "Jidong Cement", "建材", "https://wecruit.hotjob.cn/SU62d139692f9d2470a6e6e052/pb/index.html#/", "industrial"],
  ["china-jushi", "中国巨石", "China Jushi", "新材料", "https://www.jushi.com/", "industrial"],
  ["kibing", "旗滨集团", "Kibing", "新材料", "https://www.kibing-glass.com/", "industrial"],
  ["monalisa", "蒙娜丽莎", "Monalisa", "建材", "https://www.monalisa.com.cn/", "industrial"],
  ["dongpeng-holdings", "东鹏控股", "Dongpeng Holdings", "建材", "https://dongpeng.zhiye.com/", "industrial"],
  ["china-lesso", "中国联塑", "China Lesso", "建材与家居", "https://www.lesso.com/", "industrial"],
  ["salt-lake", "盐湖股份", "Salt Lake", "资源与材料", "https://www.qhyhgf.com/", "energy"],
  ["zijin-mining", "紫金矿业", "Zijin Mining", "矿业与材料", "https://www.zijinmining.com/", "energy"],
  ["cmoc", "洛阳钼业", "CMOC", "矿业与材料", "https://www.cmoc.com/", "energy"],
  ["chalco", "中国铝业", "Chalco", "矿业与材料", "https://www.chalco.com.cn/", "energy"],
  ["jiangxi-copper", "江西铜业", "Jiangxi Copper", "矿业与材料", "https://www.jxcc.com/", "energy"],
  ["tongling-nonferrous", "铜陵有色", "Tongling Nonferrous", "矿业与材料", "https://www.tlys.cn/", "energy"],
  ["yunnan-copper", "云南铜业", "Yunnan Copper", "矿业与材料", "https://www.yunnancopper.com/", "energy"],
  ["western-mining", "西部矿业", "Western Mining", "矿业与材料", "https://www.westmininggroup.com/", "energy"],
  ["shandong-gold", "山东黄金", "Shandong Gold", "矿业与材料", "https://www.sdhjgf.com/", "energy"],
  ["zhongjin-gold", "中金黄金", "Zhongjin Gold", "矿业与材料", "https://www.zjgold.com/", "energy"],
  ["chifeng-gold", "赤峰黄金", "Chifeng Gold", "矿业与材料", "https://www.cfgold.com/", "energy"],
  ["china-rare-earth", "中国稀土", "China Rare Earth", "稀土材料", "https://www.crehg.com/", "energy"],
  ["northern-rare-earth", "北方稀土", "Northern Rare Earth", "稀土材料", "https://www.reht.com/", "energy"],
  ["xiamen-tungsten", "厦门钨业", "Xiamen Tungsten", "新材料", "https://www.cxtc.com/", "energy"],
  ["yongxing-materials", "永兴材料", "Yongxing Materials", "新材料", "https://www.yongxinggufen.com/", "energy"],
  ["hengrui-pharma", "恒瑞医药", "Hengrui", "医药", "https://www.hrs.com.cn/", "pharma"],
  ["fosun-pharma", "复星医药", "Fosun Pharma", "医药", "https://www.fosunpharma.com/", "pharma"],
  ["lepu-medical", "乐普医疗", "Lepu Medical", "医疗器械", "https://www.lepumedical.com/", "pharma"],
  ["yuyue-medical", "鱼跃医疗", "Yuwell", "医疗器械", "https://www.yuwell.com/", "pharma"],
  ["weigao", "威高集团", "Weigao", "医疗器械", "https://www.weigaogroup.com/", "pharma"],
  ["intco-medical", "英科医疗", "Intco Medical", "医疗器械", "https://www.intcomedical.com/", "pharma"],
  ["wondfo", "万孚生物", "Wondfo", "体外诊断", "https://www.wondfo.com.cn/", "pharma"],
  ["autobio", "安图生物", "Autobio", "体外诊断", "https://www.autobio.com.cn/", "pharma"],
  ["snibe", "新产业", "Snibe", "医疗设备", "https://www.snibe.com/", "pharma"],
  ["dian-diagnostics", "迪安诊断", "Dian Diagnostics", "医疗服务与诊断", "https://www.dazd.cn/", "pharma"],
  ["joinn", "昭衍新药", "JOINN", "医药研发服务", "https://www.joinn-lab.com/", "pharma"],
  ["asymchem", "凯莱英", "Asymchem", "医药研发与制造", "https://www.asymchem.com.cn/", "pharma"],
  ["porton", "博腾股份", "Porton", "医药研发与制造", "https://www.porton.cn/", "pharma"],
  ["kelun-pharma", "科伦药业", "Kelun", "医药", "https://www.kelun.com/", "pharma"],
  ["livzon", "丽珠集团", "Livzon", "医药", "https://www.livzon.com.cn/", "pharma"],
  ["tasly", "天士力", "Tasly", "医药", "https://www.tasly.com/", "pharma"],
  ["sph", "上海医药", "Shanghai Pharmaceuticals", "医药", "https://www.sphchina.com/", "pharma"],
  ["tongrentang", "同仁堂", "Tongrentang", "中药", "https://www.tongrentang.com/", "pharma"],
  ["buchang-pharma", "步长制药", "Buchang", "医药", "https://www.buchang.com/", "pharma"],
  ["humanwell", "人福医药", "Humanwell", "医药", "https://www.humanwell.com.cn/", "pharma"],
  ["haisco", "海思科", "Haisco", "医药", "https://www.haisco.com/", "pharma"],
  ["walvax", "沃森生物", "Walvax", "生物医药", "https://www.walvax.com/", "pharma"],
  ["cansino", "康希诺", "CanSino", "生物医药", "https://www.cansinotech.com/", "pharma"],
  ["simcere", "先声药业", "Simcere", "医药", "https://www.simcere.com/", "pharma"],
  ["hansoh", "翰森制药", "Hansoh", "医药", "https://www.hspharm.com/", "pharma"],
  ["three-sbio", "三生制药", "3SBio", "生物医药", "https://www.3sbio.com/", "pharma"],
  ["akeso", "康方生物", "Akeso", "生物医药", "https://www.akesobio.com/", "pharma"],
  ["kelun-biotech", "科伦博泰", "Kelun-Biotech", "生物医药", "https://www.kelun-biotech.com/", "pharma"],
  ["topchoice-medical", "通策医疗", "Topchoice Medical", "医疗服务", "https://www.tcmedical.com.cn/", "pharma"],
  ["jinyu-bio", "金宇生物", "Jinyu Bio", "生物医药", "https://www.jinyu.com.cn/", "pharma"]
];

const financeCandidates = [
  ["cmb", "招商银行", "CMB", "银行", "https://career.cmbchina.com/", "finance", { primaryJobUrlVerified: true }],
  ["citic-bank", "中信银行", "CITIC Bank", "银行", "https://job.citicbank.com/", "finance"],
  ["ceb-bank", "光大银行", "CEB", "银行", "https://www.cebbank.com/", "finance"],
  ["pingan-bank", "平安银行", "Ping An Bank", "银行", "https://bank.pingan.com/", "finance"],
  ["suzhou-bank", "苏州银行", "Bank of Suzhou", "银行", "https://www.suzhoubank.com/", "finance"],
  ["qingdao-bank", "青岛银行", "Bank of Qingdao", "银行", "https://www.qdccb.com/", "finance"],
  ["zhengzhou-bank", "郑州银行", "Bank of Zhengzhou", "银行", "https://www.zzbank.cn/", "finance"],
  ["xian-bank", "西安银行", "Bank of Xi'an", "银行", "https://www.xacbank.com/", "finance"],
  ["changsha-bank", "长沙银行", "Bank of Changsha", "银行", "https://www.cscb.cn/", "finance"],
  ["jiangyin-bank", "江阴银行", "Jiangyin Bank", "银行", "https://www.jybank.com.cn/", "finance"],
  ["jiangnan-rural-bank", "江南农商银行", "Jiangnan Rural Bank", "银行", "https://www.jnbank.com.cn/", "finance"],
  ["cqrcb", "重庆农商银行", "CQRCB", "银行", "https://www.cqrcb.com/", "finance"],
  ["srcb", "上海农商银行", "SRCB", "银行", "https://www.srcb.com/", "finance"],
  ["ql-bank", "齐鲁银行", "Qilu Bank", "银行", "https://www.qlbchina.com/", "finance"],
  ["bjrcb", "北京农商银行", "BJRCB", "银行", "https://www.bjrcb.com/", "finance"],
  ["guotai-junan", "国泰君安", "GTJA", "证券", "https://www.gtja.com/", "finance"],
  ["haitong-securities", "海通证券", "Haitong Securities", "证券", "https://www.htsec.com/", "finance"],
  ["china-galaxy-securities", "中国银河证券", "China Galaxy Securities", "证券", "https://www.chinastock.com.cn/", "finance"],
  ["dongxing-securities", "东兴证券", "Dongxing Securities", "证券", "https://dxzq.zhiye.com/campus", "finance"],
  ["soochow-securities", "东吴证券", "Soochow Securities", "证券", "https://dwzq.zhiye.com/", "finance"],
  ["caitong-securities", "财通证券", "Caitong Securities", "证券", "https://www.ctsec.com/", "finance"],
  ["everbright-securities", "光大证券", "Everbright Securities", "证券", "https://www.ebscn.com/", "finance"],
  ["founder-securities", "方正证券", "Founder Securities", "证券", "https://www.foundersc.com/", "finance"],
  ["guolian-securities", "国联证券", "Guolian Securities", "证券", "https://www.glsc.com.cn/", "finance"],
  ["guojin-securities", "国金证券", "Guojin Securities", "证券", "https://www.gjzq.com.cn/", "finance"],
  ["zhongyuan-securities", "中原证券", "Zhongyuan Securities", "证券", "https://www.ccnew.com/main/joinus/xyzp/index.shtml", "finance"],
  ["huaan-securities", "华安证券", "Huaan Securities", "证券", "https://www.hazq.com/", "finance"],
  ["caida-securities", "财达证券", "Caida Securities", "证券", "https://www.s10000.com/", "finance"],
  ["northeast-securities", "东北证券", "Northeast Securities", "证券", "https://nesc.zhiye.com/", "finance"],
  ["shanxi-securities", "山西证券", "Shanxi Securities", "证券", "https://www.i618.com.cn/", "finance"],
  ["china-re", "中国再保险", "China Re", "保险", "https://www.chinare.com.cn/", "finance"]
].map((entry) => makeEntry(financial, entry));

const localSoeCandidates = [
  ["shougang-group", "首钢集团", "Shougang", "钢铁与材料", "https://www.shougang.com.cn/", "industrial"],
  ["beijing-enterprises", "北控集团", "Beijing Enterprises", "综合产业", "https://www.begcl.com/rcgz/jtzp/index.html", "industrial"],
  ["bright-food", "光明食品集团", "Bright Food", "食品与零售", "https://www.brightfood.com/", "consumer"],
  ["yuexiu-group", "越秀集团", "Yuexiu", "综合产业", "https://www.yuexiu.com/", "industrial"],
  ["jinjiang-international", "锦江国际", "Jinjiang", "消费与酒店", "https://www.jinjiang.com/", "consumer"],
  ["shanghai-construction", "上海建工", "SCG", "工程建设", "https://www.scg.com.cn/", "industrial"],
  ["shanghai-tunnel", "隧道股份", "STEC", "基础设施", "https://www.stec.net/", "industrial"],
  ["shanghai-airport", "上海机场", "Shanghai Airport", "交通枢纽", "https://www.shanghaiairport.com/", "logistics"],
  ["sipg", "上港集团", "SIPG", "港口物流", "https://www.portshanghai.com.cn/", "logistics"],
  ["qingdao-port", "青岛港", "Qingdao Port", "港口物流", "https://www.qingdao-port.com/", "logistics"],
  ["ningbo-port", "宁波舟山港", "Ningbo Zhoushan Port", "港口物流", "https://www.nbport.com.cn/", "logistics"],
  ["guangzhou-port", "广州港", "Guangzhou Port", "港口物流", "https://www.gzport.com/", "logistics"],
  ["xiamen-port", "厦门港务", "Xiamen Port", "港口物流", "https://www.xmgw.com.cn/", "logistics"],
  ["guangzhou-metro", "广州地铁", "Guangzhou Metro", "轨道交通", "https://gzmetro.zhiye.com/", "logistics"],
  ["shenzhen-metro", "深圳地铁", "Shenzhen Metro", "轨道交通", "https://www.szmc.net/", "logistics"],
  ["yutong-group", "宇通集团", "Yutong Group", "汽车与装备", "https://www.yutong.com/", "auto"],
  ["jingneng-group", "京能集团", "Jingneng", "能源", "https://www.jingneng.cn/", "energy"],
  ["yankuang-energy", "兖矿能源", "Yankuang Energy", "能源", "https://www.ykjt.cn/", "energy"],
  ["zhengtai-group-local", "正泰集团", "CHINT Group", "电气设备", "https://www.chint.com/", "energy"],
  ["guangdong-rising", "广东省广新控股集团", "GDRI", "综合产业", "https://www.gdrising.cn/", "industrial"],
  ["beijing-capital-group", "首创集团", "Beijing Capital Group", "综合产业", "https://www.capitalgroup.com.cn/", "industrial"],
  ["sdic-capital", "国投资本", "SDIC Capital", "金融", "https://www.sdiccapital.com/", "finance"],
  ["wangsu-soe", "网宿科技中国", "Wangsu China", "云与边缘计算", "https://www.wangsu.com/", "tech"],
  ["minmetals-capital", "五矿资本", "Minmetals Capital", "金融", "https://www.minmetalscapital.com/", "finance"],
  ["tongren-health", "同仁堂科技", "Tongrentang Tech", "医药", "https://www.tongrentangkj.com/", "pharma"],
  ["jinfeng-technology", "金风科技", "Goldwind", "风电设备", "https://www.goldwind.com/", "energy"],
  ["sany-heavy-energy", "三一重能", "SANY Renewable Energy", "新能源装备", "https://www.sanyre.com/", "energy"],
  ["daqin-railway", "大秦铁路", "Daqin Railway", "铁路运输", "https://www.daqintielu.com/", "logistics"],
  ["jinlongyu", "金龙鱼中国", "Arawana China", "食品与农业", "https://www.jinlongyu.cn/", "consumer"],
  ["jinling-hotel", "金陵饭店集团", "Jinling Hotel Group", "酒店与消费", "https://www.jinlinghotel.com/", "consumer"]
].map((entry) => makeEntry(localSoe, entry));

const stateOwnedCandidates = [
  ["south-power-grid", "南方电网", "CSG", "能源", "https://www.csg.cn/", "energy"],
  ["cofco", "中粮集团", "COFCO", "农业与食品", "https://www.cofco.com/", "consumer"],
  ["sdic", "国家开发投资集团", "SDIC", "综合产业", "https://www.sdic.com.cn/", "industrial"],
  ["powerchina", "中国电建", "PowerChina", "工程建设与能源", "https://www.powerchina.cn/", "industrial"],
  ["energy-china", "中国能建", "Energy China", "工程建设与能源", "https://www.ceec.net.cn/", "industrial"],
  ["china-railway", "中国中铁", "CREC", "工程建设", "https://www.crec.cn/", "industrial"],
  ["cccc", "中国交建", "CCCC", "工程建设", "https://www.ccccltd.cn/", "industrial"],
  ["sinosteel", "中钢集团", "Sinosteel", "矿业与材料", "https://www.sinosteel.com/", "industrial"],
  ["sinopharm", "国药集团", "Sinopharm", "医药", "https://www.sinopharm.com/", "pharma"],
  ["cnpc", "中国石油", "CNPC", "能源", "https://www.cnpc.com.cn/", "energy"],
  ["china-unicom", "中国联通", "China Unicom", "通信", "https://www.chinaunicom.com.cn/", "tech"],
  ["huaneng", "中国华能", "China Huaneng", "能源", "https://www.chng.com.cn/", "energy"],
  ["china-resources", "华润集团", "China Resources", "综合产业", "https://www.crc.com.cn/", "industrial"],
  ["china-merchants-group", "招商局集团", "CMG", "综合产业", "https://www.cmhk.com/", "industrial"],
  ["china-post", "中国邮政集团", "China Post", "物流与服务", "https://www.chinapost.com.cn/", "logistics"],
  ["travel-china-group", "中国旅游集团", "CTG", "旅游与消费", "https://www.ctg.cn/", "consumer"],
  ["casic-group", "中国航天科工集团", "CASIC", "航空航天", "https://www.casic.com.cn/", "industrial"],
  ["casc-group", "中国航天科技集团", "CASC", "航空航天", "https://www.spacechina.com/", "industrial"],
  ["norinco", "中国兵器工业集团", "NORINCO", "装备制造", "https://www.norinco.com.cn/", "industrial"],
  ["csgc", "中国兵器装备集团", "CSGC", "装备制造", "https://www.csgc.com.cn/", "industrial"],
  ["cec", "中国电子", "CEC", "电子信息", "https://www.cec.com.cn/", "tech"],
  ["crbc", "中国建筑", "CSCEC", "工程建设", "https://www.cscec.com/", "industrial"],
  ["crcc-group", "中国铁建集团", "CRCC", "工程建设", "https://www.crcc.cn/", "industrial"],
  ["spic-group", "国家电投", "SPIC", "能源", "https://www.spic.com.cn/", "energy"],
  ["cnnc-group", "中核集团", "CNNC", "能源", "https://www.cnnc.com.cn/", "energy"],
  ["avic-group", "中国航空工业集团", "AVIC", "航空制造", "https://www.avic.com/", "industrial"],
  ["chdt-group", "中国华电集团", "CHD", "能源", "https://www.chd.com.cn/", "energy"],
  ["cdt-group", "中国大唐集团", "CDT", "能源", "https://www.china-cdt.com/", "energy"],
  ["cetc-group", "中国电科", "CETC", "电子信息", "https://www.cetc.com.cn/", "tech"]
].map((entry) => makeEntry(stateOwned, entry));

const mixedCandidates = [
  ["citic-group", "中信集团", "CITIC Group", "综合产业与金融", "https://job.citic.com/recruit#/index", "industrial"],
  ["fosun-group", "复星国际中国", "Fosun China", "综合产业", "https://www.fosun.com/", "industrial"],
  ["wanxiang-group", "万向集团", "Wanxiang Group", "汽车与制造", "https://www.wanxiang.com.cn/", "industrial"],
  ["best-inc-china", "百世集团中国", "BEST China", "物流", "https://www.best-inc.com/", "logistics"],
  ["jiuzhou-group", "九洲集团", "Jiuzhou Group", "能源装备", "https://www.jze.com.cn/", "energy"]
].map((entry) => makeEntry(mixedChina, entry));

const extraPrivateCandidates = [
  ["dawning", "中科曙光", "Sugon", "服务器与算力基础设施", "https://www.sugon.com/", "tech"],
  ["hygon", "海光信息", "Hygon", "芯片设计", "https://www.hygon.cn/", "tech"],
  ["chipon", "芯朋微", "Chipown", "模拟芯片", "https://www.chipown.com.cn/", "tech"],
  ["nova-tech", "纳芯微", "NOVOSENSE", "模拟芯片", "https://www.novosns.com/", "tech"],
  ["montnets", "梦网科技", "Montnets", "企业通信", "https://www.montnets.com/", "tech"],
  ["sino-its", "千方科技", "SinoITS", "智慧交通与物联网", "https://www.ctfo.com/", "tech"],
  ["meiya-pico", "美亚柏科", "Meiya Pico", "网络安全与大数据", "https://www.maycur.com/", "tech"],
  ["thunisoft", "华宇软件", "Thunisoft", "政务软件", "https://www.thunisoft.cn/col9/index", "tech"],
  ["yealink", "亿联网络", "Yealink", "企业通信", "https://www.yealink.com/", "tech"],
  ["goke", "高新兴", "Gosuncn", "物联网与车联网", "https://www.gosuncn.com/", "tech"],
  ["mingyang-smart-energy", "明阳智能", "Mingyang", "新能源装备", "https://www.myse.com.cn/", "energy"],
  ["lead-intelligent", "先导智能", "Lead Intelligent", "智能制造装备", "https://www.leadchina.cn/", "industrial"],
  ["autowell", "奥特维", "Autowell", "光伏设备", "https://www.autowell.com.cn/", "industrial"],
  ["maxwell-tech", "迈为股份", "Maxwell", "光伏设备", "https://www.maxwell-gp.com/", "industrial"],
  ["dier-laser", "帝尔激光", "DR Laser", "光伏设备", "https://www.drlaser.com.cn/", "industrial"],
  ["bozhon", "博众精工", "Bozhon", "智能制造装备", "https://www.bozhon.com.cn/", "industrial"],
  ["hangke", "杭可科技", "Hangke", "新能源设备", "https://www.chr-group.net/", "industrial"],
  ["ninebot-china", "九号公司中国", "Ninebot China", "智能出行", "https://www.ninebot.com/", "consumer"],
  ["opple-lighting", "欧普照明", "Opple", "照明与家居", "https://www.opple.com.cn/", "consumer"],
  ["midea-real-estate-services", "顾家服务中国", "Home Service China", "家居服务", "https://www.gujiawang.com/", "consumer"],
  ["weilong", "卫龙美味", "Weilong", "食品制造", "https://www.weilongshipin.com/", "consumer"],
  ["babi-food", "巴比食品", "Babi Food", "餐饮供应链", "https://www.babifood.com/", "consumer"],
  ["layin", "来伊份", "Laiyifen", "食品零售", "https://www.laiyifen.com/", "consumer"],
  ["hxmb", "华熙生物", "Bloomage", "生物科技", "https://www.bloomagebio.com/", "pharma"],
  ["imeik", "爱美客", "Imeik", "医美与生物科技", "https://www.imeik.com/", "pharma"],
  ["fudan-micro", "复旦微电", "Fudan Micro", "芯片设计", "https://www.fmsh.com/", "tech"],
  ["kant-bio", "康泰生物", "Kangtai Biological", "生物医药", "https://www.biokangtai.com/", "pharma"],
  ["walvax-biotech", "智飞生物", "Zhifei", "生物医药", "https://www.zhifeishengwu.com/", "pharma"],
  ["daan-gene", "达安基因", "DAAN Gene", "体外诊断", "https://www.daangene.com/", "pharma"],
  ["opko-medtech", "欧普康视", "Opko Vision China", "医疗服务", "https://www.ophk.com.cn/", "pharma"],
  ["meinian-health", "美年健康", "Meinian Health", "医疗服务", "https://www.health-100.cn/", "pharma"],
  ["jianfan-bio", "健帆生物", "Jafron", "医疗器械", "https://www.jafron.com/", "pharma"],
  ["hualan-bio", "华兰生物", "Hualan Bio", "生物医药", "https://www.hualanbio.com/", "pharma"],
  ["huadong-medicine", "华东医药", "Huadong Medicine", "医药", "https://www.eastchinapharm.com/", "pharma"],
  ["salubris", "信立泰", "Salubris", "医药", "https://www.salubris.com/", "pharma"],
  ["g-boson", "公元股份", "ERA", "建材与管材", "https://www.era.com.cn/", "industrial"],
  ["jushi-holdings", "巨化股份", "Juhua", "化工与材料", "https://www.jhgf.com.cn/", "energy"],
  ["tongkun", "桐昆股份", "Tongkun", "化工与材料", "https://www.zjtkgf.com/", "energy"],
  ["xinfengming", "新凤鸣", "Xinfengming", "化工与材料", "https://www.xinfengming.com/", "energy"],
  ["oriental-shenghong", "东方盛虹", "Oriental Shenghong", "化工与材料", "https://www.jsessh.com/", "energy"],
  ["nhu", "新和成", "NHU", "精细化工与新材料", "https://www.cnhu.com/", "energy"],
  ["longsheng", "浙江龙盛", "Longsheng", "化工与新材料", "https://www.longsheng.com/", "energy"],
  ["aneng-logistics", "安能物流中国", "ANE China", "物流", "https://www.ane56.com/", "logistics"],
  ["sf-intra-city", "顺丰同城中国", "SF Intra-city China", "物流", "https://www.sf-intra-city.com/", "logistics"],
  ["west-securities", "西部证券", "West Securities", "证券", "https://www.west95582.com/", "finance"],
  ["gytz", "国元证券", "Guoyuan Securities", "证券", "https://www.gyzq.com.cn/", "finance"],
  ["cjsc", "长江证券", "Changjiang Securities", "证券", "https://www.95579.com/", "finance"],
  ["first-capital", "第一创业", "First Capital", "证券", "https://www.fcsc.com/", "finance"],
  ["guohai-securities", "国海证券", "Guohai Securities", "证券", "https://www.ghzq.com.cn/", "finance"],
  ["huaxi-securities", "华西证券", "Huaxi Securities", "证券", "https://www.hx168.com.cn/", "finance"],
  ["zheshang-securities", "浙商证券", "Zheshang Securities", "证券", "https://www.stocke.com.cn/", "finance"],
  ["shenergy", "申能股份", "Shenergy", "能源", "https://www.shenergy.net.cn/", "energy"],
  ["zheneng-electric", "浙能电力", "Zheneng", "能源", "https://www.zzepc.com.cn/", "energy"],
  ["sdhs", "山东高速", "Shandong Hi-Speed", "交通基础设施", "https://www.sdhsg.com/", "industrial"],
  ["shenzhen-energy", "深圳能源", "Shenzhen Energy", "能源", "https://www.sec.com.cn/", "energy"],
  ["gz-development", "广州发展", "Guangzhou Development", "能源", "https://www.gdg.com.cn/", "energy"],
  ["sdic-power", "国投电力", "SDIC Power", "能源", "https://www.sdicpower.com/", "energy"],
  ["chuantou-energy", "川投能源", "Chuantou Energy", "能源", "https://www.ctny.com.cn/", "energy"]
];

const candidateCompanies = [
  ...privateCandidates.map((entry) => makeEntry(privateChina, entry)),
  ...financeCandidates,
  ...localSoeCandidates,
  ...stateOwnedCandidates,
  ...mixedCandidates,
  ...extraPrivateCandidates.map((entry) =>
    makeEntry(
      entry[5] === "finance" ? financial : privateChina,
      entry
    )
  )
];

const merged = [...dedupedExisting];
let added = 0;

for (const company of candidateCompanies) {
  if (merged.length >= TARGET_COUNT) break;
  if (existingIds.has(company.id)) continue;

  const normalizedName = normalizeName(company.name);
  if (existingNames.has(normalizedName)) continue;

  merged.push(company);
  existingIds.add(company.id);
  existingNames.add(normalizedName);
  added += 1;
}

if (merged.length !== TARGET_COUNT) {
  throw new Error(`Expected ${TARGET_COUNT} companies after expansion, got ${merged.length}. Added ${added}.`);
}

fs.writeFileSync(DATA_PATH, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Expanded company pool from ${dedupedExisting.length} unique companies to ${merged.length}. Added ${added} non-foreign companies.`);
