import PropertyEditPage from "./page-client";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

export const dynamicParams = !isStaticExport;

export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function Page() {
  return <PropertyEditPage />;
}
