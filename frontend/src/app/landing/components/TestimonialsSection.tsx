"use client";

import bricks from "../../../../public/bricks.svg";
import { motion } from "framer-motion";

const testimonials = [
  {
    tag: "Group Payments",
    quote:
      "We use Paymesh to pay our staff and saves us a lot of time and stress. ",
    name: "Victor A.",
    role: "co-founder of runescard",
    company: "Kaduna, Nigeria",
  },
  {
    tag: "Group Savings",
    quote:
      "My friend group started a travel fund on PayMesh. We've been contributing weekly and watching our vacation fund grow. The transparency keeps everyone accountable.",
    name: "Savage K.",
    role: "Marketing Lead",
    company: "Nigeria",
  },
  {
    tag: "Team Expenses",
    quote:
      "Managing team lunch money used to be a headache. Now we just have a PayMesh group wallet. Everyone contributes, I order, done. It's that simple.",
    name: "Ebube O.",
    role: "Founder of Fortichain",
    company: "Nigeria",
  },
  {
    tag: "Event Planning",
    quote:
      "Used Paymesh to pay some beta testers who helped us test the app. It was seamless and efficient.",
    name: "Onuora One.",
    role: "CEO of InheritX",
    company: "Ghana",
  },
  {
    tag: "Fundraising",
    quote:
      "We raised funds for the Buidl End of year party using Paymesh. It was super easy and we hit our target in less than 72 hours.",
    name: "Mr Dave.",
    role: "Founder of the Buidl",
    company: "Nigeria",
  },
  {
    tag: "Crowdfunding",
    quote:
      "Did some transactions with Paymesh and i have to give them their flowers.",
    name: "Blessing M.",
    role: "Beta Tester",
    company: "Switzerland",
  },
];

export default function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="w-full py-20 px-4 md:px-12 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-top bg-cover"
        style={{
          backgroundImage: `url(${bricks.src})`,
        }}
      ></div>

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-2xl md:text-[44px] font-black text-center text-white uppercase mb-12 tracking-wide font-anton"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          BRICK BY BRICK WE GAIN THEIR TRUST
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-[#0E0F19] border border-[#232542] p-5 rounded-xl hover:border-[#5B63D6] transition-colors flex flex-col items-start"
              variants={itemVariants}
            >
              <div className="inline-block bg-[#5B63D6]/20 border border-[#5B63D6]/30 px-3 py-1 rounded-full mb-4">
                <span className="text-xs font-bold text-[#5B63D6] uppercase tracking-wider">
                  {t.tag}
                </span>
              </div>

              <p className="text-[#E2E2E2] text-base leading-relaxed mb-4 flex-grow">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-auto border-t border-[#232542] w-full pt-2">
                <div className="text-white font-bold text-base">{t.name}</div>
                <div className="text-[#8398AD] text-xs mt-1">
                  <span className="font-medium text-[#5B63D6]">{t.role}</span>
                  <span className="mx-1.5 text-[#232542]">•</span>
                  {t.company}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
