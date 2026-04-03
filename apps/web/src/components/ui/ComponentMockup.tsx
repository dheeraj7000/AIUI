/**
 * ComponentMockup - Visual thumbnail previews for component recipe types.
 *
 * Renders a stylised mini-mockup (fixed 3:2 aspect ratio) that gives an
 * at-a-glance impression of what each component type looks like.  These are
 * NOT real component renders -- they are lightweight SVG-free Tailwind
 * illustrations used as thumbnails in the component browser.
 */

interface ComponentMockupProps {
  type: string;
  name: string;
  /** Optional pack-derived colors for theming the mockup. */
  colors?: {
    primary?: string;
    bg?: string;
    text?: string;
    accent?: string;
  };
  /** Render at a larger size (e.g. detail page hero). */
  large?: boolean;
}

export function ComponentMockup({ type, name, colors, large }: ComponentMockupProps) {
  const primary = colors?.primary ?? '#3B82F6';
  const accent = colors?.accent ?? colors?.primary ?? '#8B5CF6';

  const height = large ? 'h-[300px]' : 'h-[140px]';
  const nameSize = large ? 'text-sm' : 'text-[10px]';

  return (
    <div
      className={`relative w-full ${height} overflow-hidden rounded-lg border border-gray-200 bg-white`}
    >
      {/* Mockup content area */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <MockupBody type={type} primary={primary} accent={accent} />
      </div>

      {/* Component name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
        <span className={`block truncate font-medium text-white ${nameSize}`}>{name}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Per-type mockup bodies                                             */
/* ------------------------------------------------------------------ */

function MockupBody({ type, primary, accent }: { type: string; primary: string; accent: string }) {
  switch (type) {
    case 'hero':
      return <HeroMockup primary={primary} />;
    case 'pricing':
      return <PricingMockup primary={primary} />;
    case 'card':
      return <CardMockup primary={primary} />;
    case 'cta':
      return <CTAMockup primary={primary} />;
    case 'footer':
      return <FooterMockup />;
    case 'header':
      return <HeaderMockup primary={primary} />;
    case 'navigation':
      return <NavigationMockup primary={primary} />;
    case 'faq':
      return <FAQMockup primary={primary} />;
    case 'testimonial':
      return <TestimonialMockup primary={primary} />;
    case 'feature':
      return <FeatureMockup primary={primary} accent={accent} />;
    case 'contact':
      return <ContactMockup primary={primary} />;
    default:
      return <DefaultMockup primary={primary} />;
  }
}

/* -- Hero ----------------------------------------------------------- */
function HeroMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded">
      {/* Gradient banner ~60% */}
      <div
        className="flex flex-[6] items-end justify-center rounded-t"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${primary}99)`,
        }}
      >
        <div className="mb-2 flex flex-col items-center gap-1">
          <div className="h-1.5 w-16 rounded-full bg-white/80" />
          <div className="h-1 w-10 rounded-full bg-white/50" />
        </div>
      </div>
      {/* Bottom content area */}
      <div className="flex flex-[4] flex-col items-center justify-center gap-1.5 bg-gray-50/80">
        <div className="h-1.5 w-20 rounded-full bg-gray-200" />
        <div className="h-1 w-14 rounded-full bg-gray-200" />
        <div className="mt-1 h-3 w-10 rounded-sm" style={{ backgroundColor: primary }} />
      </div>
    </div>
  );
}

/* -- Pricing -------------------------------------------------------- */
function PricingMockup({ primary }: { primary: string }) {
  const columns = [
    { highlight: false, color: '#E5E7EB' },
    { highlight: true, color: primary },
    { highlight: false, color: '#E5E7EB' },
  ];

  return (
    <div className="flex h-full w-full items-end justify-center gap-1.5 pb-2">
      {columns.map((col, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-sm border"
          style={{
            width: '28%',
            height: col.highlight ? '85%' : '70%',
            borderColor: col.highlight ? primary : '#E5E7EB',
            backgroundColor: col.highlight ? `${primary}08` : 'white',
          }}
        >
          <div
            className="mt-2 h-1 w-3/5 rounded-full"
            style={{ backgroundColor: col.highlight ? primary : '#D1D5DB' }}
          />
          <div className="mt-1.5 h-2.5 w-2/5 rounded-full bg-gray-200" />
          <div className="mt-auto mb-2 flex flex-col items-center gap-0.5">
            <div className="h-0.5 w-3/5 rounded-full bg-gray-200" />
            <div className="h-0.5 w-3/5 rounded-full bg-gray-200" />
            <div className="h-0.5 w-2/5 rounded-full bg-gray-200" />
          </div>
          <div
            className="mb-2 h-2 w-3/5 rounded-sm"
            style={{ backgroundColor: col.highlight ? primary : '#D1D5DB' }}
          />
        </div>
      ))}
    </div>
  );
}

/* -- Card ----------------------------------------------------------- */
function CardMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex h-4/5 w-3/5 flex-col overflow-hidden rounded border border-gray-200">
        {/* Image placeholder strip */}
        <div className="flex-[4]" style={{ backgroundColor: `${primary}22` }}>
          <div
            className="h-full w-full opacity-60"
            style={{
              background: `linear-gradient(135deg, ${primary}44, ${primary}11)`,
            }}
          />
        </div>
        {/* Text bars */}
        <div className="flex flex-[3] flex-col justify-center gap-1 px-2">
          <div className="h-1.5 w-4/5 rounded-full bg-gray-300" />
          <div className="h-1 w-3/5 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/* -- CTA ------------------------------------------------------------ */
function CTAMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="flex h-3/4 w-4/5 flex-col items-center justify-center gap-2 rounded"
        style={{ backgroundColor: `${primary}15` }}
      >
        <div className="h-1.5 w-2/5 rounded-full" style={{ backgroundColor: `${primary}55` }} />
        <div className="h-1 w-1/4 rounded-full bg-gray-200" />
        <div className="mt-1 h-3.5 w-1/4 rounded-sm" style={{ backgroundColor: primary }} />
      </div>
    </div>
  );
}

/* -- Footer --------------------------------------------------------- */
function FooterMockup() {
  return (
    <div className="flex h-full w-full flex-col justify-end">
      {/* Spacer */}
      <div className="flex-1 bg-gray-50/50" />
      {/* Footer strip */}
      <div className="flex h-2/5 items-start justify-center gap-4 bg-gray-800 px-3 pt-2">
        {[0, 1, 2, 3].map((col) => (
          <div key={col} className="flex flex-col gap-0.5">
            <div className="mb-0.5 h-1 w-5 rounded-full bg-gray-500" />
            <div className="h-0.5 w-4 rounded-full bg-gray-600" />
            <div className="h-0.5 w-3 rounded-full bg-gray-600" />
            <div className="h-0.5 w-4 rounded-full bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- Header --------------------------------------------------------- */
function HeaderMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Header strip */}
      <div className="flex h-5 items-center justify-between border-b border-gray-200 bg-white px-2">
        {/* Logo placeholder */}
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primary }} />
        {/* Nav dots */}
        <div className="flex gap-1">
          <div className="h-1 w-3 rounded-full bg-gray-300" />
          <div className="h-1 w-3 rounded-full bg-gray-300" />
          <div className="h-1 w-3 rounded-full bg-gray-300" />
        </div>
      </div>
      {/* Page body */}
      <div className="flex flex-1 items-center justify-center bg-gray-50/60">
        <div className="h-1 w-12 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

/* -- Navigation ----------------------------------------------------- */
function NavigationMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Nav bar */}
      <div className="flex h-6 items-center gap-1.5 border-b border-gray-200 bg-white px-2">
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primary }} />
        <div className="mx-1 h-3 w-px bg-gray-200" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 rounded-full"
            style={{
              width: i === 0 ? 12 : 8,
              backgroundColor: i === 0 ? primary : '#D1D5DB',
            }}
          />
        ))}
        <div className="ml-auto h-2 w-5 rounded-sm" style={{ backgroundColor: primary }} />
      </div>
      {/* Page body */}
      <div className="flex flex-1 items-center justify-center bg-gray-50/60">
        <div className="flex flex-col items-center gap-1">
          <div className="h-1 w-14 rounded-full bg-gray-200" />
          <div className="h-0.5 w-10 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

/* -- FAQ ------------------------------------------------------------ */
function FAQMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex w-full items-center justify-between rounded border border-gray-200 bg-white px-2 py-1"
        >
          <div className="h-1 rounded-full bg-gray-300" style={{ width: `${45 + i * 8}%` }} />
          {/* Chevron */}
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="shrink-0">
            <path d="M1 2L3 4L5 2" stroke={i === 0 ? primary : '#9CA3AF'} strokeWidth="1" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* -- Testimonial ---------------------------------------------------- */
function TestimonialMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
      {/* Quote icon */}
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <path
          d="M0 7.2C0 3.6 2.1 0.9 5.4 0L6 1.2C3.6 2.1 2.7 3.6 2.7 5.1H5.4V12H0V7.2ZM7.8 7.2C7.8 3.6 9.9 0.9 13.2 0L13.8 1.2C11.4 2.1 10.5 3.6 10.5 5.1H13.2V12H7.8V7.2Z"
          fill={`${primary}44`}
        />
      </svg>
      {/* Text bars */}
      <div className="h-1 w-3/5 rounded-full bg-gray-200" />
      <div className="h-1 w-2/5 rounded-full bg-gray-200" />
      {/* Avatar */}
      <div className="mt-1 flex items-center gap-1">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `${primary}33` }} />
        <div className="h-0.5 w-6 rounded-full bg-gray-300" />
      </div>
    </div>
  );
}

/* -- Feature -------------------------------------------------------- */
function FeatureMockup({ primary, accent }: { primary: string; accent: string }) {
  const colors = [primary, accent, `${primary}88`, `${accent}88`];
  return (
    <div className="flex h-full w-full items-center justify-center px-3">
      <div className="grid h-4/5 w-full grid-cols-2 gap-1.5">
        {colors.map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded border border-gray-100 bg-gray-50/60"
          >
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `${c}33` }} />
            <div className="mt-1 h-0.5 w-3/5 rounded-full bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- Contact -------------------------------------------------------- */
function ContactMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <div className="flex h-4/5 w-4/5 flex-col items-center justify-center gap-1.5">
        {/* Input fields */}
        <div className="flex w-full gap-1">
          <div className="h-2.5 flex-1 rounded-sm border border-gray-200 bg-gray-50" />
          <div className="h-2.5 flex-1 rounded-sm border border-gray-200 bg-gray-50" />
        </div>
        <div className="h-2.5 w-full rounded-sm border border-gray-200 bg-gray-50" />
        {/* Textarea */}
        <div className="h-6 w-full rounded-sm border border-gray-200 bg-gray-50" />
        {/* Button */}
        <div
          className="mt-0.5 h-3 w-1/3 self-end rounded-sm"
          style={{ backgroundColor: primary }}
        />
      </div>
    </div>
  );
}

/* -- Default / fallback --------------------------------------------- */
function DefaultMockup({ primary }: { primary: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${primary}15` }}
      >
        <div className="h-4 w-4 rounded" style={{ backgroundColor: `${primary}44` }} />
      </div>
      <div className="h-1.5 w-12 rounded-full bg-gray-200" />
      <div className="h-1 w-8 rounded-full bg-gray-200" />
    </div>
  );
}
