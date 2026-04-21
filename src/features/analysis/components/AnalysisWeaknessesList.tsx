import { cleanAnalysisListItems } from '../utils/analysisSummary';

interface AnalysisWeaknessesListProps {
  weaknesses: string[];
}

export const AnalysisWeaknessesList = ({
  weaknesses,
}: AnalysisWeaknessesListProps) => {
  const normalizedWeaknesses = cleanAnalysisListItems(weaknesses);

  return (
    <div className="analysis-list-block weaknesses">
      <h4>Weaknesses</h4>
      {normalizedWeaknesses.length === 0 ? (
        <p className="analysis-list-empty">No weaknesses were provided.</p>
      ) : (
        <ul>
          {normalizedWeaknesses.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
