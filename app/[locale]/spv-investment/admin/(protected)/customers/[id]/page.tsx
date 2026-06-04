// Admin-only page — returns 404 for all IDs except the placeholder in mobile static builds.
// dynamicParams=false ensures only pre-rendered paths are accessible.
export const dynamicParams = false;

export function generateStaticParams() {
  // Must return at least one entry for Next.js output:export to recognize this function.
  // Only this placeholder is pre-rendered; all other IDs return 404.
  return [{ id: '_' }];
}

export default function Page() {
  return null;
}
