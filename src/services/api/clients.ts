import { authFetch } from '../http/authFetch';
import { AuthApiError } from './auth';
import type {
  ChangeClientOwnerRequest,
  ChangeClientStatusRequest,
  ClientDetails,
  ClientListItem,
  ClientOwnerOption,
  ClientPlatform,
  ClientPlatformLinks,
  ClientSource,
  ClientStatus,
  ClientType,
  ClientsListFilters,
  CreateClientFromSearchRequest,
  CreateClientRequest,
  DuplicateCheckResponse,
  PaginatedClientsResult,
  TeamClientsOverviewItem,
  UpdateClientRequest,
} from '../../types/clients';

const BASE_URL = 'http://localhost:3000/api/v1/clients';

const PLATFORM_IDS: ClientPlatform[] = ['website', 'facebook', 'instagram', 'snapchat', 'linkedin', 'x', 'tiktok'];
const CLIENT_STATUSES: ClientStatus[] = ['new', 'contacted', 'interested', 'not_interested', 'converted', 'archived'];
const CLIENT_TYPES: ClientType[] = ['person', 'company'];
const CLIENT_SOURCES: ClientSource[] = ['manual', 'lead_search'];

const PLATFORM_URL_FIELD_MAP: Record<ClientPlatform, string> = {
  website: 'websiteUrl',
  facebook: 'facebookUrl',
  instagram: 'instagramUrl',
  snapchat: 'snapchatUrl',
  linkedin: 'linkedinUrl',
  x: 'xUrl',
  tiktok: 'tiktokUrl',
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeDateOnly = (value?: string): string | undefined => {
  const normalized = normalizeOptional(value);
  if (!normalized) return undefined;
  return normalized.slice(0, 10);
};

const toQuery = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
};

const compactObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const compacted: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      compacted[key as keyof T] = value as T[keyof T];
    }
  });
  return compacted;
};

const toFrontendPlatform = (value: unknown): ClientPlatform => {
  if (typeof value === 'string' && (PLATFORM_IDS as string[]).includes(value)) {
    return value as ClientPlatform;
  }
  return 'website';
};

const toFrontendClientType = (value: unknown): ClientType => {
  if (typeof value === 'string' && (CLIENT_TYPES as string[]).includes(value)) {
    return value as ClientType;
  }

  if (value === 'individual') return 'person';
  if (value === 'business') return 'company';

  return 'company';
};

const toFrontendStatus = (value: unknown): ClientStatus => {
  if (typeof value === 'string' && (CLIENT_STATUSES as string[]).includes(value)) {
    return value as ClientStatus;
  }
  return 'new';
};

const toFrontendSource = (value: unknown): ClientSource => {
  if (typeof value === 'string' && (CLIENT_SOURCES as string[]).includes(value)) {
    return value as ClientSource;
  }
  return 'manual';
};

const toBackendLinksPayload = (links?: ClientPlatformLinks): Record<string, string> | undefined => {
  if (!links) return undefined;
  const mapped: Record<string, string> = {};
  PLATFORM_IDS.forEach((platform) => {
    const normalized = normalizeOptional(links[platform]);
    if (normalized) {
      mapped[PLATFORM_URL_FIELD_MAP[platform]] = normalized;
    }
  });
  return Object.keys(mapped).length > 0 ? mapped : undefined;
};

const toFrontendPlatformLinks = (raw: Record<string, unknown>): ClientPlatformLinks => {
  const linksContainer = isObject(raw.links)
    ? raw.links
    : isObject(raw.platformLinks)
      ? raw.platformLinks
      : {};

  const mapped: ClientPlatformLinks = {};
  PLATFORM_IDS.forEach((platform) => {
    const backendField = PLATFORM_URL_FIELD_MAP[platform];
    const value =
      typeof linksContainer[backendField] === 'string'
        ? (linksContainer[backendField] as string)
        : typeof linksContainer[platform] === 'string'
          ? (linksContainer[platform] as string)
          : typeof raw[backendField] === 'string'
            ? (raw[backendField] as string)
            : undefined;

    const normalized = normalizeOptional(value);
    if (normalized) {
      mapped[platform] = normalized;
    }
  });
  return mapped;
};

const toFrontendClientDetails = (raw: Record<string, unknown>): ClientDetails => {
  const ownerRaw = isObject(raw.owner) ? raw.owner : {};
  const ownerId = typeof ownerRaw.id === 'string' ? ownerRaw.id : typeof raw.ownerUserId === 'string' ? raw.ownerUserId : '';
  const ownerName =
    typeof ownerRaw.fullName === 'string'
      ? ownerRaw.fullName
      : typeof raw.ownerName === 'string'
        ? raw.ownerName
        : 'غير محدد';

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.displayName ?? 'عميل'),
    type: toFrontendClientType(raw.clientType ?? raw.type),
    city: String(raw.saudiCity ?? raw.city ?? 'Riyadh') as ClientDetails['city'],
    primaryPlatform: toFrontendPlatform(raw.primaryPlatform),
    status: toFrontendStatus(raw.status),
    owner: {
      id: ownerId,
      fullName: ownerName,
      email: typeof ownerRaw.email === 'string' ? ownerRaw.email : typeof raw.ownerEmail === 'string' ? raw.ownerEmail : undefined,
      role: typeof ownerRaw.role === 'string'
        ? (ownerRaw.role as ClientDetails['owner']['role'])
        : typeof raw.ownerRole === 'string'
          ? (raw.ownerRole as ClientDetails['owner']['role'])
          : undefined,
    },
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    source: toFrontendSource(raw.sourceModule ?? raw.source),
    mobilePhone: typeof raw.mobile === 'string' ? raw.mobile : typeof raw.mobilePhone === 'string' ? raw.mobilePhone : undefined,
    whatsappNumber: typeof raw.whatsapp === 'string' ? raw.whatsapp : typeof raw.whatsappNumber === 'string' ? raw.whatsappNumber : undefined,
    email: typeof raw.email === 'string' ? raw.email : undefined,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    sourcePlatform: typeof raw.sourcePlatform === 'string' ? toFrontendPlatform(raw.sourcePlatform) : undefined,
    sourceUrl: typeof raw.sourceUrl === 'string' ? raw.sourceUrl : undefined,
    platformLinks: toFrontendPlatformLinks(raw),
    createdByUserId: typeof raw.createdByUserId === 'string' ? raw.createdByUserId : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
};

const toFrontendClientListItem = (raw: Record<string, unknown>): ClientListItem => {
  const details = toFrontendClientDetails(raw);
  return {
    id: details.id,
    name: details.name,
    type: details.type,
    city: details.city,
    primaryPlatform: details.primaryPlatform,
    status: details.status,
    owner: details.owner,
    createdAt: details.createdAt,
    source: details.source,
  };
};

const toBackendCreatePayload = (
  payload: CreateClientRequest | CreateClientFromSearchRequest,
  mode: 'manual' | 'from_search',
): Record<string, unknown> => {
  const links = toBackendLinksPayload(payload.platformLinks);
  const primaryPlatformLink = normalizeOptional(payload.platformLinks[payload.primaryPlatform]);
  const sourceUrl = normalizeOptional(payload.sourceUrl) ?? primaryPlatformLink;

  const baseBody = compactObject({
    name: normalizeOptional(payload.name),
    clientType: payload.type,
    saudiCity: payload.city,
    mobile: normalizeOptional(payload.mobilePhone),
    whatsapp: normalizeOptional(payload.whatsappNumber),
    email: normalizeOptional(payload.email),
    notes: normalizeOptional(payload.notes),
    primaryPlatform: payload.primaryPlatform,
    sourceModule: mode === 'from_search' ? 'lead_search' : 'manual',
    sourcePlatform: mode === 'from_search' ? (payload as CreateClientFromSearchRequest).sourcePlatform : payload.primaryPlatform,
    sourceUrl,
    forceCreateIfDuplicate: payload.forceCreateIfDuplicate,
    sourceQuery: mode === 'from_search' ? normalizeOptional((payload as CreateClientFromSearchRequest).sourceQuery) : undefined,
  });

  return links ? { ...baseBody, links } : baseBody;
};

const toBackendUpdatePayload = (payload: UpdateClientRequest): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = normalizeOptional(payload.name);
  if (payload.type !== undefined) body.clientType = payload.type;
  if (payload.city !== undefined) body.saudiCity = payload.city;
  if (payload.mobilePhone !== undefined) body.mobile = normalizeOptional(payload.mobilePhone);
  if (payload.whatsappNumber !== undefined) body.whatsapp = normalizeOptional(payload.whatsappNumber);
  if (payload.email !== undefined) body.email = normalizeOptional(payload.email);
  if (payload.notes !== undefined) body.notes = normalizeOptional(payload.notes);
  if (payload.primaryPlatform !== undefined) body.primaryPlatform = payload.primaryPlatform;
  if (payload.sourceUrl !== undefined) body.sourceUrl = normalizeOptional(payload.sourceUrl);

  if (payload.platformLinks !== undefined) {
    body.links = toBackendLinksPayload(payload.platformLinks) ?? {};
  }

  return compactObject(body);
};

const toBackendListFilters = (filters: ClientsListFilters): Record<string, unknown> => {
  return compactObject({
    keyword: filters.keyword,
    saudiCity: filters.city,
    status: filters.status,
    clientType: filters.type,
    primaryPlatform: filters.primaryPlatform,
    ownerUserId: filters.ownerUserId,
    createdAtFrom: normalizeDateOnly(filters.createdFrom),
    createdAtTo: normalizeDateOnly(filters.createdTo),
    page: filters.page,
    pageSize: filters.pageSize,
  });
};

const toFrontendTeamOverviewItem = (raw: Record<string, unknown>): TeamClientsOverviewItem => ({
  employeeId: String(raw.employeeId ?? raw.ownerUserId ?? raw.userId ?? ''),
  employeeName: String(raw.employeeName ?? raw.ownerName ?? raw.fullName ?? 'غير محدد'),
  clientsCount: Number(raw.clientsCount ?? raw.totalClients ?? 0),
});

const pickClientPayload = (data: unknown): Record<string, unknown> => {
  if (!isObject(data)) return {};
  if (isObject(data.client)) return data.client;
  return data;
};

export class ClientsDuplicateError extends Error {
  public readonly code = 'DUPLICATE_CLIENT';
  public readonly httpStatus = 409;
  public readonly duplicate: DuplicateCheckResponse;
  public readonly originalError: AuthApiError;

  constructor(originalError: AuthApiError, duplicate: DuplicateCheckResponse) {
    super(originalError.message || 'Duplicate client detected');
    this.name = 'ClientsDuplicateError';
    this.duplicate = duplicate;
    this.originalError = originalError;
  }
}

export const isClientsDuplicateError = (error: unknown): error is ClientsDuplicateError => {
  return error instanceof ClientsDuplicateError;
};

const extractDuplicateData = (error: AuthApiError): DuplicateCheckResponse | null => {
  const isDuplicateStatus = error.httpStatus === 409;
  const isDuplicateCode = /duplicate/i.test(error.code || '');
  if (!isDuplicateStatus && !isDuplicateCode) return null;

  const anyError = error as unknown as {
    duplicate?: Record<string, unknown>;
    details?: Array<Record<string, unknown>>;
  };

  const detailsObject = Array.isArray(anyError.details) && anyError.details.length > 0 ? anyError.details[0] : undefined;
  const duplicateRaw = isObject(anyError.duplicate)
    ? anyError.duplicate
    : isObject(detailsObject?.duplicate)
      ? (detailsObject?.duplicate as Record<string, unknown>)
      : {};

  const matchedClientRaw = isObject(duplicateRaw.matchedClient)
    ? (duplicateRaw.matchedClient as Record<string, unknown>)
    : isObject(duplicateRaw.existingClient)
      ? (duplicateRaw.existingClient as Record<string, unknown>)
      : undefined;

  const matchedFields = Array.isArray(duplicateRaw.matchedFields)
    ? duplicateRaw.matchedFields.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    isDuplicate: true,
    matchedBy: typeof duplicateRaw.matchedBy === 'string' ? duplicateRaw.matchedBy : undefined,
    matchedClientId: typeof duplicateRaw.matchedClientId === 'string'
      ? duplicateRaw.matchedClientId
      : typeof matchedClientRaw?.id === 'string'
        ? matchedClientRaw.id
        : undefined,
    matchedFields,
    matchedClient: matchedClientRaw
      ? {
          id: String(matchedClientRaw.id ?? ''),
          name: String(matchedClientRaw.name ?? matchedClientRaw.displayName ?? 'عميل موجود'),
          city: typeof matchedClientRaw.saudiCity === 'string'
            ? (matchedClientRaw.saudiCity as ClientDetails['city'])
            : typeof matchedClientRaw.city === 'string'
              ? (matchedClientRaw.city as ClientDetails['city'])
              : undefined,
          primaryPlatform: typeof matchedClientRaw.primaryPlatform === 'string'
            ? toFrontendPlatform(matchedClientRaw.primaryPlatform)
            : undefined,
          status: typeof matchedClientRaw.status === 'string'
            ? toFrontendStatus(matchedClientRaw.status)
            : undefined,
          ownerName: typeof matchedClientRaw.ownerName === 'string'
            ? matchedClientRaw.ownerName
            : undefined,
        }
      : undefined,
  };
};

const withDuplicateHandling = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof AuthApiError) {
      const duplicate = extractDuplicateData(error);
      if (duplicate) {
        throw new ClientsDuplicateError(error, duplicate);
      }
    }
    throw error;
  }
};

export const createClient = async (payload: CreateClientRequest) => {
  const response = await withDuplicateHandling(
    authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify(toBackendCreatePayload(payload, 'manual')),
    }),
  );

  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const createClientFromSearch = async (payload: CreateClientFromSearchRequest) => {
  const response = await withDuplicateHandling(
    authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}/from-search`, {
      method: 'POST',
      body: JSON.stringify(toBackendCreatePayload(payload, 'from_search')),
    }),
  );

  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const listClients = async (filters: ClientsListFilters) => {
  const response = await authFetch<{
    data: { items?: Array<Record<string, unknown>>; total?: number; page?: number; pageSize?: number };
  }>(`${BASE_URL}${toQuery(toBackendListFilters(filters))}`);

  const mapped: PaginatedClientsResult = {
    items: Array.isArray(response.data.items) ? response.data.items.map(toFrontendClientListItem) : [],
    total: Number(response.data.total ?? 0),
    page: Number(response.data.page ?? filters.page),
    pageSize: Number(response.data.pageSize ?? filters.pageSize),
  };

  return { data: mapped };
};

export const getClientById = async (clientId: string) => {
  const response = await authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}/${clientId}`);
  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const updateClient = async (clientId: string, payload: UpdateClientRequest) => {
  const response = await withDuplicateHandling(
    authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendUpdatePayload(payload)),
    }),
  );

  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const changeClientStatus = async (clientId: string, payload: ChangeClientStatusRequest) => {
  const response = await authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}/${clientId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const changeClientOwner = async (clientId: string, payload: ChangeClientOwnerRequest) => {
  const response = await authFetch<{ data: Record<string, unknown> }>(`${BASE_URL}/${clientId}/owner`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return { data: toFrontendClientDetails(pickClientPayload(response.data)) };
};

export const deleteClient = (clientId: string) =>
  authFetch<void>(`${BASE_URL}/${clientId}`, {
    method: 'DELETE',
  });

export const getTeamClientsOverview = async () => {
  const response = await authFetch<{ data: Array<Record<string, unknown>> }>(`${BASE_URL}/overview/team`);
  return {
    data: Array.isArray(response.data) ? response.data.map(toFrontendTeamOverviewItem) : [],
  };
};

export const getClientOwnersOptions = async (params: { keyword?: string; limit?: number } = {}) => {
  const response = await authFetch<{ data: Array<Record<string, unknown>> }>(
    `${BASE_URL}/owners/options${toQuery(compactObject({ keyword: params.keyword, limit: params.limit }))}`,
  );

  const mapped: ClientOwnerOption[] = Array.isArray(response.data)
    ? response.data
        .filter(isObject)
        .map((owner) => ({
          id: String(owner.id ?? ''),
          fullName: String(owner.fullName ?? owner.name ?? ''),
          role: String(owner.role ?? '') as ClientOwnerOption['role'],
        }))
        .filter((owner) => owner.id && owner.fullName)
    : [];

  return { data: mapped };
};
