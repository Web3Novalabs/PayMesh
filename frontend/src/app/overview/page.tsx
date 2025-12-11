"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import coins from "../../../public/Container.png";
import YourGroupsCard from "./components/YourGroupsCard";
import ActiveCrowdFundingCard from "./components/ActiveCrowdFundingCard";

export default function Page() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="min-h-[75vh] w-full" />;
  }

  return (
    <section className="w-full flex flex-col gap-10 min-h-[75vh] max-w-sit-screen px-5 mx-auto">
      <div className="flex items-center justify-center -mt-8 sm:mt-0">
        <Image src={coins} alt="coins" priority />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <YourGroupsCard />
        <ActiveCrowdFundingCard />
      </div>
    </section>
  );
}
