type Status =
  | "pending"
  | "attesting"
  | "minting"
  | "complete"
  | "failed"
  | "approve_pending"
  | "approve_submitted"
  | "approve_confirmed";

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-[#FFB86B]/20 text-[#FFB86B]",
  attesting: "bg-[#8EA7FF]/20 text-[#8EA7FF]",
  minting: "bg-[#8EA7FF]/20 text-[#8EA7FF]",
  complete: "bg-[#7CFFB2]/20 text-[#7CFFB2]",
  failed: "bg-[#FF6B6B]/20 text-[#FF6B6B]",
  approve_pending: "bg-[#FFB86B]/20 text-[#FFB86B]",
  approve_submitted: "bg-[#8EA7FF]/20 text-[#8EA7FF]",
  approve_confirmed: "bg-[#7CFFB2]/20 text-[#7CFFB2]",
};

const STATUS_LABELS: Record<Status, string> = {
  pending: "Pending",
  attesting: "Attesting",
  minting: "Minting",
  complete: "Complete",
  failed: "Failed",
  approve_pending: "Approve pending",
  approve_submitted: "Approve submitted",
  approve_confirmed: "Approved",
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
