import React from 'react';
import type { SearchPlatform } from '../../../types/lead-search';
import { PLATFORMS_LIST } from '../constants/platforms';

interface PlatformSelectorProps {
  selectedPlatforms: SearchPlatform[];
  onChange: (platforms: SearchPlatform[]) => void;
  disabled?: boolean;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatforms, onChange, disabled }) => {
  const togglePlatform = (platformId: SearchPlatform) => {
    if (disabled) return;

    if (selectedPlatforms.includes(platformId)) {
      onChange(selectedPlatforms.filter((id) => id !== platformId));
      return;
    }

    onChange([...selectedPlatforms, platformId]);
  };

  return (
    <div>
      <label className="ls-label">المنصات المستهدفة (اختر واحدة على الأقل)</label>
      <div className="ls-platform-grid">
        {PLATFORMS_LIST.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const isDisabled = Boolean(disabled);

          let cardClasses = 'ls-platform-card';
          if (isDisabled) cardClasses += ' is-disabled';
          if (isSelected) cardClasses += ' is-selected';

          return (
            <label key={platform.id} className={cardClasses}>
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => togglePlatform(platform.id)}
              />

              <div className="ls-platform-header">
                <span className="ls-platform-icon" aria-hidden="true">{platform.iconPlaceholder}</span>
                {isSelected ? (
                  <div className="ls-platform-check">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="ls-platform-radio"></div>
                )}
              </div>

              <div>
                <span className="ls-platform-name">{platform.label}</span>
                <span className="ls-platform-desc">{platform.description}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
