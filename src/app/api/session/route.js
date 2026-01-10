import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "isp_manager_session";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      username: payload.username,
      expiresAt: payload.exp,
    },
    { status: 200 }
  );
}
