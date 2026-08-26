import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { CartHydrator } from "@/components/layout/header-actions";
import { JsonLd } from "@/lib/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import {
  metadataBase,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE_NAME} — Raquetes, calçados e roupas de tênis e beach tennis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "raquete de beach tennis",
    "raquete de tênis",
    "tênis de quadra",
    "artigos esportivos",
    "loja de tênis Santa Fé do Sul",
  ],
  authors: [{ name: SITE_NAME }],
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0B2545",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-dvh bg-surface-alt font-sans antialiased">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SessionProvider>
          <CartHydrator />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
