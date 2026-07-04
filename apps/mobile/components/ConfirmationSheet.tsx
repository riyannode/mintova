"use client";

type Props = {
  title: string;
  rows: [string, string][];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmationSheet({ title, rows, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-sm bg-[#181B22] rounded-t-2xl border-t border-[#2A2E38] p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>

        <div className="space-y-2">
          {rows.map(([label, value], i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#8E929C]">{label}</span>
              <span className="text-[#F7F2E8] font-medium">{value}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#FFB86B]">
          Testnet transaction. Please verify details before confirming.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[#20242D] text-[#F7F2E8] font-medium border border-[#2A2E38]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#7CFFB2] text-[#0E1014] font-semibold hover:bg-[#7CFFB2]/90 transition disabled:opacity-40"
          >
            {loading ? "Signing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
