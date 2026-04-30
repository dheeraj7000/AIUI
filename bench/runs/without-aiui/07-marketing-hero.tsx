import * as React from 'react';

const LOGOS = ['Linear', 'Vercel', 'Cursor', 'Figma', 'Stripe'];

export default function MarketingHero() {
  return (
    <section
      className="relative overflow-hidden py-[80px] px-[24px]"
      style={{
        background:
          'radial-gradient(ellipse at top left, #FFE4E6 0%, transparent 50%), radial-gradient(ellipse at top right, #DBEAFE 0%, transparent 50%), #FFFFFF',
      }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[40px] items-center">
        <div className="lg:col-span-7">
          <span
            className="inline-flex items-center gap-[6px] px-[10px] py-[4px] text-[11.5px] font-semibold text-[#4338CA] bg-[#EEF2FF] rounded-[20px] mb-[20px]"
            style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            <span className="w-[5px] h-[5px] rounded-full bg-[#6366F1]" />
            New · v2 just shipped
          </span>

          <h1
            className="text-[56px] font-bold text-[#0B1020] mb-[18px] leading-[1.04]"
            style={{ letterSpacing: '-0.04em' }}
          >
            Ship beautiful UI <br />
            without the design <span className="text-[#6366F1]">debt</span>.
          </h1>

          <p className="text-[18px] text-[#475569] max-w-[520px] leading-[1.55] mb-[28px]">
            Acme is the design system that learns from your codebase and enforces it on every UI
            your AI writes — so the next 100 PRs don&apos;t drift from the first one.
          </p>

          <div className="flex flex-wrap items-center gap-[12px]">
            <button
              type="button"
              className="px-[22px] py-[12px] bg-[#0B1020] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#1E2438]"
            >
              Start free
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-[8px] px-[22px] py-[12px] text-[#0B1020] border border-[#CBD5E1] text-[15px] font-semibold rounded-[10px] hover:bg-[#F1F5F9]"
            >
              <span
                aria-hidden
                className="w-[20px] h-[20px] rounded-full bg-[#0B1020] text-white text-[10px] flex items-center justify-center"
              >
                ▶
              </span>
              Watch demo
            </button>
          </div>

          <div className="mt-[40px]">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#94A3B8] mb-[12px]">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center gap-x-[28px] gap-y-[8px]">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="text-[15px] font-semibold text-[#64748B] hover:text-[#0B1020]"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            className="border-[2px] border-[#0B1020] rounded-[14px] bg-white shadow-[0_25px_50px_-12px_rgba(11,16,32,0.20)] overflow-hidden"
            aria-hidden
          >
            <div className="flex items-center gap-[6px] px-[14px] py-[10px] border-b border-[#E2E8F0]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#F59E0B]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#22C55E]" />
            </div>
            <div className="p-[18px] grid grid-cols-3 gap-[10px]">
              <div className="col-span-2 h-[42px] bg-[#EEF2FF] rounded-[6px]" />
              <div className="h-[42px] bg-[#FCE7F3] rounded-[6px]" />
              <div className="col-span-3 h-[14px] bg-[#F1F5F9] rounded-[3px]" />
              <div className="col-span-3 h-[14px] bg-[#F1F5F9] rounded-[3px] w-[80%]" />
              <div className="col-span-3 h-[14px] bg-[#F1F5F9] rounded-[3px] w-[60%]" />
              <div className="col-span-3 h-[42px] bg-[#0B1020] rounded-[6px] mt-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
