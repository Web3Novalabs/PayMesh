import { Input } from "@/components/ui/input";

export default function UsageCount() {
  return (
    <div className="text-white md:p-8 pt-0 md:pt-0  grid gap-6">
      <h1 className="text-xl md:text-2xl font-medium">Usage</h1>
      <div className="grid gap-2">
        <div className="grid gap-2">
          <h3>Number of Planned Uses</h3>
          <Input
            type="number"
            placeholder="0"
            //   value={member.ad}
            className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
          />
        </div>
        <div className="border border-moon-blue bg-card-bg py-7 rounded-[8px] grid gap-5">
          <h3 className="px-6">Cost Calculation</h3>
          <div className="px-6 flex justify-between items-center">
            <h3 className="text-text-gray">Cost Calculation</h3>
            <h3>$0</h3>
          </div>
          <div className="px-6 flex justify-between items-center">
            <h3 className="text-text-gray">Number of Uses:</h3>
            <h3>$0</h3>
          </div>
          <div className="flex border-t border-moon-blue justify-between items-center p-6 pb-0">
            <h3 className="text-text-gray">Total Cost:</h3>
            <h3 className="text-2xl">$0</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
