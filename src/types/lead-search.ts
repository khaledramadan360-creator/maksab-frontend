export type SearchPlatform = 'website' | 'linkedin' | 'facebook' | 'instagram' | 'snapchat' | 'x' | 'tiktok';
export type SupportedSaudiCity = 'all' | 'Riyadh' | 'Jeddah' | 'Makkah' | 'Madinah' | 'Dammam' | 'Khobar' | 'Dhahran' | 'Taif' | 'Tabuk' | 'Abha' | 'Khamis Mushait' | 'Buraidah' | 'Hail' | 'Jazan' | 'Najran' | 'Al Ahsa' | 'Yanbu' | 'Jubail';
export type RequestedResultsCount = 10 | 25 | 50;
export type SearchLanguage = 'ar' | 'en';

export interface LeadSearchRequest {
  keyword: string;
  saudiCity: SupportedSaudiCity;
  platforms: SearchPlatform[];
  requestedResultsCount: RequestedResultsCount;
  language?: SearchLanguage;
}

export interface LeadSearchResultItem {
  id?: string;
  platform?: SearchPlatform;
  displayNameOrName?: string;
  titleOrHeadline?: string;
  canonicalUrl?: string;
  location?: string;
  resultType?: string;
  score?: number;
  title?: string;
  snippet?: string;
  extractedNameOrLabel?: string;
  extractedLocation?: string;
  sourceQuery?: string;
}

export interface PlatformSearchResult {
  platform?: SearchPlatform;
  requestedCount: number;
  returnedCount: number;
  warning?: string;
  results: LeadSearchResultItem[];
}

export interface LeadSearchOutput {
  keyword: string;
  country: string;
  saudiCity: SupportedSaudiCity;
  platforms: SearchPlatform[];
  requestedResultsCount: RequestedResultsCount;
  language?: SearchLanguage;
  platformResults: Partial<Record<SearchPlatform, PlatformSearchResult>>;
}
