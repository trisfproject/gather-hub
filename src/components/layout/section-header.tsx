import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  className,
  title,
  description,
  align = "left",
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-4 mb-10 md:mb-16",
        {
          "text-center items-center": align === "center",
          "text-left items-start": align === "left",
        },
        className
      )}
      {...props}
    >
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-lg md:text-xl text-muted-foreground max-w-[800px]">
          {description}
        </p>
      )}
    </div>
  );
}
