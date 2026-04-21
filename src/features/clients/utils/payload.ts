import type { ClientPlatformLinks } from '../../../types/clients';

export const sanitizePlatformLinks = (links: ClientPlatformLinks): ClientPlatformLinks => {
  const sanitized: ClientPlatformLinks = {};

  (Object.entries(links) as Array<[keyof ClientPlatformLinks, string | undefined]>).forEach(([key, value]) => {
    const trimmed = value?.trim();
    if (trimmed) {
      sanitized[key] = trimmed;
    }
  });

  return sanitized;
};
