import OfferingDetailPage from "./page-client";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

export const dynamicParams = !isStaticExport;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <OfferingDetailPage />;
}
