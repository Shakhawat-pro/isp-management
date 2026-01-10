import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "isp_manager_session";

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day
const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req) {
	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ success: false }, { status: 400 });
	}

	const { username, password, remember } = body || {};

	if (username !== "admin" || password !== "1234") {
		return NextResponse.json({ success: false }, { status: 401 });
	}

	const maxAgeSeconds = remember
		? REMEMBER_SESSION_MAX_AGE_SECONDS
		: DEFAULT_SESSION_MAX_AGE_SECONDS;

	const exp = Date.now() + maxAgeSeconds * 1000;
	const token = createSessionToken({ username, exp });

	const res = NextResponse.json({ success: true, expiresAt: exp }, { status: 200 });
	res.cookies.set({
		name: COOKIE_NAME,
		value: token,
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: maxAgeSeconds,
	});

	return res;
}
