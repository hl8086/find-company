export type SourceType =
  | "official_campus"
  | "official_careers"
  | "official_china_profile"
  | "annual_report"
  | "esg_report"
  | "university_job_board"
  | "third_party_job_board"
  | "manual_note";

export type JobUrlType =
  | "official_campus"
  | "official_careers"
  | "university_job_board"
  | "third_party_job_board";

export type CampusHiringStatus = "active" | "likely_active" | "uncertain";
export type ConfidenceLevel = "A" | "B" | "C";

export type Evidence = {
  id: string;
  sourceType: SourceType;
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  capturedAt: string;
  excerpt: string;
  isPrimary: boolean;
  supportsEmployeeScale: boolean;
  supportsCampusHiring: boolean;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  aliases: string[];
  companyType: string;
  ownershipType: string;
  industry: string;
  description: string;
  hqCountry: string;
  chinaPresence: string;
  employeeScaleText: string;
  employeeScaleValue?: number;
  employeeScaleScope: "china" | "global" | "unknown";
  employeeScaleVerified: boolean;
  campusHiringStatus: CampusHiringStatus;
  campusHiringLastSeenAt: string;
  primaryJobUrl: string;
  primaryJobUrlType: JobUrlType;
  confidenceLevel: ConfidenceLevel;
  primaryJobUrlVerified: boolean;
  primaryJobUrlVerifiedAt?: string;
  primaryJobUrlNote?: string;
  notes?: string;
  provinces: string[];
  cities: string[];
  tags: string[];
  evidence: Evidence[];
};
