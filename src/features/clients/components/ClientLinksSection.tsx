import type { ClientPlatformLinks } from '../../../types/clients';
import { CLIENT_PLATFORM_LABELS, CLIENT_PLATFORM_OPTIONS } from '../constants';

interface ClientLinksSectionProps {
  links: ClientPlatformLinks;
}

export const ClientLinksSection = ({ links }: ClientLinksSectionProps) => {
  const entries = CLIENT_PLATFORM_OPTIONS
    .map((platform) => ({
      platform: platform.value,
      label: CLIENT_PLATFORM_LABELS[platform.value],
      url: links[platform.value],
    }))
    .filter((entry) => Boolean(entry.url));

  return (
    <section className="clients-card">
      <h3 className="clients-section-title">روابط المنصات</h3>
      {entries.length === 0 ? (
        <p className="clients-muted">لا توجد روابط مضافة لهذا العميل.</p>
      ) : (
        <div className="clients-links-grid">
          {entries.map((entry) => (
            <a
              key={entry.platform}
              href={entry.url}
              target="_blank"
              rel="noreferrer noopener"
              className="clients-link-chip"
              title={entry.url}
            >
              <strong>{entry.label}</strong>
              <span>{entry.url}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};
