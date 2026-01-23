import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public assets)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

export default async function middleware(request: NextRequest) {
    // 1. Rate Limiting (API Routes Only)
    if (request.nextUrl.pathname.startsWith("/api")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
        try {
            const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
            await pending;

            if (!success) {
                return NextResponse.json(
                    { error: "Rate limit exceeded" },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        }
                    }
                );
            }
        } catch (e) {
            console.warn("Rate limiting failed, allowing request:", e);
        }
    }

    // 2. Auth Session Refresh (All Routes)
    return await updateSession(request);
}
