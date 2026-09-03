import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

/** Initials avatar — deterministic clinical-teal gradient per name. */
function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm"
  };
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 font-semibold text-white ring-2 ring-sky-100 dark:ring-sky-900/40",
        sizes[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}

export { Avatar };
