import type { SearchPlatform, SupportedSaudiCity } from './lead-search';
import type { UserRole } from './auth';

export type ClientType = 'person' | 'company';
export type ClientStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'archived';
export type ClientSource = 'manual' | 'lead_search';
export type ClientPlatform = SearchPlatform;

export interface ClientOwnerSummary {
  id: string;
  fullName: string;
  email?: string;
  role?: UserRole;
}

export interface ClientPlatformLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  snapchat?: string;
  linkedin?: string;
  x?: string;
  tiktok?: string;
}

export interface ClientListItem {
  id: string;
  name: string;
  type: ClientType;
  city: SupportedSaudiCity;
  primaryPlatform: ClientPlatform;
  status: ClientStatus;
  owner: ClientOwnerSummary;
  createdAt: string;
  source: ClientSource;
}

export interface ClientDetails extends ClientListItem {
  mobilePhone?: string;
  whatsappNumber?: string;
  email?: string;
  notes?: string;
  sourcePlatform?: ClientPlatform;
  sourceUrl?: string;
  platformLinks: ClientPlatformLinks;
  createdByUserId?: string;
  updatedAt?: string;
}

export interface ClientEditableFields {
  name: string;
  type: ClientType;
  city: SupportedSaudiCity;
  mobilePhone?: string;
  whatsappNumber?: string;
  email?: string;
  notes?: string;
  primaryPlatform: ClientPlatform;
  platformLinks: ClientPlatformLinks;
}

export interface CreateClientRequest extends ClientEditableFields {
  source?: ClientSource;
  sourceUrl?: string;
  forceCreateIfDuplicate?: boolean;
}

export interface CreateClientFromSearchRequest extends ClientEditableFields {
  sourcePlatform: ClientPlatform;
  sourceUrl: string;
  sourceQuery?: string;
  forceCreateIfDuplicate?: boolean;
}

export interface UpdateClientRequest extends Partial<ClientEditableFields> {
  sourceUrl?: string;
}

export interface ChangeClientStatusRequest {
  status: ClientStatus;
}

export interface ChangeClientOwnerRequest {
  newOwnerUserId: string;
}

export interface ClientsListFilters {
  keyword?: string;
  city?: SupportedSaudiCity | '';
  status?: ClientStatus | '';
  type?: ClientType | '';
  primaryPlatform?: ClientPlatform | '';
  ownerUserId?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedClientsResult {
  items: ClientListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamClientsOverviewItem {
  employeeId: string;
  employeeName: string;
  clientsCount: number;
}

export interface ClientOwnerOption {
  id: string;
  fullName: string;
  role: UserRole;
}

export interface DuplicateCheckResponse {
  isDuplicate: true;
  matchedBy?: string;
  matchedClientId?: string;
  matchedFields?: string[];
  matchedClient?: {
    id: string;
    name: string;
    city?: SupportedSaudiCity;
    primaryPlatform?: ClientPlatform;
    status?: ClientStatus;
    ownerName?: string;
  };
}

export interface ClientsApiErrorPayload {
  code?: string;
  message?: string;
  details?: Array<Record<string, unknown>>;
  duplicate?: DuplicateCheckResponse;
}

export interface BulkClientItem {
  name: string;
  clientType: 'person' | 'company';
  mobile?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  saudiCity: string;
  notes?: string | null;
  primaryPlatform: ClientPlatform;
  sourceModule?: ClientSource;
  sourcePlatform: ClientPlatform;
  sourceUrl: string;
  links?: Partial<Record<string, string | null>>;
}

export interface BulkCreateClientsRequest {
  clients: BulkClientItem[];
  forceCreateIfDuplicate?: boolean;
}

export interface BulkClientSuccessItem {
  rowIndex: number;
  status: 'created';
  client: ClientDetails;
  duplicateWarning?: DuplicateCheckResponse | null;
}

export interface BulkClientFailureItem {
  rowIndex: number;
  status: 'failed';
  error: {
    code: string;
    message: string;
    field?: string | null;
  };
  inputSnapshot: {
    name?: string;
    email?: string | null;
    mobile?: string | null;
  };
}

export interface BulkCreateClientsResponse {
  summary: {
    total: number;
    created: number;
    failed: number;
  };
  results: (BulkClientSuccessItem | BulkClientFailureItem)[];
}

