import { SiteShell } from "@/components/layout/site-shell";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell withSidebar>{children}</SiteShell>;
}
