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
    <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-w-[420px] p-5 space-y-4"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          boxShadow: "0 -30px 80px rgba(0,0,0,0.4)",
        }}
      >
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>

        <div className="space-y-2">
          {rows.map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px]" style={{ color: "var(--warning)" }}>
          Testnet transaction. Verify details before confirming.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
            style={{
              background: "var(--mint)",
              color: "#09090E",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {loading ? "Signing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
