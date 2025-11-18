import { CreateGroupFormData } from "@/types/group";
import { formatAddress } from "@/utils/helpers";

type SetForm = React.Dispatch<React.SetStateAction<CreateGroupFormData>>;
export default function Review({
  setFormData,
  formData,
}: {
  setFormData: SetForm;
  formData: CreateGroupFormData;
}) {
  console.log(formData);
  return (
    <div className="text-white md:p-8 pt-0 md:pt-0 flex flex-col overflow-x-hidden gap-6">
      <h1 className="text-xl md:text-2xl font-medium">Review</h1>
      <div className="overflow-scroll h-[350px]  w-full scrollbar-hide flex flex-col gap-2">
        <table
          className="w-full text-base bg-card-bg"
          role="table"
          aria-label="group members"
        >
          <thead className="border-b border-moon-blue text-gray-text  ">
            <tr>
              <th className="px-4 py-3 text-left" scope="col" aria-label="date">
                S/N
              </th>
              <th
                className="px-4 py-3 text-center "
                scope="col"
                aria-label="project name"
              >
                Group Address
              </th>
              <th
                className="px-4 py-3 text-right"
                scope="col"
                aria-label="Wallet address transfer to"
              >
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {formData.members.map((member, key) => {
              return (
                <tr
                  key={key}
                  className="border-b border-moon-blue  text-sm border-dark-border-gray last:border-b-0 transition-colors py-4"
                  role="row"
                >
                  <td
                    className="bg-inherit px-4 py-5"
                    role="gridcell"
                    aria-label=""
                  >
                    1
                  </td>
                  <td
                    className="z-10 px-4 py-5 font-medium text-center"
                    role="gridcell"
                    aria-label={``}
                  >
                    <span className="md:hidden">
                      {formatAddress(member.addr)}
                    </span>
                    <span className="hidden md:block">{member.addr}</span>
                  </td>
                  <td
                    className="px-4 py-5 text-xs md:text-sm text-end"
                    role="gridcell"
                    aria-label=""
                  >
                    {member.percentage}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => {
              setFormData((prev) => {
                return { ...prev, agreeTerms: !prev.agreeTerms };
              });
            }}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                formData.agreeTerms ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-base">
            By checking I accept the creation fee and confirm members and
            percentages are correct.
          </span>
        </div>
      </div>
    </div>
  );
}
