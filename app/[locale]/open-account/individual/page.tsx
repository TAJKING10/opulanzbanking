import dynamic from "next/dynamic";

const IndividualAccountContent = dynamic(
  () => import("./IndividualAccountContent"),
  { ssr: false }
);

export default function IndividualAccountPage() {
  return <IndividualAccountContent />;
}
