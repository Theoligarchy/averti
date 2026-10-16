export type NoticeCategory = 'missing_person' | 'vehicle' | 'pet' | 'advisory' | 'wanted';

export type NoticeStatus = 'active' | 'review' | 'closed';

export interface Notice {
  id: string;
  category: NoticeCategory;
  kindLabel: string;
  title: string;
  issuingAuthority: string;
  jurisdiction: string;
  state: string | null; // null represents Pan-India / Central agency
  referenceNumber: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  verifiedAt: string | null;
  expiresAt: string | null;
  status: NoticeStatus;
  sourceUrl: string | null;
  description: string;
  area: string;
  isWanted?: boolean;
  reward?: string | null;
  contactDepartment?: string;
  contactPhone?: string;
  officialSourceNoticeUrl?: string;
  classification: 'example' | 'official';
  imageUrl?: string;
}

export interface StateCrimeData {
  name: string;
  code: string;
  count: number; // Total registered cases
  rate: number;  // Registered cases per 1 lakh (100,000) population
  populationEstimate?: number; // In tens of thousands or crores
  reportingYear: number;
}

export interface HelplineItem {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  source: string;
  sourceUrl: string;
  verifiedDate: string;
  isNational: boolean;
  isPrimary?: boolean;
}

export type ActiveTab = 'atlas' | 'notices' | 'wanted' | 'emergency' | 'sources' | 'about' | 'police_triage';
