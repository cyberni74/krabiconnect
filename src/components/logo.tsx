import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "mark",
}: {
  className?: string;
  variant?: "mark" | "full";
}) {
  if (variant === "full") {
    return (
      <img
        src="/brand/logo.png"
        alt="KrabiMarketplace"
        className={cn("object-contain", className)}
      />
    );
  }
  return (
    <img
      src="/brand/mark.jpg"
      alt="KrabiMarketplace"
      className={cn("rounded-full object-cover", className)}
    />
  );
}
