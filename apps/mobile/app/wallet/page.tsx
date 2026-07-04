"use client";

import { LoginCard } from "@/components/LoginCard";
import { WalletPanel } from "@/components/WalletPanel";
import { useState } from "react";

export default function WalletPage() {
  // TODO: Connect to UCW session
  const [loggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginCard />;
  }

  return (
    <WalletPanel
      address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      balances={[
        { chain: "Arc Testnet", amount: "10.0" },
        { chain: "Ethereum Sepolia", amount: "5.0" },
      ]}
    />
  );
}
