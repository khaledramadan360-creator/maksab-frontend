import { useState, useEffect } from 'react';
import { systemSettingsApi } from '../../../services/api/system-settings';
import { AuthApiError } from '../../../services/api/auth';
import '../styles/system-settings.css';

const MAX_CHARS = 20000;

export const SystemSettingsPage = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await systemSettingsApi.getSettings();
      setPrompt(data.analysisGeminiSystemPrompt || '');
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        if (err.httpStatus === 401) setError('يرجى تسجيل الدخول أولاً');
        else if (err.httpStatus === 403) setError('ليس لديك صلاحية لعرض هذه الإعدادات');
        else setError(err.message || 'حدث خطأ أثناء جلب الإعدادات');
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (prompt.length > MAX_CHARS) {
      setError(`تجاوزت الحد الأقصى للمحارف (${MAX_CHARS})`);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payloadQuery = prompt.trim() === '' ? null : prompt.trim();
      const data = await systemSettingsApi.updateSettings({
        analysisGeminiSystemPrompt: payloadQuery
      });
      setPrompt(data.analysisGeminiSystemPrompt || '');
      setSuccessMsg('تم حفظ الإعدادات بنجاح! ✨');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        if (err.httpStatus === 422) setError('بيانات غير صالحة. يرجى التحقق وإعادة المحاولة.');
        else if (err.httpStatus === 401) setError('يرجى تسجيل الدخول أولاً');
        else if (err.httpStatus === 403) setError('ليس لديك صلاحية لتعديل الإعدادات');
        else setError(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
      } else {
        setError('فشل حفظ الإعدادات. حاول مرةأخرى.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sys-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h3 style={{ color: '#64748b' }}>جاري تحميل الإعدادات... ⏳</h3>
      </div>
    );
  }

  const charsLeft = MAX_CHARS - prompt.length;

  return (
    <div className="sys-container">
      <div className="sys-header">
        <h1 className="sys-title">إعدادات النظام المخفية</h1>
        <p className="sys-subtitle">إدارة الإعدادات المركزية وتوجيهات الذكاء الاصطناعي</p>
      </div>

      <div className="sys-card">
        <h2 className="sys-card-title">🤖 إعدادات تحليل الجيمناي (Gemini)</h2>
        
        <div className="sys-alert-info">
          <div>💡</div>
          <div>
            <strong>توجيه هام:</strong> هذا الإعداد يطبّق على التحليلات الجديدة فقط، أو عند إعادة تشغيل التحليل لعملاء سابقين.<br/>
            لن تتغير التقارير الموجودة مسبقاً بقاعدة البيانات. في حال تركه فارغاً، سيعود النظام للبرومبت الافتراضي המبرمج مسبقاً.
          </div>
        </div>

        {error && (
          <div className="sys-alert-info" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="sys-alert-success">
            <span>✅</span> {successMsg}
          </div>
        )}

        <div className="sys-form-group">
          <label className="sys-label">توجيه النظام (System Prompt)</label>
          <textarea
            className="sys-textarea"
            placeholder="أدخل برومبت التوجيه للذكاء الاصطناعي الخاص بالتحليل هنا... مثال: 'اكتب التحليل بنبرة تنفيذية مختصرة'"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError(null);
            }}
            disabled={isSaving}
          />
          <div className={`sys-character-count ${charsLeft < 0 ? 'error' : charsLeft < 500 ? 'warning' : ''}`}>
             المتبقي: <span dir="ltr">{charsLeft}</span> حرف 
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button 
            className="sys-btn" 
            onClick={handleSave} 
            disabled={isSaving || charsLeft < 0}
          >
            {isSaving ? 'جاري الحفظ ⏳...' : 'حفظ التعديلات 💾'}
          </button>
        </div>
      </div>
    </div>
  );
};
