type Status = "pending" | "attesting" | "minting" | "complete" | "failed";

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-[#FFB86B]/20 text-[#FFB86B]",
  attesting: "bg-[#8EA7FF]/20 text-[#8EA7FF]",
  minting: "bg-[#8EA7FF]/20 text-[#8EA7FF]",
  complete: "bg-[#7CFFB2]/20 text-[#7CFFB2]",
  failed: "bg-[#FF6B6B]/20 text-[#FF6B6B]",
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
