export function Check({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm " +
        (ok ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300")
      }
      aria-label={ok ? "OK" : "Error"}
      title={ok ? "OK" : "Error"}
    >
      <span className={"h-2 w-2 rounded-full " + (ok ? "bg-green-400" : "bg-red-400")} />
      {ok ? "OK" : "Issue"}
    </span>
  );
}