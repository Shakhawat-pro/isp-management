import crypto from "crypto";

const DEFAULT_SECRET = "dev-secret-change-me";

function getSecret() {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeToString(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function hmacSha256(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

export function createSessionToken({ username, exp }) {
  const payload = { username, exp };
  const json = JSON.stringify(payload);
  const encoded = base64UrlEncode(json);
  const sig = base64UrlEncode(hmacSha256(encoded, getSecret()));
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const expected = base64UrlEncode(hmacSha256(encoded, getSecret()));

  try {
    const sigBuf = Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const expectedBuf = Buffer.from(expected.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(encoded));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (typeof payload.username !== "string") return null;
  if (typeof payload.exp !== "number") return null;

  if (Date.now() >= payload.exp) return null;

  return payload;
}
