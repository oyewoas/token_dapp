export function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    if ("shortMessage" in err) {
      const m = (err as { shortMessage?: unknown }).shortMessage;
      if (typeof m === "string") return m;
    }
    if ("message" in err) {
      const m = (err as { message?: unknown }).message;
      if (typeof m === "string") return m;
    }
  }
  return "Unexpected error occurred";
}
