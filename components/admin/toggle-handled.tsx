"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ToggleHandled({ id, initial }: { id: string; initial: boolean }) {
  const [handled, setHandled] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    start(async () => {
      const supabase = createClient();
      await supabase.from("inquiries").update({ is_handled: !handled }).eq("id", id);
      setHandled(!handled);
      router.refresh();
    });
  }

  return (
    <Button onClick={toggle} variant="outline" size="sm" disabled={pending}>
      {handled ? "Mark as open" : "Mark as handled"}
    </Button>
  );
}
