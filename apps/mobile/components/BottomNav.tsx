"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/bridge", label: "Bridge" },
  { href: "/swap", label: "Swap" },
  { href: "/agent", label: "Agent" },
  { href: "/activity", label: "Activity" },
  { href: "/wallet", label: "Wallet" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181B22] border-t border-[#2A2E38] flex justify-around py-2 z-50">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded transition ${
              active ? "text-[#7CFFB2]" : "text-[#8E929C] hover:text-[#F7F2E8]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
