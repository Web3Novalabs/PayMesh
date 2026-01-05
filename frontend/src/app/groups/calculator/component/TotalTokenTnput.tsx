import { Input } from "@/components/ui/input";

interface TotalTokensInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TotalTokensInput({ value, onChange }: TotalTokensInputProps) {
  return (
    <div className="text-white md:p-8 pt-0  grid gap-6">
      <label className="text-xl md:text-2xl font-medium">Total Tokens</label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1000"
        className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
      />
    </div>
  );
}
