import { CreateGroupFormData } from "@/types/group";
import PoolDescription from "./poolDetail";
import { MembersConfiguration } from "./poolMembers";
import Review from "./review";
import UsageCount from "./usageCount";
import { SetFormData } from "@/hooks/blockchainWriteFunction";

const Content = ({
  section,
  formData,
  setFormData,
}: {
  section: number;
  formData: CreateGroupFormData;
  setFormData: SetFormData;
}) => {
  return (
    <>
      {section === 1 && (
        <PoolDescription defaultName={formData.name} setForm={setFormData} />
      )}
      {section === 2 && (
        <MembersConfiguration
          members={formData.members}
          setMembers={setFormData}
        />
      )}
      {section === 3 && (
        <UsageCount setFormData={setFormData} formData={formData} />
      )}
      {section === 4 && (
        <Review setFormData={setFormData} formData={formData} />
      )}
    </>
  );
};

export default Content