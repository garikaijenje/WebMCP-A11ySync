import type { Metadata } from "next";
import "./globals.css";
import { A11ySyncClientProvider } from "@/components/A11ySyncClientProvider";

export const metadata: Metadata = {
  title: "CareNavigator Portal | WebMCP-A11ySync Showcase",
  description: "Accessible patient clinic triage and prescription refill portal powered by WebMCP-A11ySync bi-directional runtime."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-sky-200 selection:text-sky-900">
        {/* WCAG Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main patient portal content
        </a>

        <A11ySyncClientProvider>
          {children}
        </A11ySyncClientProvider>
      </body>
    </html>
  );
}
