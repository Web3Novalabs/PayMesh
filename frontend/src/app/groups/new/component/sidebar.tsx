import Link from "next/link";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();
  return (
    <div className="p-5 md:p-10 flex flex-col h-full justify-between">
      <div className="grid gap-10 ">
        <button
          onClick={() => {
            router.back();
          }}
          className="rounded-full w-fit cursor-pointer border border-dim-white-border text-text-white py-3 px-4 capitalize bg-dim-gray"
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
      <div>
        <h2>
          Need to calculate percentages for your recipient list? Go to the
          Distribution{" "}
          <Link className="text-[#4950B1]" href="/groups/calculator">
            Calculator.
          </Link>
        </h2>
      </div>
    </div>
  );
};

export default Sidebar;
