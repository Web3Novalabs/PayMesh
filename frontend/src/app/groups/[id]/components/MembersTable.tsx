import { formatAddress } from "@/utils/helpers";
import { GroupMemberDetails } from "@/types/groups";

interface MembersTableProps {
  members: GroupMemberDetails[];
}

const MembersTable = ({ members }: MembersTableProps) => {
  return (
    <div className="text-white pt-0 md:pt-0 flex flex-col overflow-x-hidden mt-6">
      <div className="bg-[#232542] rounded-tl-[7px] rounded-tr-[7px] p-5">
        <h1 className="text-base font-medium">Members ({members.length})</h1>
      </div>
      <div className="overflow-scroll h-[500px]  w-full scrollbar-hide flex flex-col gap-2">
        <table
          className="w-full text-base bg-card-bg"
          role="table"
          aria-label="group members"
        >
          <thead className="border-b border-moon-blue text-[#8398AD] text-base ">
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
            {members.map((member, key) => {
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
                    {key + 1}
                  </td>
                  <td
                    className="z-10 px-4 py-5 font-medium text-center"
                    role="gridcell"
                    aria-label={``}
                  >
                    <span className="md:hidden">
                      {formatAddress(member.member_address)}
                    </span>
                    <span className="hidden md:block">
                      {member.member_address}
                    </span>
                  </td>
                  <td
                    className="px-4 py-5 text-xs md:text-sm text-end"
                    role="gridcell"
                    aria-label=""
                  >
                    {member.member_percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersTable;
