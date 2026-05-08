import type { ClientEmailCampaignRecipientDetails } from '../../../types/client-email-campaigns';

export const formatCampaignDateTime = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG');
};

export const hasConfirmedOpen = (recipient: ClientEmailCampaignRecipientDetails) =>
  recipient.openCount > 0 || Boolean(recipient.firstOpenedAt || recipient.lastOpenedAt);

export const hasClicked = (recipient: ClientEmailCampaignRecipientDetails) =>
  recipient.clickCount > 0 || Boolean(recipient.firstClickedAt || recipient.lastClickedAt);

export const hasBounced = (recipient: ClientEmailCampaignRecipientDetails) =>
  Boolean(recipient.bouncedAt || recipient.lastBounceType);

export const hasUnsubscribed = (recipient: ClientEmailCampaignRecipientDetails) =>
  Boolean(recipient.unsubscribedAt);

export const hasComplained = (recipient: ClientEmailCampaignRecipientDetails) =>
  Boolean(recipient.complainedAt);

export const hasDelivered = (recipient: ClientEmailCampaignRecipientDetails) =>
  Boolean(
    recipient.deliveredAt ||
      hasConfirmedOpen(recipient) ||
      hasClicked(recipient) ||
      hasUnsubscribed(recipient) ||
      hasComplained(recipient) ||
      recipient.lastEventType === 'delivered',
  );

export const matchesBooleanFilter = (
  filterValue: 'all' | 'yes' | 'no',
  predicate: boolean,
) => {
  if (filterValue === 'all') return true;
  if (filterValue === 'yes') return predicate;
  return !predicate;
};
