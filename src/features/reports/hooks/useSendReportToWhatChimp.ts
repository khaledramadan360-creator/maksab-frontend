import { useState } from 'react';
import { AuthApiError } from '../../../services/api/auth';
import {
  sendClientReportToWhatChimp,
} from '../../../services/api/reports';
import type {
  SendReportToWhatChimpAttempt,
  SendReportToWhatChimpRequest,
} from '../../../types/reports';

type SendResult =
  | { ok: true; data: SendReportToWhatChimpAttempt; message: string }
  | { ok: false; message: string; httpStatus?: number };

const FALLBACK_ERROR_BY_STATUS: Record<number, string> = {
  400: 'رقم الهاتف غير صالح.',
  403: 'ليس لديك صلاحية لإرسال التقرير.',
  404: 'العميل أو التقرير غير موجود.',
  409: 'ملف PDF غير متوفر لهذا التقرير.',
  422: 'بيانات الإرسال غير صالحة. راجع الحقول المطلوبة.',
  502: 'تم رفض الطلب من مزود WhatChimp.',
  503: 'خدمة WhatChimp غير متاحة حاليًا.',
  504: 'انتهت مهلة الاتصال بخدمة WhatChimp.',
};

const getSendErrorMessage = (error: unknown): { message: string; httpStatus?: number } => {
  if (error instanceof AuthApiError) {
    if (error.message?.trim()) {
      return { message: error.message.trim(), httpStatus: error.httpStatus };
    }
    if (error.httpStatus && FALLBACK_ERROR_BY_STATUS[error.httpStatus]) {
      return {
        message: FALLBACK_ERROR_BY_STATUS[error.httpStatus],
        httpStatus: error.httpStatus,
      };
    }
    return {
      message: 'تعذر إرسال التقرير عبر WhatChimp.',
      httpStatus: error.httpStatus,
    };
  }

  return { message: 'حدث خطأ غير متوقع أثناء إرسال التقرير.' };
};

export const useSendReportToWhatChimp = () => {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const send = async (
    clientId: string,
    payload: SendReportToWhatChimpRequest,
  ): Promise<SendResult> => {
    setIsSending(true);
    setErrorMessage('');

    try {
      const response = await sendClientReportToWhatChimp(clientId, payload);
      const message =
        response.message?.trim() || 'تم إرسال التقرير عبر WhatChimp بنجاح.';
      return { ok: true, data: response.data, message };
    } catch (error) {
      const normalized = getSendErrorMessage(error);
      setErrorMessage(normalized.message);
      return {
        ok: false,
        message: normalized.message,
        httpStatus: normalized.httpStatus,
      };
    } finally {
      setIsSending(false);
    }
  };

  return {
    send,
    isSending,
    errorMessage,
    clearError: () => setErrorMessage(''),
  };
};
