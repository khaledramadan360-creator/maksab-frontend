import { useEffect, useMemo, useState } from 'react';
import { SAUDI_CITIES } from '../../lead-search/constants/saudi-cities';
import type {
  ClientPlatform,
  ClientPlatformLinks,
  ClientType,
} from '../../../types/clients';
import type { SupportedSaudiCity } from '../../../types/lead-search';
import {
  CLIENT_PLATFORM_LABELS,
  CLIENT_PLATFORM_OPTIONS,
  CLIENT_TYPE_OPTIONS,
} from '../constants';

export interface ClientFormValues {
  name: string;
  type: ClientType;
  city: SupportedSaudiCity;
  mobilePhone: string;
  whatsappNumber: string;
  email: string;
  notes: string;
  primaryPlatform: ClientPlatform;
  sourceUrl: string;
  platformLinks: ClientPlatformLinks;
}

interface ClientFormProps {
  initialValues: ClientFormValues;
  onSubmit: (values: ClientFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  lockPrimaryPlatform?: boolean;
  title?: string;
}

const withDefaultLinks = (links?: ClientPlatformLinks): ClientPlatformLinks => ({
  website: links?.website ?? '',
  facebook: links?.facebook ?? '',
  instagram: links?.instagram ?? '',
  snapchat: links?.snapchat ?? '',
  linkedin: links?.linkedin ?? '',
  x: links?.x ?? '',
  tiktok: links?.tiktok ?? '',
});

const normalizeUrlInput = (value?: string): string => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return trimmed.replace(/^(https?:\/\/),+/i, '$1');
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const ClientForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'حفظ',
  isSubmitting = false,
  isReadOnly = false,
  lockPrimaryPlatform = false,
  title,
}: ClientFormProps) => {
  const [values, setValues] = useState<ClientFormValues>({
    ...initialValues,
    platformLinks: withDefaultLinks(initialValues.platformLinks),
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setValues({
      ...initialValues,
      platformLinks: withDefaultLinks(initialValues.platformLinks),
    });
    setErrorMessage('');
  }, [initialValues]);

  const normalizedPlatformLinks = useMemo(() => {
    const links = withDefaultLinks(values.platformLinks);
    return {
      website: normalizeUrlInput(links.website),
      facebook: normalizeUrlInput(links.facebook),
      instagram: normalizeUrlInput(links.instagram),
      snapchat: normalizeUrlInput(links.snapchat),
      linkedin: normalizeUrlInput(links.linkedin),
      x: normalizeUrlInput(links.x),
      tiktok: normalizeUrlInput(links.tiktok),
    } as ClientPlatformLinks;
  }, [values.platformLinks]);

  const validate = () => {
    if (!values.name.trim()) return 'اسم العميل مطلوب';
    if (!values.city || (values.city as string) === 'all') return 'المدينة مطلوبة';
    if (!values.type) return 'نوع العميل مطلوب';
    if (!values.primaryPlatform) return 'المنصة الأساسية مطلوبة';
    const primaryPlatformLink = normalizeUrlInput(normalizedPlatformLinks[values.primaryPlatform]);
    if (!primaryPlatformLink) {
      return `رابط ${CLIENT_PLATFORM_LABELS[values.primaryPlatform]} مطلوب لأنه المنصة الأساسية`;
    }
    if (!isValidHttpUrl(primaryPlatformLink)) {
      return `رابط ${CLIENT_PLATFORM_LABELS[values.primaryPlatform]} غير صالح. استخدم رابطًا يبدأ بـ https://`;
    }

    for (const platform of CLIENT_PLATFORM_OPTIONS) {
      const value = normalizeUrlInput(normalizedPlatformLinks[platform.value]);
      if (value && !isValidHttpUrl(value)) {
        return `رابط ${platform.label} غير صالح. استخدم رابطًا صحيحًا مثل https://example.com`;
      }
    }

    const normalizedSourceUrl = normalizeUrlInput(values.sourceUrl);
    if (normalizedSourceUrl && !isValidHttpUrl(normalizedSourceUrl)) {
      return 'رابط المصدر غير صالح. استخدم رابطًا صحيحًا يبدأ بـ https://';
    }

    return '';
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isReadOnly || isSubmitting) return;

    const validationMessage = validate();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    const normalizedSourceUrl = normalizeUrlInput(values.sourceUrl);
    onSubmit({
      ...values,
      name: values.name.trim(),
      mobilePhone: values.mobilePhone.trim(),
      whatsappNumber: values.whatsappNumber.trim(),
      email: values.email.trim(),
      notes: values.notes.trim(),
      sourceUrl: normalizedSourceUrl,
      platformLinks: normalizedPlatformLinks,
    });
  };

  return (
    <form className="clients-form" onSubmit={handleSubmit}>
      {title && <h3 className="clients-section-title">{title}</h3>}

      {errorMessage && <div className="clients-inline-error">{errorMessage}</div>}

      <div className="clients-form-grid">
        <label className="clients-field">
          <span>الاسم *</span>
          <input
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            disabled={isReadOnly || isSubmitting}
            placeholder="اسم العميل"
          />
        </label>

        <label className="clients-field">
          <span>نوع العميل *</span>
          <select
            value={values.type}
            onChange={(e) => setValues((prev) => ({ ...prev, type: e.target.value as ClientType }))}
            disabled={isReadOnly || isSubmitting}
          >
            {CLIENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>المدينة *</span>
          <select
            value={values.city}
            onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value as SupportedSaudiCity }))}
            disabled={isReadOnly || isSubmitting}
          >
            {(values.city as string) === 'all' && (
              <option value="all">اختر المدينة...</option>
            )}
            {SAUDI_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>المنصة الأساسية *</span>
          <select
            value={values.primaryPlatform}
            onChange={(e) => setValues((prev) => ({ ...prev, primaryPlatform: e.target.value as ClientPlatform }))}
            disabled={isReadOnly || isSubmitting || lockPrimaryPlatform}
            title={lockPrimaryPlatform ? 'المنصة الأساسية قادمة من نتيجة البحث' : ''}
          >
            {CLIENT_PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="clients-field">
          <span>رقم الموبايل</span>
          <input
            value={values.mobilePhone}
            onChange={(e) => setValues((prev) => ({ ...prev, mobilePhone: e.target.value }))}
            disabled={isReadOnly || isSubmitting}
            dir="ltr"
            placeholder="+966..."
          />
        </label>

        <label className="clients-field">
          <span>واتساب</span>
          <input
            value={values.whatsappNumber}
            onChange={(e) => setValues((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
            disabled={isReadOnly || isSubmitting}
            dir="ltr"
            placeholder="+966..."
          />
        </label>

        <label className="clients-field">
          <span>الإيميل</span>
          <input
            value={values.email}
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
            disabled={isReadOnly || isSubmitting}
            dir="ltr"
            placeholder="name@example.com"
          />
        </label>

        <label className="clients-field">
          <span>رابط المصدر</span>
          <input
            value={values.sourceUrl}
            onChange={(e) => setValues((prev) => ({ ...prev, sourceUrl: e.target.value }))}
            disabled={isReadOnly || isSubmitting}
            dir="ltr"
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="clients-field">
        <span>ملاحظات</span>
        <textarea
          value={values.notes}
          onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
          disabled={isReadOnly || isSubmitting}
          placeholder="ملاحظات إضافية..."
          rows={3}
        />
      </label>

      <div className="clients-subsection">
        <h4>روابط المنصات</h4>
        <div className="clients-form-grid">
          {CLIENT_PLATFORM_OPTIONS.map((platform) => (
            <label key={platform.value} className="clients-field">
              <span>
                {platform.label}
                {values.primaryPlatform === platform.value ? ' *' : ''}
              </span>
              <input
                value={values.platformLinks[platform.value] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    platformLinks: {
                      ...prev.platformLinks,
                      [platform.value]: e.target.value,
                    },
                  }))
                }
                disabled={isReadOnly || isSubmitting}
                dir="ltr"
                placeholder="https://..."
              />
            </label>
          ))}
        </div>
      </div>

      <div className="clients-form-actions">
        {onCancel && (
          <button type="button" className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            إلغاء
          </button>
        )}
        <button
          type="submit"
          className="clients-btn clients-btn-primary"
          disabled={isReadOnly || isSubmitting}
          title={isReadOnly ? 'وضع مشاهدة فقط' : ''}
        >
          {isSubmitting ? 'جاري الحفظ...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
