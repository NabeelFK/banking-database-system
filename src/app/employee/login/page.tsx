"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggleIcon } from "@/components/theme-toggle";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      const role = data.user?.role;

      if (role === "customer") {
        setError("This portal is for staff only. Please use the customer sign-in page.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=28800`;

      router.push("/employee/dashboard");
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-slate-900" style={{ background: "var(--paper)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="keel-wordmark" style={{ fontSize: 20 }}>Keel</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggleIcon />
            <Link href="/login" className="keel-btn ghost" style={{ padding: "8px 16px" }}>Customer sign in</Link>
          </div>
        </header>

        <section className="flex flex-1 items-center py-12">
          <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl px-8 py-10 ring-1 ring-slate-200 sm:px-10" style={{ background: "var(--paper-2)" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Staff sign in</p>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.026em", marginTop: 16, color: "var(--ink)" }}>
                Open employee management tools.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Employees and managers can sign in here to review transactions,
                update statuses, manage accounts, and access staff controls.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="max-w-md">
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Sign in to staff tools
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use your employee credentials to continue.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="employee-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Work email
                  </label>
                  <input
                    id="employee-email"
                    type="email"
                    placeholder="employee@ourbank.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="employee-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="employee-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="mt-8 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-700">Need staff access?</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Contact your manager to have an employee account created for you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
