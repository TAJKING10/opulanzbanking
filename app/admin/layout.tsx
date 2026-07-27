import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Opulanz Admin",
  description: "Opulanz Banking Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8f8]">{children}</body>
    </html>
  );
}
