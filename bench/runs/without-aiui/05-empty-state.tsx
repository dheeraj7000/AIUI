import * as React from 'react';

export default function EmptyState() {
  return (
    <div
      className="flex items-center justify-center min-h-[480px] px-[24px]"
      style={{ background: 'radial-gradient(circle at top, #F0F9FF 0%, #FFFFFF 60%)' }}
    >
      <div className="text-center max-w-[420px]">
        <div
          className="mx-auto mb-[20px] w-[88px] h-[88px] rounded-[20px] bg-gradient-to-br from-[#DBEAFE] to-[#FCE7F3] flex items-center justify-center text-[40px]"
          aria-hidden
        >
          📂
        </div>
        <h2
          className="text-[24px] font-bold text-[#0F172A] mb-[8px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          No projects yet
        </h2>
        <p className="text-[15px] text-[#64748B] leading-[1.55] mb-[24px]">
          A project is where your design tokens, components, and AI-generated UIs live together.
          Create one to give your AI editor a home.
        </p>
        <div className="flex flex-col sm:flex-row gap-[10px] items-center justify-center">
          <button
            type="button"
            className="px-[20px] py-[11px] bg-[#0F172A] text-white rounded-[8px] font-medium text-[14px] hover:bg-[#1E293B]"
          >
            Create your first project
          </button>
          <button
            type="button"
            className="px-[20px] py-[11px] text-[#0F172A] border border-[#CBD5E1] rounded-[8px] font-medium text-[14px] hover:bg-[#F1F5F9]"
          >
            Read the docs
          </button>
        </div>
        <p className="mt-[20px] text-[12.5px] text-[#94A3B8]">
          Trusted by 3,200+ teams shipping AI-written UI
        </p>
      </div>
    </div>
  );
}
