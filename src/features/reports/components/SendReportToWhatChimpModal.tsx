import { useEffect, useMemo, useState } from 'react';
import type {
  ReportRecipientSource,
  SendReportToWhatChimpRequest,
  WhatChimpPhoneNumberOption,
} from '../../../types/reports';

interface SendReportToWhatChimpModalProps {
  clientName: string;
  whatsappPhone?: string | null;
  mobilePhone?: string | null;
  defaultRecipientName?: string;
  isLoadingContacts?: boolean;
  contactsErrorMessage?: string;
  whatChimpPhoneNumberOptions?: WhatChimpPhoneNumberOption[];
  defaultWhatChimpPhoneNumberId?: string | null;
  isLoading?: boolean;
  isReadOnly?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (payload: SendReportToWhatChimpRequest) => void;
}

const pickDefaultSource = (
  whatsappPhone?: string | null,
  mobilePhone?: string | null,
): ReportRecipientSource => {
  if (whatsappPhone?.trim()) return 'whatsapp';
  if (mobilePhone?.trim()) return 'mobile';
  return 'custom';
};

const pickInitialWhatChimpSelection = ({
  options,
  defaultPhoneNumberId,
}: {
  options: WhatChimpPhoneNumberOption[];
  defaultPhoneNumberId?: string | null;
}): string => {
  const normalizedDefaultId = defaultPhoneNumberId?.trim();

  if (normalizedDefaultId && options.some((option) => option.id === normalizedDefaultId)) {
    return normalizedDefaultId;
  }

  const markedDefault = options.find((option) => option.isDefault);
  if (markedDefault) {
    return markedDefault.id;
  }

  if (options.length > 0) {
    return options[0].id;
  }

  return '';
};

export const SendReportToWhatChimpModal = ({
  clientName,
  whatsappPhone = '',
  mobilePhone = '',
  defaultRecipientName = '',
  isLoadingContacts = false,
  contactsErrorMessage = '',
  whatChimpPhoneNumberOptions = [],
  defaultWhatChimpPhoneNumberId = null,
  isLoading = false,
  isReadOnly = false,
  errorMessage = '',
  onCancel,
  onSubmit,
}: SendReportToWhatChimpModalProps) => {
  const initialSource = useMemo(
    () => pickDefaultSource(whatsappPhone, mobilePhone),
    [whatsappPhone, mobilePhone],
  );
  const initialWhatChimpSelection = useMemo(
    () =>
      pickInitialWhatChimpSelection({
        options: whatChimpPhoneNumberOptions,
        defaultPhoneNumberId: defaultWhatChimpPhoneNumberId,
      }),
    [whatChimpPhoneNumberOptions, defaultWhatChimpPhoneNumberId],
  );

  const [recipientSource, setRecipientSource] = useState<ReportRecipientSource>(initialSource);
  const [customPhone, setCustomPhone] = useState('');
  const [selectedWhatChimpPhoneNumberId, setSelectedWhatChimpPhoneNumberId] = useState(
    initialWhatChimpSelection,
  );
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [messageText, setMessageText] = useState('تقريرك جاهز');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setRecipientSource(initialSource);
  }, [initialSource]);

  useEffect(() => {
    setSelectedWhatChimpPhoneNumberId(initialWhatChimpSelection);
  }, [initialWhatChimpSelection]);

  useEffect(() => {
    setRecipientName(defaultRecipientName);
  }, [defaultRecipientName]);

  const resolvedPhone = useMemo(() => {
    if (recipientSource === 'whatsapp') return (whatsappPhone ?? '').trim();
    if (recipientSource === 'mobile') return (mobilePhone ?? '').trim();
    return customPhone.trim();
  }, [recipientSource, whatsappPhone, mobilePhone, customPhone]);

  const resolvedWhatChimpPhoneNumberId = useMemo(
    () => selectedWhatChimpPhoneNumberId.trim(),
    [selectedWhatChimpPhoneNumberId],
  );

  const noAutoPhone =
    (recipientSource === 'whatsapp' && !(whatsappPhone ?? '').trim()) ||
    (recipientSource === 'mobile' && !(mobilePhone ?? '').trim());

  const handleSubmit = () => {
    if (isReadOnly || isLoading) {
      return;
    }

    if (!resolvedPhone) {
      setValidationError('رقم المستلم مطلوب للإرسال.');
      return;
    }

    if (!resolvedWhatChimpPhoneNumberId) {
      setValidationError('اختيار رقم المرسل مطلوب.');
      return;
    }

    if (recipientName.trim().length > 255) {
      setValidationError('اسم المستلم يجب ألا يتجاوز 255 حرفًا.');
      return;
    }

    if (messageText.trim().length > 1024) {
      setValidationError('نص الرسالة يجب ألا يتجاوز 1024 حرفًا.');
      return;
    }

    setValidationError('');
    onSubmit({
      recipientPhone: resolvedPhone,
      recipientSource,
      recipientName: recipientName.trim() || undefined,
      messageText: messageText.trim() || undefined,
      whatchimpPhoneNumberId: resolvedWhatChimpPhoneNumberId || undefined,
    });
  };

  return (
    <div className="reports-modal-overlay" onClick={onCancel}>
      <div className="reports-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>إرسال التقرير عبر WhatChimp</h3>
        <p>
          سيتم إرسال التقرير الخاص بالعميل <strong>{clientName}</strong>.
        </p>

        <div className="reports-modal-note">
          <strong>مهم:</strong> `recipientPhone` هو رقم العميل المستلم، بينما
          `whatchimpPhoneNumberId` هو رقم حساب WhatChimp الذي سيتم الإرسال منه.
        </div>

        {isReadOnly && (
          <p className="reports-modal-warning">وضع مشاهدة فقط: لا يمكنك إرسال التقرير.</p>
        )}

        {isLoadingContacts && (
          <p className="reports-modal-warning">جارٍ تحميل أرقام العميل...</p>
        )}

        {contactsErrorMessage && <p className="reports-modal-warning">{contactsErrorMessage}</p>}

        <div className="reports-send-form">
          <div className="reports-send-section-title reports-send-field-full">
            رقم العميل المستلم
          </div>

          <label className="reports-send-field">
            <span>مصدر رقم المستلم</span>
            <select
              value={recipientSource}
              onChange={(event) => {
                setRecipientSource(event.target.value as ReportRecipientSource);
                setValidationError('');
              }}
              disabled={isReadOnly || isLoading}
            >
              <option value="whatsapp">واتساب العميل</option>
              <option value="mobile">موبايل العميل</option>
              <option value="custom">رقم مخصص</option>
            </select>
          </label>

          {recipientSource === 'custom' ? (
            <label className="reports-send-field">
              <span>رقم المستلم</span>
              <input
                type="tel"
                value={customPhone}
                onChange={(event) => {
                  setCustomPhone(event.target.value);
                  setValidationError('');
                }}
                placeholder="+9665XXXXXXXX"
                dir="ltr"
                disabled={isReadOnly || isLoading}
              />
            </label>
          ) : (
            <label className="reports-send-field">
              <span>الرقم المحدد</span>
              <input
                type="text"
                value={resolvedPhone}
                placeholder="لا يوجد رقم محفوظ لهذا المصدر"
                dir="ltr"
                readOnly
                disabled
              />
            </label>
          )}

          <div className="reports-send-section-title reports-send-field-full">
            حساب WhatChimp المستخدم للإرسال
          </div>

          <label className="reports-send-field reports-send-field-full">
            <span>اختر رقم/حساب WhatChimp</span>
            <select
              value={selectedWhatChimpPhoneNumberId}
              onChange={(event) => {
                setSelectedWhatChimpPhoneNumberId(event.target.value);
                setValidationError('');
              }}
              disabled={isReadOnly || isLoading}
            >
              {whatChimpPhoneNumberOptions.length > 0 ? (
                whatChimpPhoneNumberOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="">لا توجد خيارات مرسل متاحة</option>
              )}
            </select>
          </label>

          <label className="reports-send-field">
            <span>اسم المستلم (اختياري)</span>
            <input
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              maxLength={255}
              disabled={isReadOnly || isLoading}
            />
          </label>

          <label className="reports-send-field reports-send-field-full">
            <span>نص الرسالة (اختياري)</span>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              maxLength={1024}
              rows={3}
              disabled={isReadOnly || isLoading}
            />
          </label>
        </div>

        {noAutoPhone && (
          <p className="reports-modal-warning">
            لا يوجد رقم محفوظ لهذا المصدر. اختر "رقم مخصص" وأدخل الرقم يدويًا.
          </p>
        )}

        {(validationError || errorMessage) && (
          <p className="reports-modal-warning">{validationError || errorMessage}</p>
        )}

        <div className="reports-modal-actions">
          <button
            type="button"
            className="clients-btn clients-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="clients-btn clients-btn-primary"
            onClick={handleSubmit}
            disabled={isReadOnly || isLoading || isLoadingContacts || noAutoPhone}
          >
            {isLoading ? 'جارٍ الإرسال...' : 'إرسال عبر WhatChimp'}
          </button>
        </div>
      </div>
    </div>
  );
};
