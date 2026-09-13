import { NextResponse } from "next/server";
import { assertOrigin, appUrl } from "@/lib/security";
export async function POST(req: Request) {
  assertOrigin(req);
  const res = NextResponse.redirect(`${appUrl()}/admin/login`, 303);
  res.cookies.delete("makura_admin");
  return res;
}
