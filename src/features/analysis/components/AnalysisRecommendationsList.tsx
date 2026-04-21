import { cleanAnalysisListItems } from '../utils/analysisSummary';

interface AnalysisRecommendationsListProps {
  recommendations: string[];
}

export const AnalysisRecommendationsList = ({
  recommendations,
}: AnalysisRecommendationsListProps) => {
  const normalizedRecommendations = cleanAnalysisListItems(recommendations);

  return (
    <div className="analysis-list-block recommendations">
      <h4>Recommendations</h4>
      {normalizedRecommendations.length === 0 ? (
        <p className="analysis-list-empty">No recommendations were provided.</p>
      ) : (
        <ul>
          {normalizedRecommendations.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
