"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  propertyId,
  initial,
  loggedIn,
}: {
  propertyId: string;
  initial: boolean;
  loggedIn: boolean;
}) {
  const [isFav, setFav] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function toggle() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    start(async () => {
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
        setFav(false);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
        setFav(true);
      }
    });
  }

  return (
    <Button onClick={toggle} variant={isFav ? "default" : "outline"} size="sm" disabled={pending}>
      <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
      {isFav ? "Saved" : "Save"}
    </Button>
  );
}
