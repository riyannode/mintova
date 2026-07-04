"use client";

export function LoginCard() {
  return (
    <div className="w-full max-w-sm bg-[#181B22] rounded-2xl border border-[#2A2E38] p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">Sign in to Mintova</h2>
      <p className="text-sm text-[#8E929C] text-center">
        Move stablecoins across chains
      </p>
      <div className="space-y-3">
        <button className="w-full py-3 rounded-xl bg-[#7CFFB2] text-[#0E1014] font-semibold hover:bg-[#7CFFB2]/90 transition">
          Continue with Google
        </button>
        <button className="w-full py-3 rounded-xl bg-[#20242D] text-[#F7F2E8] font-medium border border-[#2A2E38] hover:border-[#8EA7FF] transition">
          Continue with Email
        </button>
        <button className="w-full py-3 rounded-xl bg-transparent text-[#8E929C] font-medium border border-[#2A2E38] hover:text-[#F7F2E8] transition">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
