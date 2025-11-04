export default function Page() {
  return (
    <div className="h-screen flex items-center justify-center relative">
      <h1 className="text-[250px] font-anton sm:text-[400px] xl:text-[600px] text-[#DFDFE033] text-center">
        404
      </h1>
      <div className="fixed text-3xl sm:text-4xl lg:text-[90px] font-anton uppercase max-w-[1151px] -lg:translate-x-1/5 lg:top-1/2 text-[#DFDFE0] text-center">
        We looked everywhere on-chain but couldn’t find that page.
      </div>
    </div>
  );
}
