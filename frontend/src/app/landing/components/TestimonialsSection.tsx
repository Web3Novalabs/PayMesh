
import bricks from "../../../../public/bricks.svg"
const testimonials = [
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "Somewhere out there, someone’s working hard for a dream—and this community is quietly helping them get there.",
  },
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "The AgentNation Discord isn’t huge but is growing, little by little, through people who believe in possibilities. 🌍",
  },
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "Every contribution tells a story of support, of connection, of what’s possible when we build together.",
  },
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "Somewhere out there, someone’s working hard for a dream—and this community is quietly helping them get there.",
  },
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "The AgentNation Discord isn’t huge but is growing, little by little, through people who believe in possibilities. 🌍",
  },
  {
    name: "Paymesh User",
    handle: "@paymesh_defi",
    text: "Every contribution tells a story of support, of connection, of what’s possible when we build together.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-20 px-4 md:px-12 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-top bg-cover"
        style={{
          backgroundImage: `url(${bricks.src})`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-2xl md:text-[44px] font-black text-center text-white uppercase mb-12 tracking-wide font-anton">
          BRICK BY BRICK WE GAIN THEIR TRUST
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#0E0F19] border border-[#232542] p-6 rounded-xl hover:border-[#5B63D6] transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#5B63D6] rounded-full flex items-center justify-center font-bold text-white">
                  P
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{t.name}</div>
                  <div className="text-[#8398AD] text-xs">{t.handle}</div>
                </div>
              </div>
              <p className="text-[#E2E2E2] text-sm leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
