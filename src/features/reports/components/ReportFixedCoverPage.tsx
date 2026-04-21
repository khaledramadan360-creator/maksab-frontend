const SERVICE_ITEMS = [
  { title: 'إعلانات مربحة', description: 'حملات مدفوعة تولد فرصًا بيعية حقيقية.' },
  { title: 'الظهور المحلي القوي', description: 'نتائج واضحة في البحث المحلي والمنصات.' },
  { title: 'زيادة التحويل', description: 'تحسين الصفحة والعرض لرفع معدل التحويل.' },
  { title: 'استراتيجية المحتوى', description: 'خطة محتوى موجهة ومنتظمة للنمو.' },
  { title: 'حضور رقمي احترافي', description: 'هوية رقمية متماسكة تعكس احترافك.' },
  { title: 'قياس مستمر للأداء', description: 'تتبع دقيق للمؤشرات والنتائج التشغيلية.' },
];

const STATS = [
  { value: '+500', label: 'مشروع ناجح', tone: 'green' as const },
  { value: '+5', label: 'سنوات خبرة', tone: 'blue' as const },
  { value: '+20', label: 'أداة تسويقية', tone: 'purple' as const },
  { value: '24/7', label: 'دعم متواصل', tone: 'orange' as const },
];

const WHY_ITEMS = [
  'رفع وضوح النشاط',
  'تحسين معدل التحويل',
  'خطة تشغيل 90 يوم',
  'منهج لفتح السوق',
];

const STEPS = [
  { no: '1', title: 'تشخيص رقمي', subtitle: 'فهم الوضع الحالي' },
  { no: '2', title: 'خطة تنفيذية', subtitle: 'أهداف واضحة' },
  { no: '3', title: 'تشغيل الحملات', subtitle: 'تنفيذ ومتابعة' },
  { no: '4', title: 'قياس وتطوير', subtitle: 'تحسين مستمر' },
];

export const ReportFixedCoverPage = () => {
  return (
    <section className="report-cover" aria-label="غلاف التقرير الثابت">
      <header className="report-cover-top">
        <span className="report-cover-small">نسخة تنفيذية ثابتة - MAKSAB</span>
      </header>

      <div className="report-cover-brand">
        <div className="report-cover-logo">
          <span className="logo-word">Maksab</span>
          <span className="logo-badge">M</span>
        </div>
      </div>

      <h1 className="report-cover-title">مكسب لخدمات الأعمال</h1>
      <p className="report-cover-subtitle">وكالة التسويق الرقمي المتخصصة</p>
      <p className="report-cover-note">تصميمك من الصفحة الأولى، حتى البيع في السطر الأخير</p>

      <div className="report-cover-intro">
        مكسب هي شريكك في بناء حضور رقمي احترافي يدعم قرار الشراء ويحوّل الاهتمام إلى نتائج أعمال.
      </div>

      <div className="report-cover-grid">
        {SERVICE_ITEMS.map((item) => (
          <article key={item.title} className="report-cover-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="report-cover-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className={`report-cover-stat ${stat.tone}`}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <section className="report-cover-why">
        <h2>لماذا مكسب هي الشريك المناسب؟</h2>
        <div className="report-cover-why-grid">
          {WHY_ITEMS.map((item) => (
            <div key={item} className="report-cover-why-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="report-cover-steps">
        <h2>كيف نبدأ سويًا؟</h2>
        <div className="report-cover-steps-line" />
        <div className="report-cover-steps-grid">
          {STEPS.map((step) => (
            <article key={step.no} className="report-cover-step">
              <span className="step-no">{step.no}</span>
              <h3>{step.title}</h3>
              <p>{step.subtitle}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};
