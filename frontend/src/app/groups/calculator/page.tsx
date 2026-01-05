"use client"
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import RecipientsList from "./component/recipientList";
import TotalTokensInput from "./component/TotalTokenTnput";
import Summary from "./component/summary";

export default function TokenCalculator() {
      const router = useRouter();
  const [totalTokens, setTotalTokens] = useState("1000");
  const [recipients, setRecipients] = useState([
    { id: 1, address: "", amount: "" },
    { id: 2, address: "", amount: "" },
  ]);

  const addRecipient = () => {
    const newId = Math.max(...recipients.map((r) => r.id), 0) + 1;
    setRecipients([...recipients, { id: newId, address: "", amount: "" }]);
  };

  const removeRecipient = (id:number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const updateRecipientAddress = (id:number, address:string) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, address } : r)));
  };

  const updateRecipientAmount = (id:number, amount:string) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, amount } : r)));
  };

  const total = totalTokens ? parseFloat(totalTokens) : 0;
  const allocatedAmount = recipients.reduce((sum, r) => {
    const amount = r.amount ? parseFloat(r.amount) : 0;
    return sum + amount;
  }, 0);
  const remaining = Math.max(0, total - allocatedAmount);
  const remainingPercent =
    total > 0 ? ((remaining / total) * 100).toFixed(2) : 0;

  return (
    <section className="xl:grid text-text-white md:grid-cols-[1fr_2fr] border border-moon-blue rounded-[8px] bg-card-bg items-start min-h-[750px] max-w-sit-screen px-5 mx-auto">
      <div className="p-5 md:p-10 grid gap-10">
        <button
          onClick={() => {
            router.back();
          }}
          className="rounded-full w-fit border border-dim-white-border text-text-white py-3 px-4 capitalize bg-dim-gray"
        >
          back
        </button>
        <div className="grid gap-3">
          <h1 className="font-anton font-normal text-[28px] uppercase">
            Token Distribution
          </h1>
          <p className="text-text-gray font-dmsans text-base">
            Calculate percentage allocation across addresses
          </p>
        </div>
      </div>
      <div className="p-5 md:p-10 text-text-white border-t md:border-t-0 md:border-l border-moon-blue text-[18px] grid gap-2 h-full">
        <TotalTokensInput value={totalTokens} onChange={setTotalTokens} />

        <RecipientsList
          recipients={recipients}
          onUpdateAddress={updateRecipientAddress}
          onUpdateAmount={updateRecipientAmount}
          onRemove={removeRecipient}
          total={total}
        />
        <div className="flex justify-end md:px-8 pt-0">
          <button
            onClick={addRecipient}
            className="rounded-full px-4 py-3 bg-purple-bg w-fit h-fit flex items-center"
          >
            <Plus size={20} />
            Add Address
          </button>
        </div>

        <Summary
          total={total}
          allocated={allocatedAmount}
          remaining={remaining}
          remainingPercent={remainingPercent}
        />
      </div>
    </section>
  );
}
