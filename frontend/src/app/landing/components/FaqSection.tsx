"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const faqData = [
  {
    question: "What is Paymesh?",
    answer:
      "Paymesh is an automated platform built with transparency in mind, allowing users to seamlessly create groups for split payments or manage fundraising campaigns on-chain.",
  },
  {
    question: "How does groups work in Paymesh?",
    answer:
      "You create a group, add member wallet addresses, and define split percentages. Paymesh generates a unique address for the group. Any funds sent to this address are automatically distributed to members according to the set rules.",
  },
  {
    question: "The idea behind Fundraiser?",
    answer:
      "Fundraisers on Paymesh get a unique wallet address. Donors send funds, and once the target is reached (or depending on configuration), funds are disbursed to the beneficiary wallets transparently.",
  },
  {
    question: "The users?",
    answer:
      "Paymesh is designed for anyone needing transparent, automated financial coordination—communities, DAOs, friends splitting costs, or charitable causes.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 px-4 md:px-12 max-w-5xl mx-auto">
      <div className="bg-[#2C2D4B] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row gap-12">
        {/* Title Area */}
        <div className="lg:w-1/3">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight mb-4">
            FEQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-[#8398AD] text-xs uppercase tracking-wider">
            GET THE BASIC ANSWERS TO YOUR QUESTIONS HERE
          </p>
        </div>

        {/* Accordion Area */}
        <div className="lg:w-2/3 space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-b border-[#FFFFFF1A] last:border-0 pb-4 last:pb-0 cursor-pointer"
              onClick={() => toggle(index)}
            >
              <div className="flex items-center justify-between py-2">
                <h3 className="text-white font-medium text-sm md:text-base">
                  {item.question}
                </h3>
                <ArrowRight
                  size={16}
                  className={`text-white transition-transform ${
                    openIndex === index ? "rotate-90" : ""
                  }`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-40 opacity-100 mt-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-[#8398AD] text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
