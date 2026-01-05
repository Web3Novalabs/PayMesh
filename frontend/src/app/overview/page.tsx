"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import coins from "../../../public/coin/Container (2).png";
import YourGroupsCard from "./components/YourGroupsCard";
import ActiveCrowdFundingCard from "./components/ActiveCrowdFundingCard";
import Loading from "@/components/Loading";

export default function Page() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <Loading />;
  }

  return (
    <section className="w-full flex flex-col gap-10 min-h-[75vh] max-w-sit-screen px-5 mx-auto">
      <div className="flex items-center justify-center -mt-8 sm:mt-0 md:w-1/2 mx-auto w-4/5">
        <Image src={coins} alt="coins" priority />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <YourGroupsCard />
        <ActiveCrowdFundingCard />
      </div>
    </section>
  );
}
