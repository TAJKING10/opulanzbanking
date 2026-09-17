import CustomerEditPage from "./page-client";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

/** Website must accept any customer id. Static APK export only pre-renders `new`. */
export const dynamicParams = !isStaticExport;

export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function Page() {
  return <CustomerEditPage />;
}
