import * as React from "react";
import { cn } from "@/lib/utils";

export function Divider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("w-full border-t border-border", className)}
      {...props}
    />
  );
}
