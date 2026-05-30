import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Onchain Holdings",
    template: "%s | Onchain Holdings",
  },
  description: "A crypto holding company building the largest onchain community through brands, IP, and consumer infrastructure.",
};

export const viewport: Viewport = {
  themeColor: "#1e2330",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ScrollProgress />
        <NavBar />
        <PageTransition>
          <main id="main" className="min-h-screen pt-20">
            {children}
          </main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
