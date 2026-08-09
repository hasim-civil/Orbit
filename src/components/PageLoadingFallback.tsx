export function PageLoadingFallback() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-neutral-200 border-t-brand" />
    </div>
  );
}
