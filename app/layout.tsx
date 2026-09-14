import type { Metadata } from "next";
import "./globals.css";
import "../reference-ui/styles/tokens.css";
import "../reference-ui/styles/integration.css";

export const metadata: Metadata = {
  title: "Tovant V6 | Automotive services",
  description: "Find automotive professionals and manage every job with Tovant.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
