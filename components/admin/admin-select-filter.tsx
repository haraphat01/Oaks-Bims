"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdminSelectFilter({
  param,
  defaultValue = "",
  options,
  className,
}: {
  param: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      defaultValue={defaultValue}
      className={cn("h-10 w-44", className)}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        e.target.value ? params.set(param, e.target.value) : params.delete(param);
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Select>
  );
}
