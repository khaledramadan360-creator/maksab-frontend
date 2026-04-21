import type { ClientPlatform, ClientStatus, ClientType } from '../../types/clients';

export const CLIENT_TYPE_OPTIONS: Array<{ value: ClientType; label: string }> = [
  { value: 'person', label: 'فرد' },
  { value: 'company', label: 'شركة' },
];

export const CLIENT_STATUS_OPTIONS: Array<{ value: ClientStatus; label: string }> = [
  { value: 'new', label: 'جديد' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'interested', label: 'مهتم' },
  { value: 'not_interested', label: 'غير مهتم' },
  { value: 'converted', label: 'تم التحويل' },
  { value: 'archived', label: 'مؤرشف' },
];

export const CLIENT_PLATFORM_OPTIONS: Array<{ value: ClientPlatform; label: string }> = [
  { value: 'website', label: 'ويب سايت' },
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'instagram', label: 'إنستجرام' },
  { value: 'snapchat', label: 'سناب شات' },
  { value: 'linkedin', label: 'لينكدإن' },
  { value: 'x', label: 'X' },
  { value: 'tiktok', label: 'تيك توك' },
];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = Object.fromEntries(
  CLIENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ClientType, string>;

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = Object.fromEntries(
  CLIENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ClientStatus, string>;

export const CLIENT_PLATFORM_LABELS: Record<ClientPlatform, string> = Object.fromEntries(
  CLIENT_PLATFORM_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ClientPlatform, string>;
