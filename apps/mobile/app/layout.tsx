import type { Metadata } from "next";
import "./globals.css";
import { MintovaShell } from "@/components/MintovaShell";

export const metadata: Metadata = {
  title: "Mintova",
  description: "Move stablecoins across chains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <MintovaShell>{children}</MintovaShell>
      </body>
    </html>
  );
}
