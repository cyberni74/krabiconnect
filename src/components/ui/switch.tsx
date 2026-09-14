import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full bg-border transition-colors data-[state=checked]:bg-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-6 translate-x-0.5 rounded-full bg-surface shadow-card transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
