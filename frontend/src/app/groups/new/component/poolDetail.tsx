import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PoolDescription() {
  return (
    <>
      <div className="grid gap-6">
        <h3>Group details</h3>
        <div className="grid gap-3">
          <label htmlFor="">Enter a group name.</label>
          <Input
            placeholder="enter name..."
            className="border border-moon-blue p-6 rounded-full"
          />
        </div>
        <div className="grid gap-3">
          <label htmlFor="">Enter group descriptions</label>
          <Textarea className="border border-moon-blue min-h-[300px]" />
        </div>
      </div>
    </>
  );
}
