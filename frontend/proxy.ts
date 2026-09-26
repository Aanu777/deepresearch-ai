import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";


export async function proxy(
  request: NextRequest
) {
  let response =
    NextResponse.next({
      request,
    });

  // Local development already authenticates through the
  // browser Supabase client. Avoid a network auth round-trip
  // on every route request while running `next dev`.
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return response;
  }

  const hasSupabaseAuthCookie =
    request.cookies
      .getAll()
      .some(
        ({
          name,
        }) =>
          name.startsWith(
            "sb-"
          ) &&
          name.includes(
            "auth-token"
          )
      );

  // Public/anonymous requests do not need a Supabase
  // claims refresh. This keeps landing/auth routes fast.
  if (
    !hasSupabaseAuthCookie
  ) {
    return response;
  }

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request
              .cookies
              .getAll();
          },

          setAll(
            cookiesToSet
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                request.cookies.set(
                  name,
                  value
                );

                response =
                  NextResponse.next({
                    request,
                  });

                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

  try {
    await supabase.auth
      .getClaims();

  } catch {
    // Session refresh must never make routing unavailable.
    // Browser auth state will handle sign-in recovery.
  }

  return response;
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
