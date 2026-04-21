import type { ClientPlatformAnalysis } from '../../../types/analysis';
import { AnalysisRecommendationsList } from './AnalysisRecommendationsList';
import { AnalysisStrengthsList } from './AnalysisStrengthsList';
import { AnalysisWeaknessesList } from './AnalysisWeaknessesList';
import {
  cleanAnalysisSummary,
  normalizeAnalysisSummary,
} from '../utils/analysisSummary';

const PLATFORM_LABELS: Record<ClientPlatformAnalysis['platform'], string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
};

interface PlatformAnalysisCardProps {
  platformAnalysis: ClientPlatformAnalysis;
}

type PlatformMetricKey =
  | 'performance'
  | 'accessibility'
  | 'bestPractices'
  | 'seo';

interface PlatformMetric {
  key: PlatformMetricKey;
  label: string;
  value: number;
}

const PLATFORM_METRICS_DEFS: Array<{
  key: PlatformMetricKey;
  label: string;
  pattern: RegExp;
}> = [
  {
    key: 'performance',
    label: 'الأداء',
    pattern: /(?:performance|الأداء)\s*[:：]?\s*(\d{1,3})(?:\s*\/\s*100)?/gi,
  },
  {
    key: 'accessibility',
    label: 'إمكانية الوصول',
    pattern: /(?:accessibility|إمكانية الوصول)\s*[:：]?\s*(\d{1,3})(?:\s*\/\s*100)?/gi,
  },
  {
    key: 'bestPractices',
    label: 'أفضل الممارسات',
    pattern:
      /(?:best[\s_-]*practices|أفضل الممارسات)\s*[:：]?\s*(\d{1,3})(?:\s*\/\s*100)?/gi,
  },
  {
    key: 'seo',
    label: 'SEO',
    pattern: /(?:seo)\s*[:：]?\s*(\d{1,3})(?:\s*\/\s*100)?/gi,
  },
];

const clampScore = (value: number): number => Math.max(0, Math.min(100, value));

const extractPlatformMetrics = (summary: string): PlatformMetric[] => {
  if (!summary) {
    return [];
  }

  return PLATFORM_METRICS_DEFS.flatMap((metricDef) => {
    const matches = [...summary.matchAll(metricDef.pattern)];
    if (!matches.length) {
      return [];
    }

    const values = matches
      .map((match) => Number.parseInt(match[1] ?? '', 10))
      .filter((value) => Number.isFinite(value))
      .map((value) => clampScore(value));

    if (!values.length) {
      return [];
    }

    return [
      {
        key: metricDef.key,
        label: metricDef.label,
        value: Math.max(...values),
      },
    ];
  });
};

const getMetricTone = (
  score: number,
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 90) {
    return 'excellent';
  }
  if (score >= 75) {
    return 'good';
  }
  if (score >= 55) {
    return 'fair';
  }
  return 'poor';
};

export const PlatformAnalysisCard = ({
  platformAnalysis,
}: PlatformAnalysisCardProps) => {
  const normalizedSummary = normalizeAnalysisSummary(platformAnalysis.summary || '');
  const platformMetrics = extractPlatformMetrics(normalizedSummary);
  const cleanedSummary = cleanAnalysisSummary(platformAnalysis.summary || '');

  return (
    <article className="analysis-platform-card">
      <header className="analysis-platform-head">
        <div>
          <h4>{PLATFORM_LABELS[platformAnalysis.platform]}</h4>
          <p dir="ltr">{platformAnalysis.platformUrl || '-'}</p>
        </div>
        <div className="analysis-platform-score">
          {Math.round(platformAnalysis.platformScore)}
        </div>
      </header>

      {platformMetrics.length ? (
        <section
          className="analysis-platform-metrics"
          aria-label="Platform quality metrics"
        >
          {platformMetrics.map((metric) => (
            <div
              key={metric.key}
              className={`analysis-platform-metric analysis-platform-metric--${getMetricTone(
                metric.value,
              )}`}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}/100</strong>
            </div>
          ))}
        </section>
      ) : null}

      <p className="analysis-platform-summary">
        {cleanedSummary ||
          (platformMetrics.length
            ? 'تم عرض مؤشرات الجودة بالأعلى.'
            : 'No summary available.')}
      </p>

      <div className="analysis-platform-lists">
        <AnalysisStrengthsList strengths={platformAnalysis.strengths} />
        <AnalysisWeaknessesList weaknesses={platformAnalysis.weaknesses} />
        <AnalysisRecommendationsList
          recommendations={platformAnalysis.recommendations}
        />
      </div>
    </article>
  );
};
