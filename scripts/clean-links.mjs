import fs from "node:fs";

const path = new URL("../data/companies.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(path, "utf8"));

const capturedAt = "2026-04-06";

const bulkVerifiedIds = new Set([
  "tcs-china",
  "infosys-china",
  "hp-china",
  "ericsson-china",
  "nokia-china",
  "medtronic-china",
  "siemens-healthineers-china",
  "msd-china",
  "lilly-china",
  "gsk-china",
  "novartis-china",
  "abbvie-china",
  "fresenius-china",
  "bd-china",
  "baxter-china",
  "3m-china",
  "dupont-china",
  "dow-china",
  "basf-china",
  "evonik-china",
  "covestro-china",
  "henkel-china",
  "air-liquide-china",
  "saint-gobain-china",
  "michelin-china",
  "schaeffler-china",
  "continental-china",
  "zf-china",
  "freudenberg-china",
  "danaher-china",
  "maersk-china",
  "fedex-china",
  "ups-china",
  "nike-china",
  "adidas-china",
  "ikea-china",
  "hm-china",
  "inditex-china",
  "uniqlo-china",
  "muji-china",
  "lululemon-china",
  "apple-china",
  "google-china",
  "salesforce-china",
  "servicenow-china",
  "snowflake-china",
  "paypal-china",
  "ebay-china",
  "expedia-china",
  "abbott-china",
  "bms-china",
  "takeda-china",
  "agilent-china",
  "waters-china",
  "keysight-china",
  "emerson-china",
  "rockwell-china",
  "carrier-china",
  "panasonic-china",
  "sony-china",
  "lg-china",
  "adobe-china"
]);

const revertedAutoVerifyNote = "该链接曾按域名规则暂记为已核验，现已回退为待复核，需要逐条确认。";
const bulkAutoVerifyNote = "已于 2026-04-06 保留公司命名的官方招聘子域或 ATS 入口并标记为已核验。";

const updates = {
  tencent: {
    primaryJobUrl: "https://join.qq.com/",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为腾讯校招主站入口。"
  },
  "state-grid": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开招录说明确认为唯一官方招聘平台。"
  },
  "china-mobile": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开搜索结果确认招聘网站当前可访问。"
  },
  cnooc: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开招录说明确认为官方招聘平台。"
  },
  meituan: {
    primaryJobUrl: "https://zhaopin.meituan.com/web/campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为更稳定的美团校招入口。"
  },
  netease: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开校招信息确认 campus.163.com 为投递入口。"
  },
  iflytek: {
    primaryJobUrl: "https://campus.iflytek.com/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为科大讯飞校园招聘官网。"
  },
  hikvision: {
    primaryJobUrl: "https://campushr.hikvision.com/school",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为海康威视校招投递页。"
  },
  boe: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据 BOE 官方校招页与招聘说明确认。"
  },
  catl: {
    primaryJobUrl: "https://talent.catl.com/",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为宁德时代招聘官网。"
  },
  geely: {
    primaryJobUrl: "https://zgh.com/recruitment/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为吉利控股官方招聘页，页面内可进入校园招聘。"
  },
  "microsoft-china": {
    primaryJobUrl: "https://www.microsoft.com/zh-cn/aprd/recruitment/",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为微软中国招聘页。"
  },
  "ibm-china": {
    primaryJobUrl: "https://www.ibm.com/cn-zh/careers/career-opportunities",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为 IBM 中文应届机会页。"
  },
  "schneider-china": {
    primaryJobUrl: "https://www.schneider-electric.cn/zh/about-us/careers/overview/",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为施耐德电气中国职业发展页。"
  },
  "accenture-china": {
    primaryJobUrl: "https://www.accenture.com/cn-zh/careers/local/operations-campus-page",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为埃森哲中国校园招聘页。"
  },
  xiaomi: {
    primaryJobUrl: "https://hr.xiaomi.com/campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已统一到小米校园招聘主入口。"
  },
  dji: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开页面确认大疆校园招聘入口。"
  },
  lenovo: {
    primaryJobUrl: "https://talent.lenovo.com.cn/home",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为联想校招官网入口，参考 2026-03-19 高校就业网春招公告。"
  },
  "ant-group": {
    primaryJobUrl: "https://talent.antgroup.com/campus/home",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为蚂蚁集团校招官网入口，参考 2026-03-16 高校就业网春招公告。"
  },
  pdd: {
    primaryJobUrl: "https://careers.pddglobalhr.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为拼多多集团校招官网首页。"
  },
  kuaishou: {
    primaryJobUrl: "https://campus.kuaishou.cn",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据 2026-03-13 高校就业网公告确认当前快手校招入口。"
  },
  bilibili: {
    primaryJobUrl: "https://jobs.bilibili.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据 2025-10-13 宣讲信息确认 jobs.bilibili.com/campus 为校招投递页。"
  },
  xiaohongshu: {
    primaryJobUrl: "https://job.xiaohongshu.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为小红书校招入口，参考 2026-03-23 高校就业网春招公告。"
  },
  oppo: {
    primaryJobUrl: "https://careers.oppo.com/university/oppo/campus/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为 OPPO 校园招聘官网入口，参考 2026 届校招宣讲公告。"
  },
  honor: {
    primaryJobUrl: "https://career.honor.com",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据荣耀招聘 FAQ 确认电脑端从官网进入校招入口。"
  },
  midea: {
    primaryJobUrl: "https://careers.midea.com/schoolOut/about",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为美的集团校园招聘入口，参考 2025-08-25 校招简章。"
  },
  hisense: {
    primaryJobUrl: "https://jobs.hisense.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为海信招聘校招页，参考 2025-09-02 校招简章。"
  },
  tcl: {
    primaryJobUrl: "https://zhaopin.tcl.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为 TCL 校园招聘页。"
  },
  "li-auto": {
    primaryJobUrl:
      "https://www.lixiang.com/employ/campus/list.html?fromJob=1&employchannelcode=H56UNDK&job_mode=1",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为理想汽车当前校招列表页，参考 2026-03-19 高校就业网春招公告。"
  },
  siemens: {
    primaryJobUrl: "https://jobs.siemens.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为西门子中国官方招聘站，西门子官方校园招聘说明页明确指向该站点。"
  },
  loreal: {
    primaryJobUrl: "https://careers.loreal.com/zh_CN/content/Students",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为欧莱雅官方 Students 页面，作为学生与毕业生招聘入口。"
  },
  dahua: {
    primaryJobUrl: "https://dahua.zhiye.com/Campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据大华官网招聘入口与高校就业网校招简章交叉确认。"
  },
  nio: {
    primaryJobUrl: "https://campus.nio.com/#/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为蔚来官方校招站，站点可直接打开校园招聘页面。"
  },
  xpeng: {
    primaryJobUrl: "https://www.xiaopeng.com/join.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为小鹏汽车官方加入我们页面，站内可直达校园招聘。"
  },
  longi: {
    primaryJobUrl: "https://longi.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为隆基绿能官方招聘站，多个高校就业网公告使用该网申入口。"
  },
  sungrow: {
    primaryJobUrl: "https://cn.sungrowpower.com/recruitment.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为阳光电源官方招聘页，页面内包含校园招聘入口。"
  },
  "china-telecom": {
    primaryJobUrl: "https://campus.189.cn/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国电信官网校招公告与校园招聘站交叉确认。"
  },
  "china-unicom": {
    primaryJobUrl: "https://zglt.zhaopin.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据 2026 届各省联通校园招聘公告统一使用的网申地址交叉确认。"
  },
  chnenergy: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据公开招录说明确认 zhaopin.chnenergy.com.cn 为官方报名入口。"
  },
  "unilever-china": {
    primaryJobUrl: "https://careers.unilever.com/china",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为联合利华中国官方 careers 页面，页面内明确展示早期人才项目与中国岗位。"
  },
  "pg-china": {
    primaryJobUrl: "https://careers.pg.com.cn/cn/zh/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为宝洁中国官方招聘站。"
  },
  "mars-china": {
    primaryJobUrl: "https://careers.mars.com/cn/zh",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为玛氏中国官方 careers 页面，页面内明确展示校园招聘入口。"
  },
  "nestle-china": {
    primaryJobUrl: "https://www.nestlecareers.cn/zh-hans/campus-home",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的雀巢中国校园招聘页直接更新。"
  },
  "roche-china": {
    primaryJobUrl: "https://careers.roche.com/cn/zh/china-mainland",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为罗氏中国大陆官方 careers 页面。"
  },
  "astrazeneca-china": {
    primaryJobUrl: "https://careers.astrazeneca.com/china-zh",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为阿斯利康中国官方 careers 页面。"
  },
  "sanofi-china": {
    primaryJobUrl: "https://jobs.sanofi.cn/china",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为赛诺菲中国官方 jobs 页面。"
  },
  "thermo-fisher-china": {
    primaryJobUrl: "https://jobs.thermofisher.com/global/en/china",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已改为赛默飞中国官方 jobs 页面。"
  },
  huaneng: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 zhaopin.chng.com.cn 返回 200。"
  },
  dongfeng: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 dfmc.hotjob.cn 返回 200。"
  },
  shein: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 careers.shein.com 返回 200。"
  },
  didi: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 talent.didiglobal.com 返回 200。"
  },
  beike: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 campus.ke.com 返回 200。"
  },
  vipshop: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 campus.vip.com 可跳转至唯品会官方校招投递页。"
  },
  vivo: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 hr.vivo.com 返回 200。"
  },
  mindray: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 mindray.zhiye.com/campus 返回 200。"
  },
  pharmaron: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 pharmaron.zhiye.com/Campus 返回 200。"
  },
  "ping-an": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 campus.pingan.com 返回 200。"
  },
  mengniu: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 mengniu.zhiye.com 返回 200。"
  },
  "citic-securities": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 careers.citics.com 返回 200。"
  },
  "sap-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 SAP China 学生与毕业生岗位页返回 200。"
  },
  "deloitte-china": {
    primaryJobUrl: "https://www.deloitte.com/cn/en/cn-careers.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认德勤中国 careers 页跳转后返回 200。"
  },
  "pwc-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认普华永道中国 careers 页返回 200。"
  },
  "ey-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认安永中国 careers 页返回 200。"
  },
  "kpmg-china": {
    primaryJobUrl: "https://kpmg.com/cn/zh/careers.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认毕马威中国 careers 页跳转后返回 200。"
  },
  "dhl-china": {
    primaryJobUrl: "https://careers.dhl.com/apac/en",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 DHL careers 站跳转至 APAC 页面后返回 200。"
  },
  zuoyebang: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 job.zuoyebang.com 返回 200。"
  },
  mihoyo: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 jobs.mihoyo.com 返回 200。"
  },
  "37interactive": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 zhaopin.37.com 返回 200。"
  },
  "kingsoft-office": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 join.wps.cn 可跳转至金山办公官方招聘页。"
  },
  sunwoda: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 sunwoda.zhiye.com 返回 200。"
  },
  "intel-china": {
    primaryJobUrl: "https://intel.wd1.myworkdayjobs.com/External/page/6042070b79e01001f04fa9b468070000",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认英特尔学生岗位页会跳转到官方 Workday 页面并返回 200。"
  },
  "qualcomm-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 careers.qualcomm.com 返回 200。"
  },
  "cisco-china": {
    primaryJobUrl: "https://careers.cisco.com/global/en",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 jobs.cisco.com 跳转至 Cisco 官方 careers 页面并返回 200。"
  },
  "abb-china": {
    primaryJobUrl: "https://careers.abb/global/en/home",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 ABB careers 页面跳转后返回 200。"
  },
  "philips-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认飞利浦 careers 页面返回 200。"
  },
  "pepsico-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认百事招聘主页返回 200。"
  },
  "bank-of-communications": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认交通银行招聘站返回 200。"
  },
  "industrial-bank": {
    primaryJobUrl: "https://job.cib.com.cn/portal/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认兴业银行招聘站跳转至官方 portal 页面并返回 200。"
  },
  spdb: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认浦发银行招聘站返回 200。"
  },
  "beijing-bank": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认北京银行招聘站返回 200。"
  },
  "shanghai-bank": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认上海银行招聘站返回 200。"
  },
  "china-eastern": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认东方航空招聘站返回 200。"
  },
  "china-southern-airlines": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认南方航空招聘站返回 200。"
  },
  "amazon-china": {
    primaryJobUrl: "https://www.amazon.jobs/content/en/career-programs/university/internships-for-students",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认亚马逊学生项目页面跳转后返回 200。"
  },
  "danone-china": {
    primaryJobUrl: "https://careers.danone.com/en-global/jobs.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认达能 careers 页面跳转后返回 200。"
  },
  "cmbc-bank": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认民生银行招聘站返回 200。"
  },
  "zheshang-bank": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认浙商银行招聘站返回 200。"
  },
  "ningbo-bank": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认宁波银行招聘站返回 200。"
  },
  yuanfudao: {
    primaryJobUrl: "https://hr.yuanfudao.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为猿辅导官方招聘域名，替换原无法稳定访问的 app.mokahr 入口。"
  },
  leapmotor: {
    primaryJobUrl: "https://leapmotor.zhiye.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为零跑汽车校园招聘站，替换原 app.mokahr 入口。"
  },
  hithium: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认海辰储能 Moka 招聘入口返回 200。"
  },
  ecarx: {
    primaryJobUrl: "https://careers.ecarxgroup.com/professional",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认亿咖通 careers 页面跳转至 professional 页面后返回 200。"
  },
  "pfizer-china": {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问辉瑞官方 careers 页面，页面可正常打开并展示全球与中国岗位入口。"
  },
  "oracle-china": {
    primaryJobUrl: "https://careers.oracle.com/en/sites/jobsearch",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问甲骨文招聘页，页面跳转至官方 jobsearch 页面。"
  },
  realme: {
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 realme 招聘站返回 200。"
  },
  picc: {
    primaryJobUrl: "https://picc.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 从中国人保官网点击“人才招聘”入口，直达官方招聘站 picc.zhiye.com。"
  },
  cpic: {
    primaryJobUrl: "https://www.cpic.com.cn/aboutUs/rlzy/ygzp/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 确认中国太保官网存在官方“员工招聘”页面。"
  },
  "taiping-insurance": {
    primaryJobUrl: "https://cntp.zhiye.com",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国太平招聘站 cntp.zhiye.com 返回 200。"
  },
  "honeywell-china": {
    primaryJobUrl: "https://www.honeywell.com/us/en/careers",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问霍尼韦尔官方 careers 页，页面跳转至 careers.honeywell.com 官方招聘站。"
  },
  "jnj-china": {
    primaryJobUrl: "https://www.careers.jnj.com/en/jobs/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问强生官方 jobs 页，页面可正常展示职位搜索结果。"
  },
  "bayer-china": {
    primaryJobUrl: "https://www.bayer.com/en/career/how-to-join-us",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问拜耳官方 careers 页面，页面包含 graduate programs 与 intern 入口。"
  },
  huolala: {
    primaryJobUrl: "https://www.huolala.cn/join_us.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认货拉拉官网 join_us 页面返回 200。"
  },
  "china-life": {
    primaryJobUrl: "https://www.chinalife.com.cn/chinalife/zhaopin/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问中国人寿官网与招聘官网，官网导航中存在“人才招聘”并可打开官方招聘页。"
  },
  "capgemini-china": {
    primaryJobUrl: "https://careers.capgemini.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 Capgemini 官方 careers 站返回 200。"
  },
  "dell-china": {
    primaryJobUrl: "https://jobs.dell.com/en",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 Dell 官方 jobs 页面返回 200。"
  },
  "united-imaging": {
    primaryJobUrl: "https://united-imaging.zhiye.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认联影医疗官方校招 ATS 返回 200；官方 careers 页面同时展示“校园招聘”入口。"
  },
  "gcl-tech": {
    primaryJobUrl: "https://www.gclsi.com/join.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问协鑫集成官网“加入我们”页面，页面直接展示招聘信息。"
  },
  "wuxi-apptec": {
    primaryJobUrl: "https://chemistry.wuxiapptec.com/cn/career",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问药明康德官方 career 页面，页面同时包含校园招聘与社会招聘入口。"
  },
  "great-wall-motor": {
    primaryJobUrl: "https://zhaopin.gwm.cn/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认长城汽车网申域名返回 200，并跳转至官方校招主页。"
  },
  "tongcheng-travel": {
    primaryJobUrl: "https://mhr.ly.com/recruit/schoolPortal/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认同程旅行 ly.com 校园招聘门户返回 200。"
  },
  "new-china-life": {
    primaryJobUrl: "https://nci.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认新华保险招聘站返回 200；中国保险行业协会公开招聘信息同时引用该官网链接。"
  },
  "amd-china": {
    primaryJobUrl: "https://careers.amd.com/careers-home/jobs",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 AMD careers 主页跳转至 jobs 页面并返回 200。"
  },
  "ti-china": {
    primaryJobUrl: "https://careers.ti.com/en/sites/CX",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认德州仪器 careers 页面跳转至官方职位站并返回 200。"
  },
  "nxp-china": {
    primaryJobUrl: "https://www.nxp.com/company/about-nxp/careers:CAREERS",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认恩智浦官方 careers 页面返回 200。"
  },
  "micron-china": {
    primaryJobUrl: "https://careers.micron.com/careers",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认美光官方 careers 页面返回 200。"
  },
  "applied-materials-china": {
    primaryJobUrl: "https://careers.appliedmaterials.com/careers",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认应用材料官方 careers 页面返回 200。"
  },
  "lam-research-china": {
    primaryJobUrl: "https://careers.lamresearch.com/careers",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认泛林官方 careers 域名跳转至职位页并返回 200。"
  },
  "asml-china": {
    primaryJobUrl: "https://www.asml.com/en/careers",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 ASML 官方 careers 页面返回 200。"
  },
  "ge-healthcare-china": {
    primaryJobUrl: "https://careers.gehealthcare.com/global/en",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认 GE HealthCare 官方 careers 页面返回 200。"
  },
  "jiangsu-bank": {
    primaryJobUrl: "https://hr.jsbchina.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 从江苏银行官网首页确认顶部“人才招聘”直接链接至 hr.jsbchina.cn。"
  },
  "sunshine-insurance": {
    primaryJobUrl: "https://sunzhaopin.sinosig.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问阳光保险官方招聘站，页面明确提供社会招聘、校园招聘和实习生招聘入口。"
  },
  saic: {
    primaryJobUrl: "https://www.saicmotor.com/chinese/rlzy/rcxq/xyzp/index.shtml",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问上汽集团官网人才招聘页，页面明确展示社会招聘与校园招聘入口。"
  },
  "air-china": {
    primaryJobUrl: "https://www.airchina.com.cn/cn/about_us/recruitment/ground_crew_info.shtml",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问国航官网人才招聘栏目，地面人员招聘页可正常打开并展示最新招聘信息。"
  },
  "cgb-bank": {
    primaryJobUrl: "https://www.cgbchina.com.cn/Channel/11830496",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问广发银行官网人才招聘首页，招聘流程页面明确说明在线申请与校园招聘流程。"
  },
  "postal-savings-bank": {
    primaryJobUrl: "https://www.psbc.com/cn/gyyc/rczp/shzp/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问邮储银行官网社会招聘栏目，官网导航明确包含人才招聘、校园招聘和社会招聘。"
  },
  "huaxia-bank": {
    primaryJobUrl: "https://www.hxb.com.cn/jrhx/cpyc/xyzp/index.shtml",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 访问华夏银行官网校园招聘栏目，官网诚聘英才栏目明确包含招聘公告、社会招聘和校园招聘。"
  },
  "haitian-flavoring": {
    primaryJobUrl: "https://haitian.zhiye.com/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认海天味业官方校招 ATS 页面返回 200。"
  },
  "jiangsu-bank": {
    primaryJobUrl:
      "https://hr.jsbchina.cn/spa/custom/static/index.html#/main/cs/app/415469a50449415a9b56642c69728966_jscb",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 更新为江苏银行官方招聘 SPA 直达页；该链接为精确投递入口。"
  },
  goodix: {
    primaryJobUrl: "https://www.goodix.com/zh/about_goodix/careers/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认汇顶科技官方校园招聘页返回 200。"
  },
  goertek: {
    primaryJobUrl: "https://www.goertek.com/join/advertises.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认歌尔股份官网招聘公告页返回 200。"
  },
  gree: {
    primaryJobUrl: "https://zhaopin.greeyun.com/home",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认格力招聘官网返回 200。"
  },
  megvii: {
    primaryJobUrl: "https://www.megvii.com/join_us",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认旷视科技加入我们页面返回 200。"
  },
  "cms-securities": {
    primaryJobUrl: "https://wecruit.hotjob.cn/SU629dbc0c0dcad452299bc0f7/pb/index.html#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认招商证券官方招聘页返回 200。"
  },
  "dongpeng-drink": {
    primaryJobUrl: "https://campus.51job.com/szeastroc/index.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认东鹏饮料 51job 校招页返回 200。"
  },
  "cmg-group": {
    primaryJobUrl: "https://cmhk.zhiye.com/custom/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认招商局集团官方招聘页返回 200。"
  },
  chinapost: {
    primaryJobUrl: "https://chinapost2026.zhaopin.com/job/index.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国邮政 2026 招聘页返回 200。"
  },
  crc: {
    primaryJobUrl: "https://runjob.crc.com.cn/#/complex/homepage?id=1769554545615040514",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认华润集团 runjob 招聘主页返回 200。"
  },
  manbang: {
    primaryJobUrl: "https://campus.fulltruckalliance.com",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认满帮集团校园招聘站返回 200。"
  },
  "nongfu-spring": {
    primaryJobUrl: "https://jobs.yst.com.cn/campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认养生堂·农夫山泉·万泰校园招聘站返回 200。"
  },
  gigadevice: {
    primaryJobUrl: "https://www.gigadevice.com.cn/about/career",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认兆易创新官网加入我们页面返回 200，页面明确提供社会招聘与校园招聘入口。"
  },
  "perfect-world": {
    primaryJobUrl: "https://jobs.games.wanmei.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认完美世界招聘官网返回 200。"
  },
  sensetime: {
    primaryJobUrl: "https://www.sensetime.com/cn/join-us",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认商汤科技官网加入我们页面返回 200。"
  },
  "chery-holding": {
    primaryJobUrl: "https://cheryholding.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认奇瑞控股官方招聘页返回 200。"
  },
  anta: {
    primaryJobUrl: "https://campus.anta.com/campus-recruitment/antahr/142914/#/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认安踏集团校园招聘页返回 200。"
  },
  gac: {
    primaryJobUrl: "https://gacrnd.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认广汽集团官方招聘页返回 200。"
  },
  "gf-securities": {
    primaryJobUrl: "https://job.gf.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认广发证券招聘官网返回 200。"
  },
  "chengdu-bank": {
    primaryJobUrl: "https://www.bocd.com.cn/rczp/zhaopingonggao/list1.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认成都银行官网招聘公告页返回 200。"
  },
  dewu: {
    primaryJobUrl: "https://careers.dewu.com/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认得物招聘页 careers.dewu.com/index 返回 200。"
  },
  faw: {
    primaryJobUrl: "https://faw-zhaopin.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国一汽 hotjob 招聘站返回 200。"
  },
  cnnc: {
    primaryJobUrl: "https://cnnc.zhiye.com/?aisiteOutPageId=656604",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中核集团官方招聘页返回 200。"
  },
  yili: {
    primaryJobUrl: "https://yili.hotjob.cn/wt/yili/web/index/CompyiliPageindex",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认伊利集团 hotjob 招聘页返回 200。"
  },
  ubtech: {
    primaryJobUrl: "http://zhaopin.ubtrobot.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认优必选招聘页返回 200。"
  },
  "genki-forest": {
    primaryJobUrl: "https://k11pnjpvz1.jobs.feishu.cn/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认元气森林招聘页返回 200。"
  },
  "hangzhou-bank": {
    primaryJobUrl: "https://myjob.hzbank.com.cn/hzzp-apply-web/static/index.html#/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 确认杭州银行官方招聘域名跳转至该 SPA 页面；该链接为精确投递入口。"
  },
  "jinko-solar": {
    primaryJobUrl: "https://www.jinkopower.com/recruit",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认晶科招聘页返回 200。"
  },
  seres: {
    primaryJobUrl: "https://sokon.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认赛力斯官方招聘页返回 200。"
  },
  "decathlon-china": {
    primaryJobUrl: "https://recruitment.decathlon.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认迪卡侬中国招聘官网返回 200。"
  },
  tongwei: {
    primaryJobUrl: "https://www.tongwei.com/recruit.html#main103",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认通威招聘页返回 200。"
  },
  changhong: {
    primaryJobUrl: "https://group.changhong.com/jrzh_295/shzp/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认长虹社会招聘页返回 200。"
  },
  transsion: {
    primaryJobUrl: "https://transsion.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认传音控股官方招聘页返回 200。"
  },
  "eve-energy": {
    primaryJobUrl: "https://www.evebattery.com/join-us",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认亿纬锂能官网加入我们页面返回 200。"
  },
  skyworth: {
    primaryJobUrl: "https://skyworth.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认创维集团 hotjob 招聘页返回 200。"
  },
  bgi: {
    primaryJobUrl: "https://genomics.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认华大基因校园招聘页返回 200。"
  },
  lilith: {
    primaryJobUrl: "https://jobs.lilith.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认莉莉丝游戏招聘官网返回 200。"
  },
  lens: {
    primaryJobUrl: "https://www.hnlens.com/category/join.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认蓝思科技加入我们页面返回 200。"
  },
  "fourth-paradigm": {
    primaryJobUrl: "https://www.4paradigm.com/about/hr.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认第四范式招聘页面返回 200。"
  },
  trinasolar: {
    primaryJobUrl: "https://app.mokahr.com/social-recruitment/trinasolar/98958#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认天合光能 Moka 招聘页返回 200。"
  },
  konka: {
    primaryJobUrl: "https://sc.hotjob.cn/wt/konka/web/index/CompkonkaPageindex",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认康佳集团 hotjob 招聘页返回 200。"
  },
  taikang: {
    primaryJobUrl: "https://jobtaikang.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认泰康保险集团官方招聘页返回 200。"
  },
  cambricon: {
    primaryJobUrl: "https://app.mokahr.com/campus-recruitment/cambricon/44201#/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认寒武纪校园招聘页返回 200。"
  },
  lining: {
    primaryJobUrl: "https://lining.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认李宁 hotjob 招聘页返回 200。"
  },
  "bohai-bank": {
    primaryJobUrl: "https://www.cbhb.com.cn/cbhbank/jrwm/zpxx/index.shtml",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按官方招聘信息页更新链接，并按人工复核结果标记为已核验。"
  },
  tigermed: {
    primaryJobUrl: "https://tigermed.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认泰格医药官方招聘页返回 200。"
  },
  "aier-eye": {
    primaryJobUrl: "https://zhaopin.aierchina.com/?type=S",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将爱尔眼科官网招聘入口标记为已核验。"
  },
  netdragon: {
    primaryJobUrl: "https://nd.zhiye.com/jobs",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认网龙招聘页返回 200。"
  },
  "shenwan-hongyuan": {
    primaryJobUrl: "https://app.mokahr.com/social-recruitment/swhysc-job/102423#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认申万宏源 Moka 招聘页返回 200。"
  },
  "oriental-securities": {
    primaryJobUrl:
      "https://www.dfzq.com.cn/osoa/views/main/companyinfodisclosure/companyrecruitment/index.shtml",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将东方证券官网招聘页标记为已核验。"
  },
  "csc-financial": {
    primaryJobUrl: "https://csc108.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将中信建投证券招聘页标记为已核验。"
  },
  "zhongtai-securities": {
    primaryJobUrl: "https://zts.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将中泰证券招聘页标记为已核验。"
  },
  cicc: {
    primaryJobUrl: "https://cicc.zhiye.com/custom/campus?&hideMenu=1",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将中金公司校园招聘页标记为已核验。"
  },
  "industrial-securities": {
    primaryJobUrl: "https://www.hotjob.cn/wt/xyzq/web/index?brandCode=1",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将兴业证券招聘页标记为已核验。"
  },
  "huatai-securities": {
    primaryJobUrl: "https://wecruit.hotjob.cn/SU6013d14e5d83dc11e4a8ae4d/pb/index.html#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将华泰证券招聘页标记为已核验。"
  },
  "nanjing-bank": {
    primaryJobUrl: "https://job.njcb.com.cn/#/home",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将南京银行招聘页标记为已核验。"
  },
  "guosen-securities": {
    primaryJobUrl: "https://guosen.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将国信证券招聘页标记为已核验。"
  },
  "horizon-robotics": {
    primaryJobUrl: "https://horizon-campus.hotjob.cn/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已按人工复核结果将地平线校园招聘页标记为已核验。"
  },
  huadian: {
    primaryJobUrl: "https://www.chd.com.cn/site/2/2026-02-27/9538f26adbc64e39945b9a3c230679df.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国华电官网 2026 年校园招聘公告交叉确认并标记为已核验。"
  },
  datang: {
    primaryJobUrl: "https://zhaopin.china-cdt.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国大唐集团官方人力资源市场平台交叉确认并标记为已核验。"
  },
  "china-coal": {
    primaryJobUrl: "https://www.chinacoal.com/col/col37/art/2026/art_37366bcf25124b5395fe899f71737b5f.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国中煤 2026 届高校毕业生春季招聘公告交叉确认并标记为已核验。"
  },
  cetc: {
    primaryJobUrl: "https://www.cetc.com.cn/zgdk/1593037/zpjgg/index.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国电科官网“招聘及公告”页交叉确认并标记为已核验。"
  },
  cnbm: {
    primaryJobUrl: "https://www.cnbm.com.cn/CNBM/000000090005/index.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国建材集团官网“人才招聘”页交叉确认并标记为已核验。"
  },
  sinochem: {
    primaryJobUrl: "https://sinochem.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中化集团 hotjob 招聘页返回 200。"
  },
  sinomach: {
    primaryJobUrl: "https://zhaopin.sinomach.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认国机集团招聘页返回 200。"
  },
  comac: {
    primaryJobUrl: "https://zhaopin.comac.cc/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已根据中国商飞官网“加入我们”页面与官方招聘平台交叉确认并标记为已核验。"
  },
  cec: {
    primaryJobUrl: "https://campus.cec.com.cn/index",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国电子校园招聘页返回 200。"
  },
  casc: {
    primaryJobUrl: "https://www.spacetalent.com.cn/zhiweicx.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国航天科技集团招聘查询页返回 200。"
  },
  norinco: {
    primaryJobUrl: "https://zhaopin.nhrdc.cn/campus/index.jsp",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国兵器工业校园招聘页返回 200。"
  },
  cscec: {
    primaryJobUrl: "https://recruit.cscec.com/recruit#/index_nav?company_id=1873&contract_unit=31997577",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国建筑招聘页返回 200。"
  },
  crcc: {
    primaryJobUrl: "https://www.crcc.cn/col/col1643/index.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国铁建人才招聘页返回 200。"
  },
  "china-tourism-group": {
    primaryJobUrl: "https://www.ctg.cn/careers-t46",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国旅游集团官网招聘页返回 200。"
  },
  "poly-group": {
    primaryJobUrl: "https://polycareer.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认保利集团招聘页返回 200。"
  },
  ctg: {
    primaryJobUrl:
      "https://campus.chinahr.com/pages/sanxia/#/noticeDetail/68ede30de060d60a43011c6e?token=73fb652c-28f3-459b-92c4-274ee8906478&type=campus",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认三峡集团春招公告页返回 200。"
  },
  cgn: {
    primaryJobUrl: "https://cgn.hotjob.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中国广核 hotjob 招聘页返回 200。"
  },
  crec: {
    primaryJobUrl: "https://www.crec.cn/web/rlzy65/rczp11/index.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中国中铁官网人才招聘页交叉确认并改为更稳定的官方招聘入口。"
  },
  cccc: {
    primaryJobUrl: "https://zhaopin.ccccltd.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中国交建官方招聘站交叉确认并替换原失稳域名。"
  },
  "g-bits": {
    primaryJobUrl: "https://campus.g-bits.com/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认吉比特校园招聘页返回 200。"
  },
  "qiaqia-food": {
    primaryJobUrl: "https://qiaqiafood.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认洽洽食品招聘页返回 200，并替换为更稳定的招聘入口。"
  },
  "bawang-chaji": {
    primaryJobUrl: "https://jobs.chagee.com/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的霸王茶姬招聘站更新，并直连确认页面可访问。"
  },
  "sany-group": {
    primaryJobUrl: "https://sany.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认三一集团招聘页返回 200。"
  },
  "cainiao-network": {
    primaryJobUrl: "https://talent.cainiao.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认菜鸟网络官方招聘站返回 200。"
  },
  "inspur-group": {
    primaryJobUrl: "http://career.inspur.com/campus2026/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的浪潮集团校园招聘页直接更新。"
  },
  "haid-group": {
    primaryJobUrl: "https://www.haid.com.cn/SocialRecruitment/index.aspx",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的海大集团招聘页直接更新。"
  },
  "china-minmetals": {
    primaryJobUrl: "https://www.minmetals.com.cn/zgwk/rczp/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中国五矿集团官网人才招聘页交叉确认并替换原失稳招聘域名。"
  },
  cecep: {
    primaryJobUrl: "https://www.cecep.cn/cecep/zyly/rczp/jngs/2026/2/I1477346602589880320.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中国节能官网 2026 届校园招聘公告页交叉确认并改为更稳定入口。"
  },
  spic: {
    primaryJobUrl: "https://zhaopin.spic.com.cn",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 通过官方招聘平台页面直连确认国家电投招聘站可访问。"
  },
  csgc: {
    primaryJobUrl: "https://csgczhaopin.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中国兵器装备集团人力资源开发中心官网公开的网申门户链接交叉确认并替换原失稳域名。"
  },
  tonghuashun: {
    primaryJobUrl: "https://job.10jqka.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认同花顺招聘站返回 200。"
  },
  yonyou: {
    primaryJobUrl: "https://career.yonyou.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认用友招聘站跳转至官方投递页并返回 200。"
  },
  "new-hope-group": {
    primaryJobUrl: "https://newhope.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认新希望集团招聘页返回 200。"
  },
  "sunny-optical": {
    primaryJobUrl: "https://www.sunnyoptical.com/jobs.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据舜宇集团官网人才招聘页交叉确认并替换为更稳定的官方招聘入口。"
  },
  "kingdee-china": {
    primaryJobUrl: "https://www.kingdee.com/job",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据金蝶官网招聘页面交叉确认并替换原 404 链接。"
  },
  neusoft: {
    primaryJobUrl: "https://www.neusoft.com/cn/about/job/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据东软集团官网工作机会页面交叉确认并替换原失稳域名。"
  },
  "winning-health": {
    primaryJobUrl: "https://www.winning.com.cn/recurit-school.html",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据卫宁健康官网校园招聘页交叉确认并替换原失稳招聘域名。"
  },
  xcmg: {
    primaryJobUrl: "https://www.xcmg.com/aboutus/job_center.htm",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据徐工官网人才招聘页交叉确认并替换原失稳招聘域名。"
  },
  "chinasoft-international": {
    primaryJobUrl: "https://www.chinasofti.com/joinus/index.htm",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据中软国际官网“加入我们”页面交叉确认并替换原失稳校招域名。"
  },
  robam: {
    primaryJobUrl: "https://www.robam.com/recruit.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据老板电器官网人才招聘页交叉确认并替换原失稳招聘域名。"
  },
  supor: {
    primaryJobUrl: "https://www.supor.com.cn/culture/joinus.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据苏泊尔官网加入苏泊尔页面交叉确认。"
  },
  "desay-sv": {
    primaryJobUrl: "https://www.desaysv.com/jobList.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据德赛西威官网岗位招聘页交叉确认并替换原失稳招聘域名。"
  },
  miniso: {
    primaryJobUrl: "https://miniso.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认名创优品招聘站可访问，并替换为更直接的招聘入口。"
  },
  "kuka-home": {
    primaryJobUrl: "https://gw.kukahome.com/job.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的顾家家居招聘页直接更新。"
  },
  oppein: {
    primaryJobUrl: "https://www.oppein.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据欧派家居官网“加入欧派/工作在欧派”栏目交叉确认并保留官网入口。"
  },
  "fuyao-glass": {
    primaryJobUrl: "https://www.fuyaogroup.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据福耀集团官网一级导航“加入福耀”栏目交叉确认并保留官网入口。"
  },
  geekplus: {
    primaryJobUrl: "https://www.geekplus.com/company/career1",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据 Geek+ 官网 Career 页面交叉确认并替换原 careers 子域名。"
  },
  autohome: {
    primaryJobUrl: "https://talent.autohome.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据汽车之家官方招聘站交叉确认并替换原失稳招聘域名。"
  },
  "jd-logistics": {
    primaryJobUrl: "https://jenchina.jdwl.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据京东物流官方招聘站页面交叉确认并替换原失稳招聘域名。"
  },
  "digital-china": {
    primaryJobUrl: "https://digitalchina.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认神州数码校园招聘精确页可访问，并替换原会失效的招聘根域名。"
  },
  "bull-group": {
    primaryJobUrl: "https://gongniu.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认公牛集团校园招聘精确页可访问，并替换原失稳招聘域名。"
  },
  hangcha: {
    primaryJobUrl: "https://www.zjhc.cn/contact.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认杭叉集团官网招聘联系页可访问，并替换原失稳招聘域名。"
  },
  joyson: {
    primaryJobUrl: "https://www.joyson.com/index.php/join/recruit.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认均胜电子官网招聘页可访问，并替换原失稳招聘域名。"
  },
  "bethel-auto": {
    primaryJobUrl: "https://www.btl-auto.com/index.php/joinus/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认伯特利官网加入我们页面可访问，并替换原失稳招聘域名。"
  },
  "linglong-tire": {
    primaryJobUrl: "https://www.linglong.cn/about/carrer.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的玲珑轮胎 careers 页面直接更新。"
  },
  mixue: {
    primaryJobUrl: "https://careers.mxbc.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认蜜雪冰城校园招聘精确页可访问，并替换原失稳招聘域名。"
  },
  "sailun-tire": {
    primaryJobUrl: "https://www.sailungroup.com/talent/hire.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认赛轮轮胎官网招聘页可访问，并替换原失稳招聘域名。"
  },
  "ganfeng-lithium": {
    primaryJobUrl: "https://www.ganfenglithium.com/career.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认赣锋锂业官网 career 页可访问，并替换原失稳招聘域名。"
  },
  "goodwe-extra": {
    primaryJobUrl: "https://www.goodwe.com/about-goodwe/career",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认固德威官网 career 页可访问，并替换原失稳招聘域名。"
  },
  "tbea-extra": {
    primaryJobUrl: "https://www.tbea.com/join.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认特变电工 join us 页面可访问，并替换原失稳招聘域名。"
  },
  "zto-express": {
    primaryJobUrl: "https://hr.zto.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认中通快递官方招聘站可访问，并替换原失稳招聘域名。"
  },
  "sto-express": {
    primaryJobUrl: "https://www.sto.cn/pc/about?index=4",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认申通快递官网人才招聘页可访问，并替换原失稳招聘域名。"
  },
  "jtexpress-china": {
    primaryJobUrl: "https://www.jtexpress.com/sc/career",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认极兔速递中国官方 career 页可访问，并替换原失稳招聘域名。"
  },
  "deppon-logistics": {
    primaryJobUrl: "http://zhaopin.deppon.com/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为德邦招聘官网入口。"
  },
  "huayou-cobalt": {
    primaryJobUrl: "https://wecruit.hotjob.cn/SU6465f3d9bef57c0907f3bb58/pb/index.html#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的华友钴业招聘页直接更新。"
  },
  cngr: {
    primaryJobUrl: "https://wecruit.hotjob.cn/SU61ebbdfdbef57c632beecbc5/pb/index.html#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的中伟股份招聘页直接更新。"
  },
  "tinci-materials": {
    primaryJobUrl: "https://cn.tinci.com/rczp/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的天赐材料招聘页直接更新。"
  },
  "tianqi-lithium": {
    primaryJobUrl: "https://tianqilithium-hr.zhiye.com/jobs?KeyWords=",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的天齐锂业招聘页直接更新。"
  },
  estun: {
    primaryJobUrl: "https://estun1.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的埃斯顿校园招聘页直接更新。"
  },
  ginlong: {
    primaryJobUrl: "https://ginlong.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的锦浪科技招聘站直接更新。"
  },
  "chint-electric": {
    primaryJobUrl: "https://www.chint.com/join_us.html?md=0",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的正泰招聘页直接更新。"
  },
  "wuxi-biologics": {
    primaryJobUrl: "https://www.wuxibiologics.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据药明生物官网 Careers/Join Us 栏目交叉确认并保留官网入口。"
  },
  siasun: {
    primaryJobUrl: "https://siasun.zhiye.com/",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的新松 zhiye 招聘入口更新。"
  },
  "anhui-heli": {
    primaryJobUrl: "https://www.helichina.com/contact/job/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据安徽合力官网人才招聘页交叉确认并替换原失稳招聘域名。"
  },
  sunward: {
    primaryJobUrl: "https://www.sunward.com.cn/rczy/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据山河智能官网人才资源页交叉确认并替换原失稳招聘域名。"
  },
  "top-group": {
    primaryJobUrl: "https://www.tuopu.com/why-join-us/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据拓普集团官网 Why Join Us 页面交叉确认并替换原失稳招聘域名。"
  },
  guming: {
    primaryJobUrl: "https://app.mokahr.com/campus-recruitment/guming/39377#/home",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的古茗 Moka 校招精确页更新并标记为已核验。"
  },
  funplus: {
    primaryJobUrl: "https://funplus.com/careers/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据 FunPlus 官方 Careers 页面交叉确认并替换原失稳 careers 子域名。"
  },
  "weichai-power": {
    primaryJobUrl: "https://www.weichai.com/rlzy/zpxx/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据潍柴集团官网招聘信息页交叉确认并替换原失稳招聘域名。"
  },
  "taiji-corp": {
    primaryJobUrl: "https://www.taiji.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: false,
    primaryJobUrlNote: "已于 2026-04-06 标记为待复核，当前太极官网入口不可稳定访问。"
  },
  casic: {
    primaryJobUrl: "https://zhaopin.casic.com.cn",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留中国航天科工集团官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  avic: {
    primaryJobUrl: "https://zhaopin.avic.com",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留中国航空工业集团官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  "cosco-shipping": {
    primaryJobUrl: "https://talent.coscoshipping.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留中远海运官方主域名下人才招聘子站作为正式招聘入口并标记为已核验。"
  },
  crsc: {
    primaryJobUrl: "https://zhaopin.crsc.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留中国通号官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  baowu: {
    primaryJobUrl: "https://job.baowugroup.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留中国宝武官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  angang: {
    primaryJobUrl: "https://zhaopin.ansteel.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留鞍钢集团官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  "ja-solar": {
    primaryJobUrl: "https://hr.jasolar.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留晶澳科技官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  "canadian-solar": {
    primaryJobUrl: "https://recruit.cnsolare.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: false,
    primaryJobUrlNote: "已于 2026-04-06 标记为待复核，当前阿特斯招聘子域不可稳定访问。"
  },
  "flat-glass": {
    primaryJobUrl: "https://flatgroup.com.cn/recruit",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为福莱特官网人才招募页，替换原不稳定招聘子域名。"
  },
  "luckin-coffee": {
    primaryJobUrl: "https://www.lkcoffee.com/about",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的瑞幸咖啡官网 About 页面更新，并直连确认页面可访问。"
  },
  "focus-media": {
    primaryJobUrl: "https://join.focusmedia.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: false,
    primaryJobUrlNote: "已于 2026-04-06 标记为待复核，当前分众传媒招聘子域不可稳定访问。"
  },
  hla: {
    primaryJobUrl: "https://www.hotjob.cn/wt/HLA/web/index",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为海澜之家 Hotjob 招聘页，替换原不可稳定访问招聘子域。"
  },
  "dongfang-caifu": {
    primaryJobUrl: "https://zhaopin.eastmoney.com/social-recruitment/eastmoney/57970/#/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的东方财富精确招聘页更新并标记为已核验。"
  },
  "pop-mart": {
    primaryJobUrl: "https://popmart.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为泡泡玛特 zhiye 校招页，替换原不可稳定访问招聘子域。"
  },
  heytea: {
    primaryJobUrl: "https://www.heytalents.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留喜茶官方招聘域名作为正式招聘入口并标记为已核验。"
  },
  haidilao: {
    primaryJobUrl: "https://haidilao.jobs.feishu.cn/070469/position/7342775344515369226/detail",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为海底捞 Feishu 招聘职位页，替换原不可访问招聘子域。"
  },
  bestore: {
    primaryJobUrl: "https://lppz.zhiye.com/campus/jobs",
    primaryJobUrlType: "official_campus",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的良品铺子 zhiye 校招页更新。"
  },
  "muyuan-foods": {
    primaryJobUrl: "https://www.muyuanfoods.com/#/recruitConsulting",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为牧原股份官网招聘咨询锚点页。"
  },
  ronbay: {
    primaryJobUrl: "https://ronbay.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的容百 zhiye 招聘入口更新并标记为已核验。"
  },
  deye: {
    primaryJobUrl: "https://deye.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的德业 zhiye 招聘入口更新并标记为已核验。"
  },
  "wens-foodstuff": {
    primaryJobUrl: "https://career.wens.com.cn/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留温氏股份官方主域名下招聘子站作为正式招聘入口并标记为已核验。"
  },
  fotile: {
    primaryJobUrl: "https://fotile.zhiye.com/about#i1",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 直连确认方太招聘站关于我们页面可访问，并替换原官网 Career 页。"
  },
  "dingdong-maicai": {
    primaryJobUrl: "https://talent.100.me/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 保留叮咚买菜官方招聘域名作为正式招聘入口并标记为已核验。"
  },
  "hema-fresh": {
    primaryJobUrl: "https://m.zhaopin.com/company/CZ486152530.htm",
    primaryJobUrlType: "third_party_job_board",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 改为盒马可访问的智联招聘公司页，原官方招聘域名当前不可稳定访问。"
  },
  "wh-group": {
    primaryJobUrl: "https://www.shuanghui.net/page-concept.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 根据双汇官网“诚聘英才/大学生招聘”栏目页面交叉确认并替换原 404 招聘链接。"
  },
  "three-squirrels": {
    primaryJobUrl: "https://www.3songshu.com/sjob/xjob.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的三只松鼠官网招聘页更新并标记为已核验。"
  },
  sanhua: {
    primaryJobUrl: "https://www.zjshc.com/about/join.html",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的三花智控官网加入我们页面更新并标记为已核验。"
  },
  "risen-energy": {
    primaryJobUrl: "https://risen.zhiye.com/",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的东方日升招聘页更新并标记为已核验。"
  },
  "zoomlion-extra": {
    primaryJobUrl: "http://www.zoomlion-access.com/join/join-us.htm",
    primaryJobUrlType: "official_careers",
    primaryJobUrlVerified: true,
    primaryJobUrlNote: "已于 2026-04-06 按提供的中联重科加入我们页面更新并标记为已核验。"
  }
};

let updated = 0;

for (const company of data) {
  if (company.primaryJobUrlNote === bulkAutoVerifyNote) {
    company.primaryJobUrlVerified = false;
    company.primaryJobUrlVerifiedAt = capturedAt;
    company.primaryJobUrlNote = revertedAutoVerifyNote;
  }

  const patch = updates[company.id];
  const shouldBulkVerify = bulkVerifiedIds.has(company.id);
  if (!patch && !shouldBulkVerify) continue;
  Object.assign(
    company,
    shouldBulkVerify
      ? {
          primaryJobUrlVerified: true,
          primaryJobUrlVerifiedAt: capturedAt,
          primaryJobUrlNote: "已于 2026-04-06 保留官方 careers 主站作为稳定招聘入口并标记为已核验。"
        }
      : {},
    patch ?? {},
    { primaryJobUrlVerifiedAt: capturedAt }
  );
  const primaryEvidence = company.evidence?.find((item) => item.isPrimary);
  if (primaryEvidence) {
    primaryEvidence.url = company.primaryJobUrl;
    primaryEvidence.sourceType = company.primaryJobUrlType;
  }
  updated += 1;
}

fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Cleaned ${updated} company links`);
