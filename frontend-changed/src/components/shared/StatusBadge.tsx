import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "approved" | "rejected" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      status === "approved" && "status-approved",
      status === "rejected" && "status-rejected",
      status === "pending" && "status-pending",
    )}>
      {status}
    </span>
  );
}
