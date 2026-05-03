import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NavLink({ href, disabled, children }: { href?: string; disabled?: boolean; children: React.ReactNode }) {
  const cls = "inline-flex items-center justify-center h-9 w-9 rounded-md border border-input text-sm transition-colors";
  if (disabled || !href) {
    return <span className={`${cls} opacity-40 cursor-not-allowed`}>{children}</span>;
  }
  return <Link href={href} className={`${cls} hover:bg-accent hover:text-accent-foreground`}>{children}</Link>;
}

export function AdminPagination({
  page,
  total,
  pageSize,
  paramsStr = "",
}: {
  page: number;
  total: number;
  pageSize: number;
  paramsStr?: string;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams(paramsStr);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{start}–{end} of {total}</span>
      <div className="flex items-center gap-1">
        <NavLink href={page > 1 ? href(page - 1) : undefined} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </NavLink>
        <span className="px-3 tabular-nums">Page {page} of {totalPages}</span>
        <NavLink href={page < totalPages ? href(page + 1) : undefined} disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      </div>
    </div>
  );
}
