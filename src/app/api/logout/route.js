import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE_NAME = "isp_manager_session";

export async function POST() {
  // Remove the session cookie by setting it to empty and expired
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
