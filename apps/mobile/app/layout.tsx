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
    <html lang="en">
      <body className="antialiased">
        <MintovaShell>{children}</MintovaShell>
      </body>
    </html>
  );
}
