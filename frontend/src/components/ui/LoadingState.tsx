interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingState({
  message = "Loading...",
  subMessage = "Please wait while we fetch the data",
}: LoadingStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-[#E2E2E2] mb-2">{message}</h2>
        <p className="text-[#8398AD]">{subMessage}</p>
      </div>
    </div>
  );
}
