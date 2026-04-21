const BASE_URL = 'http://localhost:3000/api/v1/auth';

export interface ApiError {
  code: string;
  message: string;
  details?: any[];
  duplicate?: Record<string, unknown>;
  httpStatus?: number;
}

export class AuthApiError extends Error {
  public code: string;
  public details?: any[];
  public duplicate?: Record<string, unknown>;
  public httpStatus?: number;

  constructor(errorData: ApiError) {
    super(errorData.message || 'حدث خطأ غير متوقع');
    this.name = 'AuthApiError';
    this.code = errorData.code || 'UnknownError';
    this.details = errorData.details;
    this.duplicate = errorData.duplicate;
    this.httpStatus = errorData.httpStatus;
  }
}

export const fetchApi = async <T>(endpoint: string, options: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const rawText = await response.text();
  let data: any = {};
  
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      data = {};
    }
  }

  if (!response.ok) {
    // If backend provided the schema { error: { code, message, details } }
    if (data && data.error) {
      throw new AuthApiError({ ...data.error, httpStatus: response.status });
    }
    // Fallback if schema doesn't perfectly match
    throw new AuthApiError({
      code: 'HttpError',
      message: data.message || `خطأ في الاتصال بالسيرفر!`,
      httpStatus: response.status,
    });
  }

  return data as T;
};
