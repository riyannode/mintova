"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AmountInput({ value, onChange, placeholder = "0.00" }: Props) {
  return (
    <div
      className="relative flex items-center px-4 py-3 transition-all duration-200"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        step="0.01"
        className="flex-1 bg-transparent text-2xl font-semibold outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ color: "var(--text-primary)" }}
      />
      <span
        className="text-xs font-medium tracking-wider uppercase ml-2"
        style={{ color: "var(--text-muted)" }}
      >
        USDC
      </span>
    </div>
  );
}
