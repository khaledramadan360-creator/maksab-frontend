import { useEffect, useMemo, useState } from 'react';
import type { ReportRecipientSource, SendReportToWhatChimpRequest } from '../../../types/reports';

interface SendReportToWhatChimpModalProps {
  clientName: string;
  whatsappPhone?: string | null;
  mobilePhone?: string | null;
  defaultRecipientName?: string;
  isLoadingContacts?: boolean;
  contactsErrorMessage?: string;
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

export const SendReportToWhatChimpModal = ({
  clientName,
  whatsappPhone = '',
  mobilePhone = '',
  defaultRecipientName = '',
  isLoadingContacts = false,
  contactsErrorMessage = '',
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

  const [recipientSource, setRecipientSource] = useState<ReportRecipientSource>(initialSource);
  const [customPhone, setCustomPhone] = useState('');
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [messageText, setMessageText] = useState('تقريرك جاهز');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setRecipientSource(initialSource);
  }, [initialSource]);

  useEffect(() => {
    setRecipientName(defaultRecipientName);
  }, [defaultRecipientName]);

  const resolvedPhone = useMemo(() => {
    if (recipientSource === 'whatsapp') return (whatsappPhone ?? '').trim();
    if (recipientSource === 'mobile') return (mobilePhone ?? '').trim();
    return customPhone.trim();
  }, [recipientSource, whatsappPhone, mobilePhone, customPhone]);

  const handleSubmit = () => {
    if (isReadOnly || isLoading) {
      return;
    }

    if (!resolvedPhone) {
      setValidationError('رقم المستلم مطلوب للإرسال.');
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
    });
  };

  const noAutoPhone =
    (recipientSource === 'whatsapp' && !(whatsappPhone ?? '').trim()) ||
    (recipientSource === 'mobile' && !(mobilePhone ?? '').trim());

  return (
    <div className="reports-modal-overlay" onClick={onCancel}>
      <div className="reports-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>إرسال التقرير عبر WhatChimp</h3>
        <p>
          سيتم إرسال التقرير الخاص بالعميل <strong>{clientName}</strong>.
        </p>

        {isReadOnly && (
          <p className="reports-modal-warning">
            وضع مشاهدة فقط: لا يمكنك إرسال التقرير.
          </p>
        )}

        {isLoadingContacts && (
          <p className="reports-modal-warning">جاري تحميل أرقام العميل...</p>
        )}

        {contactsErrorMessage && (
          <p className="reports-modal-warning">{contactsErrorMessage}</p>
        )}

        <div className="reports-send-form">
          <label className="reports-send-field">
            <span>مصدر الرقم</span>
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

          <label className="reports-send-field">
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
            {isLoading ? 'جاري الإرسال...' : 'إرسال عبر WhatChimp'}
          </button>
        </div>
      </div>
    </div>
  );
};
