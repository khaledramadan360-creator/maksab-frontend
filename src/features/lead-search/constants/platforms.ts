import type { SearchPlatform } from '../../../types/lead-search';

export interface PlatformConfig {
  id: SearchPlatform;
  label: string;
  iconPlaceholder: string;
  enabled: boolean;
  description: string;
}

export const PLATFORMS_CONFIG: Record<SearchPlatform, PlatformConfig> = {
  website: {
    id: 'website',
    label: 'مواقع الويب',
    iconPlaceholder: '🌐',
    enabled: true,
    description: 'البحث في المواقع العامة وصفحات الأعمال.',
  },
  facebook: {
    id: 'facebook',
    label: 'فيسبوك',
    iconPlaceholder: '👥',
    enabled: true,
    description: 'البحث في حسابات فيسبوك والصفحات وقوائم الأنشطة التجارية.',
  },
  instagram: {
    id: 'instagram',
    label: 'إنستغرام',
    iconPlaceholder: '📸',
    enabled: true,
    description: 'البحث في حسابات إنستغرام ونتائج اكتشاف المحتوى.',
  },
  snapchat: {
    id: 'snapchat',
    label: 'سناب شات',
    iconPlaceholder: '👻',
    enabled: true,
    description: 'البحث في حسابات سناب شات والنتائج العامة القابلة للاكتشاف.',
  },
  linkedin: {
    id: 'linkedin',
    label: 'لينكدإن',
    iconPlaceholder: '💼',
    enabled: true,
    description: 'البحث في ملفات لينكدإن الشخصية والشركات والبيانات المهنية.',
  },
  x: {
    id: 'x',
    label: 'إكس',
    iconPlaceholder: 'X',
    enabled: true,
    description: 'البحث في حسابات إكس والمنشورات العامة.',
  },
  tiktok: {
    id: 'tiktok',
    label: 'تيك توك',
    iconPlaceholder: '🎵',
    enabled: true,
    description: 'البحث في منشئي تيك توك والمحتوى العام ذي الصلة.',
  },
};

export const PLATFORMS_ORDER: SearchPlatform[] = [
  'website',
  'facebook',
  'instagram',
  'snapchat',
  'linkedin',
  'x',
  'tiktok',
];

export const PLATFORMS_LIST: PlatformConfig[] = PLATFORMS_ORDER.map((platformId) => PLATFORMS_CONFIG[platformId]);
