import { cleanAnalysisListItems } from '../utils/analysisSummary';

interface AnalysisStrengthsListProps {
  strengths: string[];
}

export const AnalysisStrengthsList = ({
  strengths,
}: AnalysisStrengthsListProps) => {
  const normalizedStrengths = cleanAnalysisListItems(strengths);

  return (
    <div className="analysis-list-block strengths">
      <h4>Strengths</h4>
      {normalizedStrengths.length === 0 ? (
        <p className="analysis-list-empty">No strengths were provided.</p>
      ) : (
        <ul>
          {normalizedStrengths.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
