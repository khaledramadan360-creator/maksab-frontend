export type MarketingSeasonStatusDto = 'active' | 'inactive';

export interface MarketingSeasonDto {
  id: string;
  title: string;
  description: string | null;
  status: MarketingSeasonStatusDto;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingSeasonListItemDto {
  id: string;
  title: string;
  status: MarketingSeasonStatusDto;
  ownerUserId: string;
  createdAt: string;
}

export interface ActiveMarketingSeasonDto {
  id: string;
  title: string;
  description: string | null;
}

export interface MarketingSeasonsListResponseDto {
  items: MarketingSeasonListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateMarketingSeasonRequestDto {
  title: string;
  description?: string | null;
}

export interface UpdateMarketingSeasonRequestDto {
  title?: string;
  description?: string | null;
}

export interface MarketingSeasonFiltersDto {
  keyword?: string;
  status?: MarketingSeasonStatusDto;
  ownerUserId?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  page?: number;
  pageSize?: number;
}
