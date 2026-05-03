"use client";

import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/components/comparison-provider";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";

export function CompareButton({
  property,
  compact = false,
  className,
}: {
  property: Property;
  compact?: boolean;
  className?: string;
}) {
  const { toggle, isAdded, isFull } = useComparison();
  const added = isAdded(property.id);
  const disabled = isFull && !added;

  return (
    <Button
      type="button"
      variant={added ? "default" : "outline"}
      size={compact ? "sm" : "default"}
      className={cn(compact && "h-8 w-8 p-0 rounded-full", className)}
      disabled={disabled}
      title={
        disabled ? "Remove a property to add another (max 3)" :
        added ? "Remove from comparison" : "Add to comparison"
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(property);
      }}
    >
      <GitCompare className={cn("h-4 w-4", !compact && "mr-1.5")} />
      {!compact && (added ? "Remove from compare" : disabled ? "Compare full" : "Compare")}
    </Button>
  );
}
