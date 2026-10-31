import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-serif", display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "VanHop — Rent a van in Tbilisi",
  description: "Rent a van in Tbilisi and unlock it from your phone. Insurance, unlimited kilometres, no counter queue.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {/*
        Extensions (password managers, ad blockers, Grammarly) inject attributes
        like `bis_skin_checked` into the DOM before React hydrates, which React
        then reports as a hydration mismatch. The markup itself is identical, so
        the warning is suppressed one level down rather than chased.
      */}
      <body suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
