import { useEffect } from "react";

export function Toast({
  message,
  variant = "success",
  onDone,
}: {
  message: string;
  variant?: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`toast toast-${variant}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}