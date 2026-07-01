import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Auth email-link callback. Robust to the shapes Supabase's DEFAULT invite /
// recovery / email-change emails actually send — no dashboard template edits:
//   (a) ?code=…            → exchangeCodeForSession (PKCE)          [server]
//   (c) ?token_hash=&type= → verifyOtp                              [server]
//   (b) #access_token=&refresh_token= (implicit)                    [client]
// (b)'s fragment never reaches the server, so when neither (a) nor (c) is
// present we hand off to the client page /auth/callback; the URL fragment is
// preserved by the browser across this redirect.

// Invited / recovering users must set a password first; others go to `next`.
function destination(type: string | null, next: string | null): string {
  if (type === "recovery" || type === "invite") return "/update-password";
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function invalid(origin: string) {
  const url = new URL("/sign-in", origin);
  url.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  // (a) PKCE code exchange.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return invalid(origin);
    return NextResponse.redirect(new URL(destination(type, next), origin));
  }

  // (c) OTP token hash (invite / recovery / email_change / signup).
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (error) return invalid(origin);
    return NextResponse.redirect(new URL(destination(type, next), origin));
  }

  // (b) Implicit flow — token lives in the URL fragment, invisible here. Hand
  // off to the client handler; the #fragment rides along through the redirect.
  const handoff = new URL("/auth/callback", origin);
  if (next) handoff.searchParams.set("next", next);
  return NextResponse.redirect(handoff);
}
