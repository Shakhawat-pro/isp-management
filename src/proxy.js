import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "isp_manager_session";

const DEFAULT_SECRET = "dev-secret-change-me";

function getSecret() {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlToBytes(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

async function hmacSha256Base64Url(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const bytes = new Uint8Array(sig);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function isAuthenticated(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encoded, sig] = parts;

  const expected = await hmacSha256Base64Url(encoded, getSecret());
  if (!safeEqual(sig, expected)) return false;

  let payload;
  try {
    payload = JSON.parse(bytesToUtf8(base64UrlToBytes(encoded)));
  } catch {
    return false;
  }

  if (!payload || typeof payload !== "object") return false;
  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  return Date.now() < exp;
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow Next internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Allow auth endpoints
  if (pathname === "/api/login" || pathname === "/api/session") {
    return NextResponse.next();
  }

  // Allow the login page
  if (pathname === "/login") {
    const authed = await isAuthenticated(req);
    if (authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const authed = await isAuthenticated(req);
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
