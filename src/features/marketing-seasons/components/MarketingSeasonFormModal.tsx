import React, { useState, useEffect } from 'react';
import type { MarketingSeasonDto } from '../../../types/marketing-seasons';

interface MarketingSeasonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string | null }) => Promise<void>;
  initialData?: MarketingSeasonDto;
  isSubmitting: boolean;
  error: string | null;
}

export const MarketingSeasonFormModal: React.FC<MarketingSeasonFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({ 
      title: title.trim(), 
      description: description.trim() || null 
    });
  };

  return (
    <div className="ms-modal-overlay">
      <div className="ms-modal-content">
        <div className="ms-modal-header">
          <h3>{initialData ? 'تعديل الموسم التسويقي ✏️' : 'إضافة موسم تسويقي جديد ✨'}</h3>
          <button className="ms-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="ms-modal-body">
            {error && <div className="ms-alert ms-alert-error">⚠️ {error}</div>}
            
            <div className="ms-form-group">
              <label htmlFor="ms-title">عنوان الموسم <span style={{color:'var(--color-error)'}}>*</span></label>
              <input 
                id="ms-title"
                type="text" 
                className="ms-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="مثال: تخفيضات الجمعة البيضاء 2026"
                required 
              />
            </div>

            <div className="ms-form-group">
              <label htmlFor="ms-description">الوصف (اختياري)</label>
              <textarea 
                id="ms-description"
                className="ms-input" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="أضف أهداف وملاحظات الموسم هنا..."
              />
            </div>
          </div>
          
          <div className="ms-modal-footer">
            <button type="button" className="ms-btn ms-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              إلغاء ✖️
            </button>
            <button type="submit" className="ms-btn ms-btn-primary" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'جاري الحفظ ⏳...' : 'حفظ الموسم 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
