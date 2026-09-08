import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-gold">404</p>
      <h1 className="mb-4 text-3xl font-bold text-brand-dark md:text-4xl">Page not found</h1>
      <p className="mb-8 max-w-md text-brand-grayMed">
        The page you requested does not exist or has been moved. Return to the homepage to continue.
      </p>
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-gold px-6 font-semibold text-white transition-colors hover:bg-brand-goldDark"
      >
        Back to home
      </Link>
    </div>
  );
}
