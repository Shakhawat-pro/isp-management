"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError("Invalid username or password.");
        setSubmitting(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Login failed. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-200">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border-t-4 border-primary">
        <div className="flex flex-col items-center mb-6">
          <span className="text-3xl font-extrabold text-primary mb-1">ISP Manager</span>
          <span className="badge badge-primary/20 text-primary font-semibold">Login</span>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Username</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Password</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              id="remember"
            />
            <label htmlFor="remember" className="label-text cursor-pointer select-none">Remember me</label>
          </div>
          {error ? <div className="text-error text-sm text-center">{error}</div> : null}
          <button className="btn btn-primary w-full mt-2" type="submit" disabled={submitting}>
            {submitting ? (
              <span className="loading loading-spinner loading-sm mr-2"></span>
            ) : null}
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
