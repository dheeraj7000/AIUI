import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-white">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            AIUI
          </Link>
          <p className="mt-4 text-lg text-blue-100 leading-relaxed">
            Control how AI builds your UI. Pick a design system, get a config block, and Claude
            follows it everywhere.
          </p>
          <h2 className="mt-10 text-xl font-semibold">Design systems that work everywhere</h2>
          <ul className="mt-5 space-y-3 text-blue-100 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
              Consistent tokens across every AI tool
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
              One source of truth for your design system
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
              Works with Claude, Cursor, VS Code, and more
            </li>
          </ul>
          <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
            <span>190+ tokens</span>
            <span className="h-1 w-1 rounded-full bg-blue-300" />
            <span>57 components</span>
            <span className="h-1 w-1 rounded-full bg-blue-300" />
            <span>6 style packs</span>
            <span className="h-1 w-1 rounded-full bg-blue-300" />
            <span>12 MCP tools</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight lg:hidden">
              AIUI
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
