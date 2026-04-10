// Auth pages have their own full-page layout (no header/footer)
// They override the parent locale layout's children slot
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
