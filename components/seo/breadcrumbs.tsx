import Link from 'next/link';

export function Breadcrumbs({
  locale,
  items,
}: {
  locale: string;
  items: { name: string; path: string }[];
}) {
  if (!items || items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-brand-grayLight bg-white/80">
      <ol className="container mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm text-brand-grayMed sm:px-6 lg:px-8">
        {items.map((item, index) => {
          const href = `/${locale}${item.path || ''}` || `/${locale}`;
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {last ? (
                <span className="font-medium text-brand-dark" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={href} className="hover:text-brand-gold">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
