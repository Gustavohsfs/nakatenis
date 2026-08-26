import { SiteShell } from "@/components/layout/site-shell";

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteShell contentClassName="mx-auto w-full max-w-5xl">{children}</SiteShell>
  );
}
