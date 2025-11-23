"use client";
import { useState } from "react";
import PoolDescription from "./component/poolDetail";
import { MembersConfiguration } from "./component/poolMembers";
import UsageCount from "./component/usageCount";
import Review from "./component/review";
// @ts-expect-error not ts compatible
import { initialize } from "@paunovic/random-words";
import { CreateGroupFormData } from "@/types/group";
import toast from "react-hot-toast";
import { checkAddressNetwork, useGetBalance } from "@/utils/contract";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { createGroup } from "@/hooks/blockchainWriteFunction";

export default function Page() {
  const router = useRouter();
  const [section, setSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultHash, setResultHash] = useState("");
  const { account,address } = useAccount()
  const balance = useGetBalance(address || "0x0");
  const randomWord = initialize({ countryCode: "us" })
    .word()
    .toLocaleUpperCase();
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: randomWord,
    usage: "",
    members: [
      {
        id: "1",
        addr: "",
        percentage: 0,
      },
      {
        id: "2",
        addr: "",
        percentage: 0,
      },
    ],
    agreeTerms: false,
  });

  // Check for duplicate addresses
  const checkDuplicateAddresses = () => {
    const addresses = formData.members
      .map((member) => member.addr.trim().toLowerCase())
      .filter((addr) => addr !== ""); // Only check non-empty addresses

    const uniqueAddresses = new Set(addresses);

    if (addresses.length !== uniqueAddresses.size) {
      return true; // Has duplicates
    }
    return false; // No duplicates
  };

  const totalPercentage = formData.members.reduce(
    (sum, member) =>
      sum + (typeof member.percentage === "number" ? member.percentage : 0),
    0
  );

  function next() {
    if (!account) {
      toast.error("No account connected");
      return;
    }
    if (section == 2 && totalPercentage !== 100) {
      toast.error("Total percentage must be exactly 100%");
      return;
    }
    if (section == 1 && formData.name === "") {
      toast.error("Group name is required");
      return;
    }
    if (section == 2 && checkDuplicateAddresses()) {
      toast.error(
        "Duplicate addresses detected! Please ensure each member has a unique address."
      );
      return;
    }
    const noEmptyAddress = formData.members.filter(
      (member) => member.addr === ""
    );
    const InvalidAddress = formData.members.filter(
      (member) => member.addr.length < 64
    );
    if (section == 2 && noEmptyAddress.length > 0) {
      toast.error("Group contain a member with empty address");
      return;
    }
    if (section == 2 && InvalidAddress.length > 0) {
      toast.error("Group contain a member with an invalid address");
      return;
    }
    if (section == 3 && !formData.usage) {
      toast.error("Please select a usage");
      return;
    }
    if (section == 4 && !formData.agreeTerms) {
      toast.error("Please accept the terms by checking the checkbox");
      return;
    }

    if (
      section == 4 &&
      balance?.formatted &&
      Number(balance.formatted) < +formData.usage
    ) {
      toast.error(`Insufficient balance, Top Up!`);
      return;
    }
    if (section <= 3) {
      setSection((prev) => prev + 1); 
    }
    if (section == 4) {
      createGroup(
        formData,
        setIsSubmitting,
        account,
        setResultHash,
        setFormData
      );
    }
  }

  function prev() {
    if (section == 1) return
    setSection((prev) => prev - 1);
  }
  return (
    <section className="md:grid text-text-white md:grid-cols-[1fr_2fr] border border-moon-blue rounded-[8px] bg-card-bg items-start min-h-[750px]">
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
            Create new group
          </h1>
          <p className="text-text-gray font-dmsans text-base">
            Create a funding group, share a single deposit address, and
            automatically distribute funds to members.
          </p>
        </div>
      </div>
      <div className="p-5 md:p-10 text-text-white border-t md:border-t-0 md:border-l border-moon-blue text-[18px] grid gap-28 h-full">
        {section === 1 && (
          <PoolDescription defaultName={formData.name} setForm={setFormData} />
        )}
        {section === 2 && (
          <MembersConfiguration
            members={formData.members}
            setMembers={setFormData}
          />
        )}
        {section === 3 && (
          <UsageCount setFormData={setFormData} formData={formData} />
        )}
        {section === 4 && (
          <Review setFormData={setFormData} formData={formData} />
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={prev}
            disabled={section == 1}
            className={`${
              section == 1 ? "opacity-0" : ""
            }  rounded-full px-4 py-3 bg-dim-gray w-fit h-fit border-dim-white-border border`}
          >
            Previous
          </button>
          <button
            onClick={next}
            className="rounded-full px-4 py-3 bg-purple-bg w-fit h-fit"
          >
            {section === 4 ? "Create Group" : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}
