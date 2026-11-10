function LoadingCard({
  message = "Menyiapkan sesi ujian...",
}: {
  message?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-divider bg-bg-paper p-8 animate-pulse">
      <div className="h-4 w-32 rounded-full bg-divider/60" />
      <div className="h-6 w-2/3 rounded-lg bg-divider/60" />
      <div className="h-4 w-1/2 rounded-lg bg-divider/40" />
      <p className="pt-2 text-xs text-text-secondary">{message}</p>
    </div>
  );
}

export default LoadingCard;
