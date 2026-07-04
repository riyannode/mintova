"use client";

import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { WebGLBackground } from "./WebGLBackground";
import { ThemeProvider } from "./ThemeProvider";

export function MintovaShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
        <WebGLBackground />
        <Header />
        <main className="relative z-10 flex-1 flex items-start justify-center px-4 pt-6 pb-24">
          {children}
        </main>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
