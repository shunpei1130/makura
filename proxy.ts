import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const square =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://web.squarecdn.com"
      : "https://sandbox.web.squarecdn.com";
  const pci =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://pci-connect.squareup.com"
      : "https://pci-connect.squareupsandbox.com";
  const takesCard = /^\/(checkout|payment)(\/|$)/.test(
    request.nextUrl.pathname,
  );
  // 3DS issuer domains are chosen by the card network. Permit HTTPS challenges
  // only on card entry pages; scripts remain nonce restricted on every page.
  const challenge = takesCard
    ? process.env.SQUARE_ENVIRONMENT === "production"
      ? "https:"
      : "https://api.squareupsandbox.com"
    : "";
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${square}${dev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline' ${square}; frame-src 'self' ${square} ${challenge}; connect-src 'self' ${square} ${pci} https://o160250.ingest.sentry.io${dev ? " ws:" : ""}; img-src 'self' data: blob: ${square}; font-src 'self' https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com; object-src 'none'; base-uri 'self'; form-action 'self' ${challenge}; frame-ancestors 'none';`;
  const h = new Headers(request.headers);
  h.set("x-nonce", nonce);
  h.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: h } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
export const config = {
  matcher: [
    "/checkout/:path*",
    "/return/:path*",
    "/payment/:path*",
    "/admin/:path*",
  ],
};
