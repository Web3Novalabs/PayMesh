import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

interface RecipientItemProps {
  recipient: Recipient;
  percentage: string;
  onUpdateAddress: (address: string) => void;
  onUpdateAmount: (amount: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

interface Recipient {
  id: number;
  address: string;
  amount: string;
}

interface RecipientsListProps {
  recipients: Recipient[];
  onUpdateAddress: (id: number, address: string) => void;
  onUpdateAmount: (id: number, amount: string) => void;
  onRemove: (id: number) => void;
  total: number;
}

interface RecipientCalculation extends Recipient {
  percentage: string;
}


export default function RecipientsList({
  recipients,
  onUpdateAddress,
  onUpdateAmount,
  onRemove,
  total,
}: RecipientsListProps) {
  const calculations = recipients.map((r) => {
    const amount = r.amount ? parseFloat(r.amount) : 0;
    const percentage = total > 0 ? ((amount / total) * 100).toFixed(2) : 0;
    return { ...r, percentage };
  }) as RecipientCalculation[];

  return (
    <div className="max-h-[300px] overflow-y-scroll scrollbar-hide">
      {calculations.map((recipient) => (
        <RecipientItem
          key={recipient.id}
          recipient={recipient}
          percentage={recipient.percentage}
          onUpdateAddress={(addr) => onUpdateAddress(recipient.id, addr)}
          onUpdateAmount={(amt) => onUpdateAmount(recipient.id, amt)}
          onRemove={() => onRemove(recipient.id)}
          canRemove={recipients.length > 1}
        />
      ))}
    </div>
  );
}


function RecipientItem({
  recipient,
  percentage,
  onUpdateAddress,
  onUpdateAmount,
  onRemove,
  canRemove,
}: RecipientItemProps) {
  return (
    <div className="text-white md:pb-4 md:px-8  pt-0  grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-1.5">
            Address (optional)
          </label>
          <Input
            type="text"
            value={recipient.address}
            onChange={(e) => onUpdateAddress(e.target.value)}
            placeholder="0x..."
            className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-1.5">
            Amount
          </label>
          <Input
            type="number"
            value={recipient.amount}
            onChange={(e) => onUpdateAmount(e.target.value)}
            placeholder="0"
            className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">%</p>
            <p className="text-xl md:text-2xl font-bold bg-clip-text">
              {percentage}%
            </p>
          </div>
          <button
            onClick={onRemove}
            className="p-4 rounded-full h-full  border border-dim-white-border bg-card-bg  transition-colors"
            disabled={!canRemove}
            title="Remove address"
          >
            <Trash className="w-full h-full text-[#B26C6C]" />
          </button>
        </div>
      </div>
    </div>
  );
}