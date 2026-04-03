import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AIUI</h1>
          <p className="mt-1 text-sm text-gray-500">AI-powered design platform</p>
        </div>
        <div className="rounded-xl shadow-sm border border-gray-200 bg-white p-8">{children}</div>
      </div>
    </div>
  );
}
