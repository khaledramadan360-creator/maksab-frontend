import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { bulkCreateClients } from '../../../services/api/clients';
import { SAUDI_CITIES } from '../../lead-search/constants/saudi-cities';
import { CLIENT_PLATFORM_OPTIONS, CLIENT_PLATFORM_LABELS } from '../constants';
import { AuthApiError } from '../../../services/api/auth';
import type {
  BulkClientItem,
  BulkCreateClientsRequest,
  BulkClientFailureItem,
  BulkCreateClientsResponse,
  ClientPlatform,
} from '../../../types/clients';
import type { SupportedSaudiCity } from '../../../types/lead-search';

interface BulkUploadModalProps {
  onCancel: () => void;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

interface LocalValidatedItem {
  rowIndex: number; // 0-based
  client: BulkClientItem;
  isValid: boolean;
  errors: string[];
}

const CITY_ARABIC_MAP: Record<string, SupportedSaudiCity> = {
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',
  'مكة': 'Makkah',
  'مكة المكرمة': 'Makkah',
  'المدينة': 'Madinah',
  'المدينة المنورة': 'Madinah',
  'الدمام': 'Dammam',
  'الخبر': 'Khobar',
  'الظهران': 'Dhahran',
  'الطائف': 'Taif',
  'تبوك': 'Tabuk',
  'أبها': 'Abha',
  'ابها': 'Abha',
  'خميس مشيط': 'Khamis Mushait',
  'بريدة': 'Buraidah',
  'حائل': 'Hail',
  'حايل': 'Hail',
  'جازان': 'Jazan',
  'جيزان': 'Jazan',
  'نجران': 'Najran',
  'الأحساء': 'Al Ahsa',
  'الاحساء': 'Al Ahsa',
  'الهفوف': 'Al Ahsa',
  'ينبع': 'Yanbu',
  'الجبيل': 'Jubail'
};

const PLATFORM_ARABIC_MAP: Record<string, ClientPlatform> = {
  'موقع': 'website',
  'موقع ويب': 'website',
  'ويب': 'website',
  'ويب سايت': 'website',
  'فيسبوك': 'facebook',
  'فيس': 'facebook',
  'انستجرام': 'instagram',
  'انستغرام': 'instagram',
  'انستقرام': 'instagram',
  'سناب': 'snapchat',
  'سناب شات': 'snapchat',
  'لينكد': 'linkedin',
  'لينكد ان': 'linkedin',
  'لينكدإن': 'linkedin',
  'اكس': 'x',
  'تويتر': 'x',
  'تيك توك': 'tiktok',
  'تيكتوك': 'tiktok'
};

const inferPlatformFromUrl = (url: string): ClientPlatform => {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('snapchat.com')) return 'snapchat';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'x';
  if (lower.includes('tiktok.com')) return 'tiktok';
  return 'website';
};

const formatUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const BulkUploadModal = ({ onCancel, onSuccess, isReadOnly = false }: BulkUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Parsing & Validation State
  const [parsedItems, setParsedItems] = useState<LocalValidatedItem[]>([]);
  const [parseError, setParseError] = useState('');
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [generalError, setGeneralError] = useState('');
  
  // Final Reports State
  const [uploadReport, setUploadReport] = useState<BulkCreateClientsResponse | null>(null);
  const [failedRowsForRetry, setFailedRowsForRetry] = useState<BulkClientItem[]>([]);

  // 1. Download Excel template
  const downloadTemplate = () => {
    const headers = [
      'اسم العميل',
      'النوع (فرد/شركة)',
      'المدينة',
      'المنصة الأساسية',
      'رابط المنصة الأساسية',
      'رقم الجوال',
      'واتساب',
      'الإيميل',
      'رابط المصدر',
      'ملاحظات',
      'رابط موقع ويب',
      'رابط فيسبوك',
      'رابط انستغرام',
      'رابط سناب شات',
      'رابط لينكد إن',
      'رابط تويتر X',
      'رابط تيك توك'
    ];
    
    const sampleData = [
      [
        'شركة النور للتجارة',
        'شركة',
        'الرياض',
        'موقع',
        'https://alnoor.com',
        '0501234567',
        '0501234567',
        'info@alnoor.com',
        'https://google.com',
        'عميل مهتم بالخدمات الإعلانية',
        'https://alnoor.com',
        '',
        '',
        '',
        '',
        '',
        ''
      ],
      [
        'محمد علي',
        'فرد',
        'جدة',
        'انستغرام',
        'https://instagram.com/mohamed_ali',
        '0559876543',
        '',
        '',
        '',
        'تم الحصول عليه من التواصل المباشر',
        '',
        '',
        'https://instagram.com/mohamed_ali',
        '',
        '',
        '',
        ''
      ]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    
    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 22 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب رفع العملاء');
    XLSX.writeFile(wb, 'maksab_clients_template.xlsx');
  };

  // 2. Download failure report
  const downloadErrorsReport = () => {
    if (!uploadReport) return;
    const failures = uploadReport.results.filter(r => r.status === 'failed') as BulkClientFailureItem[];
    if (failures.length === 0) return;

    const headers = [
      'الصف في Excel',
      'اسم العميل',
      'الجوال',
      'الإيميل',
      'كود الخطأ',
      'رسالة الخطأ'
    ];
    
    const rows = failures.map((f) => [
      f.rowIndex + 2,
      f.inputSnapshot?.name || 'غير محدد',
      f.inputSnapshot?.mobile || 'غير محدد',
      f.inputSnapshot?.email || 'غير محدد',
      f.error?.code || 'ERROR',
      f.error?.message || 'خطأ غير معروف'
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أخطاء الرفع');
    XLSX.writeFile(wb, 'upload_errors_report.xlsx');
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 3. Process and Parse File
  const processFile = (file: File) => {
    setFileName(file.name);
    setParseError('');
    setGeneralError('');
    setUploadReport(null);
    setFailedRowsForRetry([]);
    setParsedItems([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('فشل قراءة الملف');

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Read as 2D array to map headers dynamically
        const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        if (rawRows.length < 2) {
          throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات');
        }

        const headers = rawRows[0].map(h => String(h || '').trim());
        const dataRows = rawRows.slice(1);

        // Find column indexes based on keywords
        const getColIdx = (aliases: string[]): number => {
          return headers.findIndex(h => aliases.some(alias => h.toLowerCase() === alias.toLowerCase()));
        };

        const idxName = getColIdx(['اسم العميل', 'الاسم', 'Name', 'displayName']);
        const idxType = getColIdx(['النوع', 'Type', 'clientType', 'نوع العميل']);
        const idxCity = getColIdx(['المدينة', 'City', 'saudiCity', 'مدينة العميل', 'مدينة']);
        const idxPrimaryPlatform = getColIdx(['المنصة الأساسية', 'المنصة', 'Primary Platform', 'primaryPlatform']);
        const idxPrimaryLink = getColIdx(['رابط المنصة الأساسية', 'رابط المنصة', 'Primary URL', 'primaryPlatformLink']);
        const idxMobile = getColIdx(['رقم الجوال', 'الجوال', 'الموبايل', 'Mobile', 'Phone', 'mobile', 'هاتف']);
        const idxWhatsapp = getColIdx(['الواتساب', 'واتساب', 'واتس', 'Whatsapp', 'whatsapp']);
        const idxEmail = getColIdx(['الإيميل', 'البريد الإلكتروني', 'البريد', 'Email', 'email']);
        const idxSourceUrl = getColIdx(['رابط المصدر', 'المصدر', 'Source URL', 'sourceUrl']);
        const idxNotes = getColIdx(['ملاحظات', 'الملاحظات', 'Notes', 'notes']);
        
        // Link platforms
        const idxWeb = getColIdx(['رابط موقع ويب', 'رابط موقع', 'رابط الويب', 'websiteUrl']);
        const idxFb = getColIdx(['رابط فيسبوك', 'facebookUrl']);
        const idxIg = getColIdx(['رابط انستغرام', 'رابط انستجرام', 'رابط انستقرام', 'instagramUrl']);
        const idxSnap = getColIdx(['رابط سناب شات', 'رابط سناب', 'snapchatUrl']);
        const idxLn = getColIdx(['رابط لينكد إن', 'رابط لينكد ان', 'رابط لينكد', 'linkedinUrl']);
        const idxX = getColIdx(['رابط تويتر X', 'رابط تويتر', 'رابط اكس', 'xUrl']);
        const idxTk = getColIdx(['رابط تيك توك', 'tiktokUrl']);

        if (idxName === -1) {
          throw new Error('عمود "اسم العميل" أو "الاسم" غير موجود بالملف');
        }

        const items: LocalValidatedItem[] = [];

        dataRows.forEach((row, index) => {
          // Skip completely empty rows
          if (row.length === 0 || row.every(val => val === null || val === undefined || String(val).trim() === '')) {
            return;
          }

          const name = String(row[idxName] || '').trim();
          const rawType = String(row[idxType] || '').trim();
          const rawCity = String(row[idxCity] || '').trim();
          const rawPrimaryPlatform = String(row[idxPrimaryPlatform] || '').trim();
          const rawPrimaryLink = formatUrl(row[idxPrimaryLink]);
          const mobile = String(row[idxMobile] || '').trim() || null;
          const whatsapp = String(row[idxWhatsapp] || '').trim() || null;
          const email = String(row[idxEmail] || '').trim().toLowerCase() || null;
          const sourceUrl = formatUrl(row[idxSourceUrl]) || rawPrimaryLink || '';
          const notes = String(row[idxNotes] || '').trim() || null;

          // Local Validation list
          const localErrors: string[] = [];

          // 1. Name Check
          if (!name) {
            localErrors.push('اسم العميل مطلوب');
          }

          // 2. Type Check
          let clientType: 'person' | 'company' = 'company';
          if (rawType) {
            const lowerType = rawType.toLowerCase();
            if (lowerType === 'فرد' || lowerType === 'person' || lowerType === 'individual') {
              clientType = 'person';
            } else if (lowerType === 'شركة' || lowerType === 'company' || lowerType === 'business') {
              clientType = 'company';
            } else {
              localErrors.push(`نوع العميل "${rawType}" غير مدعوم (استخدم: فرد/شركة)`);
            }
          }

          // 3. City Check
          let saudiCity: SupportedSaudiCity = 'Riyadh';
          if (!rawCity) {
            localErrors.push('المدينة مطلوبة');
          } else {
            // Match city case-insensitive in EN or via Arabic map
            const matchedEn = SAUDI_CITIES.find(c => c.toLowerCase() === rawCity.toLowerCase());
            const matchedAr = CITY_ARABIC_MAP[rawCity];
            if (matchedEn) {
              saudiCity = matchedEn;
            } else if (matchedAr) {
              saudiCity = matchedAr;
            } else {
              localErrors.push(`المدينة "${rawCity}" غير مدعومة في نظام مكسب`);
            }
          }

          // 4. Platform and Link Check
          let primaryPlatform: ClientPlatform = 'website';
          if (rawPrimaryPlatform) {
            const matchedPlatform = CLIENT_PLATFORM_OPTIONS.find(p => p.value.toLowerCase() === rawPrimaryPlatform.toLowerCase());
            const matchedAr = PLATFORM_ARABIC_MAP[rawPrimaryPlatform];
            if (matchedPlatform) {
              primaryPlatform = matchedPlatform.value;
            } else if (matchedAr) {
              primaryPlatform = matchedAr;
            } else {
              localErrors.push(`المنصة "${rawPrimaryPlatform}" غير معروفة`);
            }
          } else if (rawPrimaryLink) {
            // Infer platform if not explicitly set but link is provided
            primaryPlatform = inferPlatformFromUrl(rawPrimaryLink);
          } else {
            localErrors.push('المنصة الأساسية مطلوبة (أو قم بإدخال رابط المنصة ليتم استنتاجها)');
          }

          if (!rawPrimaryLink) {
            localErrors.push('رابط المنصة الأساسية مطلوب');
          }

          // Platform Links Setup
          const links: Partial<Record<string, string | null>> = {};
          
          const addLink = (colIdx: number, key: string) => {
            if (colIdx !== -1 && row[colIdx]) {
              links[key] = formatUrl(row[colIdx]);
            }
          };

          addLink(idxWeb, 'websiteUrl');
          addLink(idxFb, 'facebookUrl');
          addLink(idxIg, 'instagramUrl');
          addLink(idxSnap, 'snapchatUrl');
          addLink(idxLn, 'linkedinUrl');
          addLink(idxX, 'xUrl');
          addLink(idxTk, 'tiktokUrl');

          // Ensure primary platform link is in the links object
          const platformKeyMap: Record<ClientPlatform, string> = {
            website: 'websiteUrl',
            facebook: 'facebookUrl',
            instagram: 'instagramUrl',
            snapchat: 'snapchatUrl',
            linkedin: 'linkedinUrl',
            x: 'xUrl',
            tiktok: 'tiktokUrl'
          };
          const primaryKey = platformKeyMap[primaryPlatform];
          if (rawPrimaryLink && !links[primaryKey]) {
            links[primaryKey] = rawPrimaryLink;
          }

          const clientItem: BulkClientItem = {
            name,
            clientType,
            saudiCity,
            primaryPlatform,
            sourcePlatform: primaryPlatform,
            sourceUrl,
            mobile,
            whatsapp,
            email,
            notes,
            sourceModule: 'manual',
            links
          };

          items.push({
            rowIndex: index,
            client: clientItem,
            isValid: localErrors.length === 0,
            errors: localErrors
          });
        });

        setParsedItems(items);
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'حدث خطأ أثناء قراءة ملف Excel');
      }
    };

    reader.onloadend = () => {
      // Clear input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 4. Upload clients in batches of 200
  const handleUpload = async (force: boolean = false) => {
    if (parsedItems.length === 0 || isReadOnly) return;

    // Filter valid clients (unless in force mode where we upload retry items)
    let clientsToUpload = force 
      ? failedRowsForRetry 
      : parsedItems.filter(item => item.isValid).map(item => item.client);

    if (clientsToUpload.length === 0) {
      setGeneralError('لا يوجد عملاء صالحين للرفع. يرجى تصحيح أخطاء الصفوف أولاً.');
      return;
    }

    setLoading(true);
    setGeneralError('');
    setUploadProgress(0);
    setUploadReport(null);

    const BATCH_SIZE = 200;
    const totalItems = clientsToUpload.length;
    const batchesCount = Math.ceil(totalItems / BATCH_SIZE);
    
    setTotalBatches(batchesCount);
    setCurrentBatch(0);

    const aggregatedResults: any[] = [];
    let aggregatedSummary = {
      total: 0,
      created: 0,
      failed: 0
    };

    try {
      for (let i = 0; i < batchesCount; i++) {
        setCurrentBatch(i + 1);
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, totalItems);
        const batchClients = clientsToUpload.slice(start, end);

        // Adjust index for display in aggregated results
        const reqPayload: BulkCreateClientsRequest = {
          clients: batchClients,
          forceCreateIfDuplicate: force
        };

        const res = await bulkCreateClients(reqPayload);
        const batchResults = res.data.results.map(r => ({
          ...r,
          // Recalculate rowIndex relative to the file if not force retry
          rowIndex: force ? r.rowIndex : start + r.rowIndex
        }));

        aggregatedResults.push(...batchResults);
        aggregatedSummary.total += res.data.summary.total;
        aggregatedSummary.created += res.data.summary.created;
        aggregatedSummary.failed += res.data.summary.failed;

        const progressPercent = Math.round(((i + 1) / batchesCount) * 100);
        setUploadProgress(progressPercent);
      }

      // Compile final report
      const finalReport: BulkCreateClientsResponse = {
        summary: aggregatedSummary,
        results: aggregatedResults
      };

      setUploadReport(finalReport);
      
      // Identify rows for retry (DUPLICATE_CLIENT errors)
      const duplicateFailures = aggregatedResults.filter(
        (r): r is BulkClientFailureItem => r.status === 'failed' && r.error.code === 'DUPLICATE_CLIENT'
      );
      
      const retryClients = duplicateFailures.map(fail => {
        // Re-construct the client payload item from parsedItems using rowIndex
        const originalParsed = parsedItems.find(p => p.rowIndex === fail.rowIndex);
        return originalParsed ? originalParsed.client : null;
      }).filter((c): c is BulkClientItem => c !== null);

      setFailedRowsForRetry(retryClients);

      if (aggregatedSummary.created > 0) {
        onSuccess(); // Trigger reload in list page
      }
    } catch (error) {
      setGeneralError(error instanceof AuthApiError ? error.message : 'حدث خطأ غير متوقع أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const validCount = parsedItems.filter(item => item.isValid).length;
  const invalidCount = parsedItems.filter(item => !item.isValid).length;

  return (
    <div className="clients-modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="clients-modal-card lg" onClick={(event) => event.stopPropagation()} style={{ color: '#0f172a' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <h3 className="clients-section-title" style={{ margin: 0 }}>الرفع الجماعي للعملاء (Excel / CSV)</h3>
          <button className="clients-btn clients-btn-ghost" onClick={onCancel} disabled={loading} style={{ padding: '0.3rem 0.6rem' }}>✖</button>
        </div>

        {/* Step 1: Upload and Template */}
        {parsedItems.length === 0 && !parseError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>تنزيل الملف المرجعي (Template)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>حمل هذا الملف لملئه بالبيانات مع الحفاظ على أسماء الأعمدة لتفادي الأخطاء.</p>
              </div>
              <button className="clients-btn clients-btn-ghost" onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📥 تحميل القالب
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              className={`clients-state ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed var(--color-cta)' : '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '2.5rem 1rem',
                background: dragActive ? '#f0f7ff' : '#f8fafc',
                cursor: 'pointer',
                transition: '0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>اسحب وأسقط ملف الـ Excel/CSV هنا</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>أو انقر هنا لتصفح الملفات من جهازك</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Local Parse Error */}
        {parseError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div className="clients-inline-error">{parseError}</div>
            <button className="clients-btn clients-btn-primary" onClick={() => { setParseError(''); setFileName(''); setParsedItems([]); }} style={{ alignSelf: 'flex-start' }}>
              اختر ملفاً آخر
            </button>
          </div>
        )}

        {/* Step 2: Local Parse Preview & Errors List */}
        {parsedItems.length > 0 && !uploadReport && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            
            {/* File Info Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.9rem' }}>
                الملف المختار: <strong>{fileName}</strong> (إجمالي الصفوف: <strong>{parsedItems.length}</strong>)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="client-badge client-badge-status-interested">صالح للرفع: {validCount}</span>
                {invalidCount > 0 && <span className="client-badge client-badge-status-not_interested">أخطاء التنسيق: {invalidCount}</span>}
              </div>
            </div>

            {/* Validation Warnings */}
            {invalidCount > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem', background: '#fff1f2' }}>
                <strong style={{ color: '#b91c1c', fontSize: '0.85rem' }}>صفوف تحتوي على أخطاء تنسيق (لن يتم رفعها تلقائياً):</strong>
                <ul style={{ margin: '0.3rem 0 0 0', paddingRight: '1.25rem', fontSize: '0.82rem', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {parsedItems.filter(item => !item.isValid).map((item) => (
                    <li key={item.rowIndex}>
                      Excel صف <strong>{item.rowIndex + 2}</strong> ({item.client.name || 'عميل بدون اسم'}): {item.errors.join('، ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>معاينة أول 5 عملاء صالحين:</strong>
              <div className="clients-table-wrap" style={{ border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '0.4rem', maxHeight: '180px' }}>
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.4rem' }}>الاسم</th>
                      <th style={{ padding: '0.4rem' }}>النوع</th>
                      <th style={{ padding: '0.4rem' }}>المدينة</th>
                      <th style={{ padding: '0.4rem' }}>المنصة الأساسية</th>
                      <th style={{ padding: '0.4rem' }}>رقم الجوال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.filter(item => item.isValid).slice(0, 5).map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '0.4rem' }}>{item.client.name}</td>
                        <td style={{ padding: '0.4rem' }}>{item.client.clientType === 'person' ? 'فرد' : 'شركة'}</td>
                        <td style={{ padding: '0.4rem' }}>{item.client.saudiCity}</td>
                        <td style={{ padding: '0.4rem' }}>{CLIENT_PLATFORM_LABELS[item.client.primaryPlatform]}</td>
                        <td style={{ padding: '0.4rem' }}>{item.client.mobile || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button className="clients-btn clients-btn-ghost" onClick={() => { setParsedItems([]); setFileName(''); }} disabled={loading}>
                إلغاء واختيار ملف آخر
              </button>
              <button className="clients-btn clients-btn-primary" onClick={() => handleUpload(false)} disabled={validCount === 0 || loading || isReadOnly}>
                رفع العملاء الصالحين ({validCount})
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Progress */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '999px', height: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, background: 'var(--color-cta)', height: '100%', transition: '0.2s ease' }} />
            </div>
            <strong style={{ color: 'var(--color-primary-dark)' }}>
              جاري رفع العملاء: دفعة {currentBatch} من {totalBatches} ({uploadProgress}%)
            </strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>يرجى عدم إغلاق هذه النافذة حتى اكتمال معالجة الطلبات.</p>
          </div>
        )}

        {/* General server error */}
        {generalError && (
          <div className="clients-inline-error" style={{ margin: '1rem 0' }}>{generalError}</div>
        )}

        {/* Step 4: Final Upload Report & Duplicates Retry */}
        {uploadReport && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
            
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>إجمالي العملاء</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{uploadReport.summary.total}</div>
              </div>
              <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#047857' }}>تم رفعهم بنجاح</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#065f46' }}>{uploadReport.summary.created}</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#b91c1c' }}>فشل الرفع</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#991b1b' }}>{uploadReport.summary.failed}</div>
              </div>
            </div>

            {/* List of Failure Items */}
            {uploadReport.summary.failed > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#b91c1c' }}>تفاصيل الصفوف التي فشل رفعها:</strong>
                  <button className="clients-btn clients-btn-ghost" onClick={downloadErrorsReport} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    📥 تصدير تقرير الأخطاء (Excel)
                  </button>
                </div>
                
                <div className="clients-table-wrap" style={{ border: '1px solid #fecaca', borderRadius: '8px', maxHeight: '200px' }}>
                  <table className="clients-table">
                    <thead>
                      <tr style={{ background: '#fef2f2' }}>
                        <th style={{ padding: '0.4rem', color: '#991b1b' }}>رقم الصف في Excel</th>
                        <th style={{ padding: '0.4rem', color: '#991b1b' }}>اسم العميل</th>
                        <th style={{ padding: '0.4rem', color: '#991b1b' }}>نوع الخطأ</th>
                        <th style={{ padding: '0.4rem', color: '#991b1b' }}>تفاصيل سبب الفشل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(uploadReport.results.filter(r => r.status === 'failed') as BulkClientFailureItem[]).map((f, i) => (
                        <tr key={i}>
                          <td style={{ padding: '0.4rem', fontWeight: 'bold' }}>{f.rowIndex + 2}</td>
                          <td style={{ padding: '0.4rem' }}>{f.inputSnapshot?.name || 'غير محدد'}</td>
                          <td style={{ padding: '0.4rem' }}>
                            <span className="client-badge client-badge-status-not_interested" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                              {f.error.code}
                            </span>
                          </td>
                          <td style={{ padding: '0.4rem', color: '#b91c1c', fontSize: '0.82rem' }}>{f.error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Duplicates Force Create Option */}
                {failedRowsForRetry.length > 0 && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '0.8rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
                      وجدنا <strong>{failedRowsForRetry.length}</strong> عميل تم تخطيهم بسبب وجودهم مسبقاً بقاعدة البيانات. 
                      هل ترغب في تجاوز التكرارات وإنشاءهم على أي حال؟
                    </div>
                    <button className="clients-btn clients-btn-danger" onClick={() => handleUpload(true)} disabled={isReadOnly} style={{ whiteSpace: 'nowrap' }}>
                      تجاوز التكرار وحفظ العملاء ({failedRowsForRetry.length})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="clients-btn clients-btn-ghost" onClick={() => { setParsedItems([]); setFileName(''); setUploadReport(null); }}>
                رفع ملف جديد
              </button>
              <button className="clients-btn clients-btn-primary" onClick={onCancel}>
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
