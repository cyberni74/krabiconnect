import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "mark",
}: {
  className?: string;
  variant?: "mark" | "photo";
}) {
  if (variant === "photo") {
    return (
      <img
        src="/brand/logo.jpg"
        alt=""
        className={cn("rounded-2xl object-cover", className)}
      />
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={cn("text-primary", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M7.5 21.5 13.2 8.5 16.6 16.2 20.2 11.2 24.8 21.5Z"
        fill="#ffffff"
      />
      <path
        d="M6 24c3.4 2.1 7.2 2.4 10 2.4s6.6-.3 10-2.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="6" cy="24" r="1.55" fill="#ffffff" />
      <circle cx="26" cy="24" r="1.55" fill="#ffffff" />
    </svg>
  );
}
