import { useMemo, useState } from 'react';
import { SAUDI_CITIES } from '../../lead-search/constants/saudi-cities';
import type { LeadSearchResultItem, SupportedSaudiCity } from '../../../types/lead-search';
import type { ClientPlatform, CreateClientFromSearchRequest } from '../../../types/clients';
import { ClientForm, type ClientFormValues } from './ClientForm';
import { DuplicateWarningDialog } from './DuplicateWarningDialog';
import { useCreateClientFromSearch } from '../hooks/useCreateClientFromSearch';
import { sanitizePlatformLinks } from '../utils/payload';

interface SaveClientFromSearchModalProps {
  result: LeadSearchResultItem;
  searchCity: SupportedSaudiCity;
  sourcePlatform: ClientPlatform;
  isReadOnly?: boolean;
  onClose: () => void;
  onSaved: (clientId: string) => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

const pickDisplayName = (result: LeadSearchResultItem): string => {
  return (
    result.displayNameOrName?.trim() ||
    result.extractedNameOrLabel?.trim() ||
    result.titleOrHeadline?.trim() ||
    result.title?.trim() ||
    'عميل جديد من البحث'
  );
};

const inferCity = (result: LeadSearchResultItem, fallbackCity: SupportedSaudiCity): SupportedSaudiCity => {
  const locationText = `${result.location ?? ''} ${result.extractedLocation ?? ''}`.toLowerCase();
  
  let matchedCity = SAUDI_CITIES.find((city) => locationText.includes(city.toLowerCase()));
  
  if (!matchedCity) {
    const arabicCities: Record<string, SupportedSaudiCity> = {
      'الرياض': 'Riyadh',
      'جدة': 'Jeddah',
      'مكة': 'Makkah',
      'مكة المكرمة': 'Makkah',
      'المدينة': 'Madinah',
      'المدينة المنورة': 'Madinah',
      'الدمام': 'Dammam',
      'الخبر': 'Khobar',
      'الظهران': 'Dhahran',
      'الطائف': 'Taif',
      'تبوك': 'Tabuk',
      'أبها': 'Abha',
      'ابها': 'Abha',
      'خميس مشيط': 'Khamis Mushait',
      'بريدة': 'Buraidah',
      'حائل': 'Hail',
      'حايل': 'Hail',
      'جازان': 'Jazan',
      'جيزان': 'Jazan',
      'نجران': 'Najran',
      'الأحساء': 'Al Ahsa',
      'الاحساء': 'Al Ahsa',
      'الهفوف': 'Al Ahsa',
      'ينبع': 'Yanbu',
      'الجبيل': 'Jubail'
    };
    
    for (const [arCity, enCity] of Object.entries(arabicCities)) {
      if (locationText.includes(arCity)) {
        matchedCity = enCity;
        break;
      }
    }
  }
  
  return matchedCity ?? fallbackCity;
};

const normalizeOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const buildInitialValues = (
  result: LeadSearchResultItem,
  fallbackCity: SupportedSaudiCity,
  sourcePlatform: ClientPlatform,
): ClientFormValues => {
  const canonicalUrl = result.canonicalUrl?.trim() ?? '';

  return {
    name: pickDisplayName(result),
    type: 'company',
    city: inferCity(result, fallbackCity),
    mobilePhone: '',
    whatsappNumber: '',
    email: '',
    notes: '',
    primaryPlatform: sourcePlatform,
    sourceUrl: canonicalUrl,
    platformLinks: {
      website: sourcePlatform === 'website' ? canonicalUrl : '',
      facebook: sourcePlatform === 'facebook' ? canonicalUrl : '',
      instagram: sourcePlatform === 'instagram' ? canonicalUrl : '',
      snapchat: sourcePlatform === 'snapchat' ? canonicalUrl : '',
      linkedin: sourcePlatform === 'linkedin' ? canonicalUrl : '',
      x: sourcePlatform === 'x' ? canonicalUrl : '',
      tiktok: sourcePlatform === 'tiktok' ? canonicalUrl : '',
    },
  };
};

export const SaveClientFromSearchModal = ({
  result,
  searchCity,
  sourcePlatform,
  isReadOnly = false,
  onClose,
  onSaved,
  onToast,
}: SaveClientFromSearchModalProps) => {
  const initialValues = useMemo(
    () => buildInitialValues(result, searchCity, sourcePlatform),
    [result, searchCity, sourcePlatform],
  );

  const [lastPayload, setLastPayload] = useState<CreateClientFromSearchRequest | null>(null);
  const {
    submit,
    isSaving,
    duplicateData,
    errorMessage,
    clearDuplicate,
    clearError,
  } = useCreateClientFromSearch();

  const createPayload = (values: ClientFormValues): CreateClientFromSearchRequest => {
    const sanitizedLinks = sanitizePlatformLinks(values.platformLinks);

    return {
      name: values.name,
      type: values.type,
      city: values.city,
      mobilePhone: normalizeOptional(values.mobilePhone),
      whatsappNumber: normalizeOptional(values.whatsappNumber),
      email: normalizeOptional(values.email),
      notes: normalizeOptional(values.notes),
      primaryPlatform: values.primaryPlatform,
      platformLinks: sanitizedLinks,
      sourcePlatform,
      sourceUrl:
        normalizeOptional(values.sourceUrl) ||
        sanitizedLinks[values.primaryPlatform] ||
        normalizeOptional(result.canonicalUrl) ||
        '',
      sourceQuery: result.sourceQuery,
    };
  };

  const handleSubmit = async (values: ClientFormValues) => {
    if (isReadOnly) return;

    clearError();
    const payload = createPayload(values);
    setLastPayload(payload);

    const resultState = await submit(payload);
    if (resultState.ok) {
      onToast('تم حفظ العميل بنجاح', 'success');
      onSaved(resultState.client.id);
      onClose();
      return;
    }

    if (!resultState.duplicate) {
      onToast(resultState.message, 'error');
    }
  };

  const handleForceCreate = async () => {
    if (!lastPayload) return;
    const resultState = await submit(lastPayload, true);
    if (resultState.ok) {
      clearDuplicate();
      onToast('تم حفظ العميل مع تجاوز التكرار', 'success');
      onSaved(resultState.client.id);
      onClose();
      return;
    }

    if (!resultState.duplicate) {
      onToast(resultState.message, 'error');
    }
  };

  return (
    <>
      <div className="clients-modal-overlay" onClick={onClose}>
        <div className="clients-modal-card lg" onClick={(event) => event.stopPropagation()}>
          {errorMessage && <div className="clients-inline-error">{errorMessage}</div>}

          <ClientForm
            title="حفظ العميل من نتيجة البحث"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="حفظ العميل"
            isSubmitting={isSaving}
            isReadOnly={isReadOnly}
            lockPrimaryPlatform
          />
        </div>
      </div>

      {duplicateData && (
        <DuplicateWarningDialog
          duplicateData={duplicateData}
          isLoading={isSaving}
          onCancel={clearDuplicate}
          onForceCreate={handleForceCreate}
        />
      )}
    </>
  );
};
