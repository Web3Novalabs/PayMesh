"use client";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";
import { Input } from "@/components/ui/input";
import { useContractFetch } from "@/hooks/useContractInteraction";
import { CreateGroupFormData } from "@/types/group";
import { ONE_STK } from "@/utils/contract";
import { useEffect, useState } from "react";

type SetForm = React.Dispatch<React.SetStateAction<CreateGroupFormData>>;
export default function UsageCount({
  setFormData,
  formData,
}: {
  setFormData: SetForm;
  formData: CreateGroupFormData;
}) {
  const [creationFee, setCreationFee] = useState<null | number>(null);

  const { readData: usageFee } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_fee",
    []
  );
  useEffect(() => {
    if (!usageFee) return;

    const fee = BigInt(usageFee);
    setCreationFee(Number(fee) / ONE_STK);
  }, [usageFee]);

  const fee = creationFee
    ? Number(creationFee * Number(formData.usage)).toFixed(2)
    : "";
  return (
    <div className="text-white md:p-8 pt-0 md:pt-0  grid gap-6">
      <h1 className="text-xl md:text-2xl font-medium">Usage</h1>
      <div className="grid gap-2">
        <div className="grid gap-2">
          <h3>Number of Planned Uses</h3>
          <Input
            type="number"
            value={formData?.usage ? formData.usage : ""}
            placeholder="Enter number of usage"
            min={1}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, usage: e.target.value }))
            }
            className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
          />
        </div>
        <div className="border border-moon-blue bg-card-bg py-7 rounded-[8px] grid gap-5">
          <h3 className="px-6">Cost Calculation</h3>
          <div className="px-6 flex justify-between items-center">
            <h3 className="text-text-gray">Cost per use:</h3>
            <h3> {creationFee ? creationFee.toFixed(2) : "4"}STRK</h3>
          </div>
          <div className="px-6 flex justify-between items-center">
            <h3 className="text-text-gray">Number of Uses:</h3>
            <h3> {formData.usage}</h3>
          </div>
          <div className="flex border-t border-moon-blue justify-between items-center p-6 pb-0">
            <h3 className="text-text-gray">Total Cost:</h3>
            <h3 className="text-2xl">{fee} STRK</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
