import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-center">
      <h1 className="text-8xl font-bold text-zinc-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-white">Page not found</h2>
      <p className="mt-2 text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-400"
      >
        Go Home
      </Link>
    </div>
  );
}
