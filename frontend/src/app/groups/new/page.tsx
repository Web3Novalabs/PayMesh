"use client";
import { useEffect, useState } from "react";
// @ts-expect-error not ts compatible
import { initialize } from "@paunovic/random-words";
import { CreateGroupFormData } from "@/types/group";
import toast from "react-hot-toast";
import { myProvider, strkTokenAddress, useGetBalance } from "@/utils/contract";
import { useAccount, useTransactionReceipt } from "@starknet-react/core";
import { createGroup } from "@/hooks/blockchainWriteFunction";
import { Contract } from "starknet";
import Sidebar from "./component/sidebar";
import Content from "./component/content";
import NavigationButtons from "./component/sectionNav";

export default function Page() {
  //  // const router = useRouter();
  const [section, setSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultHash, setResultHash] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [groupBalance, setGroupBalance] = useState<string>("0");
  const [groupAddress, setGroupAddress] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { account, address } = useAccount();
  const balance = useGetBalance(address || "0x0");
  const [hasProcessedTransaction, setHasProcessedTransaction] = useState(false);
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

  const fetchGroupBalance = async (groupAddr: string) => {
    if (!groupAddr) return;

    setIsLoadingBalance(true);
    try {
      const strkContract = new Contract(
        [
          {
            name: "balanceOf",
            type: "function",
            inputs: [{ name: "account", type: "felt" }],
            outputs: [{ name: "balance", type: "Uint256" }],
            state_mutability: "view",
          },
        ],
        strkTokenAddress,
        myProvider
      );

      const result = await strkContract.balanceOf(groupAddr);

      const balanceValue = result.balance;

      const balanceInStrk =
        parseFloat(balanceValue.toString()) / Math.pow(10, 18);
      setGroupBalance(balanceInStrk.toFixed(4));
    } catch (error) {
      console.error("Error fetching group balance:", error);
      setGroupBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const { data, error } = useTransactionReceipt({
    hash: resultHash,
  });

  useEffect(() => {
    let m;
    if (!data || hasProcessedTransaction) return;
    if (
      data.value &&
      typeof data.value === "object" &&
      "events" in data.value &&
      Array.isArray(data.value.events)
    ) {
      m = data.value.events[3]?.data[0];
      m = m.replace("0x", "0x0");
      setGroupAddress(m);
      setIsSuccess(true);
      setHasProcessedTransaction(true);
      toast.success("Group created successfully! 🎉");
      fetchGroupBalance(m);
    } else {
      m = undefined;
    }
  }, [data, error, hasProcessedTransaction]);

  useEffect(() => {
    return () => {
      setIsSuccess(false);
      setGroupAddress("");
      setGroupBalance("0");
      setHasProcessedTransaction(false);
      setResultHash("");
    };
  }, []);

  const forceCloseModal = () => {
    setIsSuccess(false);
    setGroupAddress("");
    setGroupBalance("0");
    setIsSubmitting(false);
    setCopySuccess(false);
    setIsLoadingBalance(false);
    setHasProcessedTransaction(false);
    setResultHash("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(groupAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const checkDuplicateAddresses = () => {
    const addresses = formData.members
      .map((member) => member.addr.trim().toLowerCase())
      .filter((addr) => addr !== "");

    const uniqueAddresses = new Set(addresses);

    if (addresses.length !== uniqueAddresses.size) {
      return true;
    }
    return false;
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
    if (section == 1) return;
    setSection((prev) => prev - 1);
  }

  return (
    <section className="xl:grid text-text-white md:grid-cols-[1fr_2fr] border border-moon-blue rounded-[8px] bg-card-bg items-start min-h-[750px]">
      <Sidebar />
      <div className="p-5 md:p-10 text-text-white border-t md:border-t-0 md:border-l border-moon-blue text-[18px] grid gap-28 h-full">
        <Content
          section={section}
          formData={formData}
          setFormData={setFormData}
        />
        <NavigationButtons
          section={section}
          isSubmitting={isSubmitting}
          prev={prev}
          next={next}
          isSuccess={isSuccess}
          groupAddress={groupAddress}
          groupBalance={groupBalance}
          isLoadingBalance={isLoadingBalance}
          copySuccess={copySuccess}
          copyToClipboard={copyToClipboard}
          forceCloseModal={forceCloseModal}
        />
      </div>
    </section>
  );
}
