import type { WhatChimpPhoneNumberOption } from '../../../types/reports';

export const FRONTEND_WHATCHIMP_SENDER_OPTIONS: WhatChimpPhoneNumberOption[] = [
  {
    id: '+966549483112',
    name: 'maksab',
    phoneNumber: '+966549483112',
    label: 'maksab (+966549483112)',
    isDefault: true,
  },
  {
    id: '+966115004605',
    name: 'maksab',
    phoneNumber: '+966115004605',
    label: 'maksab (+966115004605)',
    isDefault: false,
  },
  {
    id: '+966569038872',
    name: 'Tadween',
    phoneNumber: '+966569038872',
    label: 'Tadween (+966569038872)',
    isDefault: false,
  },
];

export const FRONTEND_WHATCHIMP_DEFAULT_SENDER_ID =
  FRONTEND_WHATCHIMP_SENDER_OPTIONS.find((option) => option.isDefault)?.id ?? null;
