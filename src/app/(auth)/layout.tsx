import { SiteShell } from "@/components/layout/site-shell";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteShell contentClassName="mx-auto w-full max-w-2xl py-4">{children}</SiteShell>
  );
}
