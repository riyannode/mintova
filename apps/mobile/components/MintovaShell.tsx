import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function MintovaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0E1014] text-[#F7F2E8] flex flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
