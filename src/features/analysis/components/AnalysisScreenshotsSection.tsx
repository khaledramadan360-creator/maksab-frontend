import type { ClientAnalysisScreenshot } from '../../../types/analysis';
import { PlatformScreenshotCard } from './PlatformScreenshotCard';

interface AnalysisScreenshotsSectionProps {
  screenshots: ClientAnalysisScreenshot[];
  isPreviewMode?: boolean;
}

export const AnalysisScreenshotsSection = ({
  screenshots,
  isPreviewMode = false,
}: AnalysisScreenshotsSectionProps) => {
  return (
    <section className="analysis-screenshots-section">
      <header className="analysis-screenshots-header">
        <h4>لقطات المنصات</h4>
        <p>
          {isPreviewMode
            ? 'معاينة شكل القسم فقط في وضع المشاهدة.'
            : 'عرض آخر لقطات تم التقاطها من المنصات المرتبطة بالعميل.'}
        </p>
      </header>

      {screenshots.length === 0 ? (
        <div className="analysis-state analysis-empty">
          <p>لا توجد لقطات منصات متاحة حاليًا.</p>
        </div>
      ) : (
        <div className="analysis-screenshot-grid">
          {screenshots.map((screenshot, index) => (
            <PlatformScreenshotCard
              key={`${screenshot.platform}-${screenshot.publicUrl ?? screenshot.platformUrl}-${index}`}
              screenshot={screenshot}
              isPreviewMode={isPreviewMode}
            />
          ))}
        </div>
      )}
    </section>
  );
};
