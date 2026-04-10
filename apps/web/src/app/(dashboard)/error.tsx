'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-zinc-700">Error</h1>
      <h2 className="mt-4 text-xl font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
      >
        Try Again
      </button>
    </div>
  );
}
