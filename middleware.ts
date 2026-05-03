import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // run on everything except static assets, image optim, Supabase send-email webhook
    "/((?!_next/static|_next/image|favicon.ico|api/auth/send-email|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
