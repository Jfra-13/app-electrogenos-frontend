import { cn } from "../../../lib/cn";

// Placeholder block while data loads. Set width/height via className.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-blue-100 motion-reduce:animate-none",
        className,
      )}
    />
  );
}
