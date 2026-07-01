import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Verifies an email OTP link (password recovery, email confirmation) and
// redirects onward. Supabase sends the user here with ?token_hash&type; on
// success we forward to `next` (e.g. /update-password for recovery).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(url);
}
