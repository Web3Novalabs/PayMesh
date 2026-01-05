import Loading from "@/app/components/Loading";
import QRcode from "@/app/components/QRcode";

interface NavigationButtonsProps {
  section: number;
  isSubmitting: boolean;
  prev: () => void;
  next: () => void;
  isSuccess: boolean;
  groupAddress: string;
  groupBalance: string;
  isLoadingBalance: boolean;
  copySuccess: boolean;
  copyToClipboard: () => Promise<void>;
  forceCloseModal: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  section,
  isSubmitting,
  prev,
  next,
  isSuccess,
  groupAddress,
  groupBalance,
  isLoadingBalance,
  copySuccess,
  copyToClipboard,
  forceCloseModal,
}) => {
  return (
    <div className="flex justify-between items-center">
      <button
        onClick={prev}
        disabled={section == 1}
        className={`${
          section == 1 ? "opacity-0" : ""
        }  rounded-full px-4 py-3 bg-dim-gray w-fit h-fit border-dim-white-border border cursor-pointer`}
      >
        Previous
      </button>
      <button
        onClick={next}
        className="rounded-full px-4 py-3 bg-purple-bg w-fit h-fit cursor-pointer"
      >
        {section === 4
          ? isSubmitting
            ? "Creating Group..."
            : "Create Group"
          : "Next"}
      </button>
      {isSubmitting && (
        <Loading
          title="Creating Your Group"
          description="Please wait while we process your transaction on the blockchain..."
          progressSteps={[
            "Validating group data",
            "Approving transaction",
            "Deploying group contract",
          ]}
          estimatedTime="15-30 seconds"
        />
      )}

      {isSuccess && (
        <QRcode
          groupAddress={groupAddress}
          groupBalance={groupBalance}
          isLoadingBalance={isLoadingBalance}
          copySuccess={copySuccess}
          copyToClipboard={copyToClipboard}
          closeModal={forceCloseModal}
        />
      )}
    </div>
  );
};

export default NavigationButtons;
