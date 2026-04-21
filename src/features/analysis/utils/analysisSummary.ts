const SUMMARY_NOISE_PATTERNS: RegExp[] = [
  /javascript is disabled!?/gi,
  /please enable javascript in your web browser!?/gi,
  /website pagespeed insights signals?:?/gi,
  /pagespeed insights(?: signals?)?:?/gi,
  /\bmobile\b\s*scores?\s*[-–>]*\s*/gi,
  /\bmobil\b\s*[-–>]*\s*/gi,
  /naukrigulf/gi,
  /(?:performance|accessibility|best[\s_-]*practices|seo)\s*[:：]?\s*\d{1,3}(?:\s*\/\s*100)?/gi,
  /(?:الأداء|إمكانية الوصول|أفضل الممارسات|سيو|seo)\s*[:：]?\s*\d{1,3}(?:\s*\/\s*100)?/gi,
  /\b\d{1,3}\s*\/\s*100\b/g,
];

export const normalizeAnalysisSummary = (summary: string): string =>
  summary
    .replace(/\s+/g, ' ')
    .replace(/\s*([,:;،])/g, '$1 ')
    .replace(/\.{3,}/g, '... ')
    .trim();

export const cleanAnalysisSummary = (summary: string): string => {
  if (!summary) {
    return '';
  }

  let cleaned = normalizeAnalysisSummary(summary);
  SUMMARY_NOISE_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, ' ');
  });

  cleaned = cleaned
    .replace(/[|]+/g, ' ')
    .replace(/[,،]{2,}/g, '، ')
    .replace(/\.{3,}/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([,:;،])/g, '$1 ')
    .replace(/^[\s,.:;،-]+|[\s,.:;،-]+$/g, '')
    .trim();

  return /[A-Za-z\u0600-\u06FF]{3,}/.test(cleaned) ? cleaned : '';
};

export const cleanAnalysisListItems = (items: string[]): string[] =>
  items
    .map((item) => cleanAnalysisSummary(item))
    .filter((item): item is string => Boolean(item));
