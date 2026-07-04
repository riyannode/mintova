"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AmountInput({ value, onChange, placeholder = "0.00" }: Props) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        step="0.01"
        className="w-full bg-transparent text-4xl font-semibold text-[#F7F2E8] placeholder-[#8E929C] outline-none border-none pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[#8E929C] bg-[#181B22] px-2 py-1 rounded">
        USDC
      </span>
    </div>
  );
}
