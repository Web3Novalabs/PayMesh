import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SetFormData } from "@/hooks/blockchainWriteFunction";
import { CreateGroupFormData } from "@/types/group";


export default function PoolDescription({
  defaultName,
  setForm,
}: {
  defaultName: string;
  setForm: SetFormData;
}) {
  // console.log(defaultName.word());
  return (
    <>
      <div className="grid gap-6">
        <h3>Group details</h3>
        <div className="grid gap-3">
          <label htmlFor="">Enter a group name.</label>
          <Input
            placeholder="enter name..."
            value={defaultName}
            onChange={(e) =>
              setForm((prev: CreateGroupFormData) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="border border-moon-blue p-6 rounded-full"
          />
        </div>
        <div className="grid gap-3 opacity-0">
          <label htmlFor="">Enter group descriptions</label>
          <Textarea className="border border-moon-blue min-h-[300px]" />
        </div>
      </div>
    </>
  );
}
