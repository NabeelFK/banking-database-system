"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggleIcon } from "@/components/theme-toggle";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", ssn: "", account_type: "Chequing Account",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=28800`;
      router.push("/customer/dashboard");
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900";
  const labelCls = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <main className="min-h-screen text-slate-900" style={{ background: "var(--paper)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="keel-wordmark" style={{ fontSize: 20 }}>Keel</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggleIcon />
            <Link href="/login" className="keel-btn ghost" style={{ padding: "8px 16px" }}>Back to sign in</Link>
          </div>
        </header>

        <section className="py-12">
          <div className="rounded-2xl px-8 py-8 ring-1 ring-slate-200" style={{ background: "var(--paper-2)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Create customer account</p>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.026em", marginTop: 12, color: "var(--ink)" }}>Start your online banking access.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Open your customer profile, choose your first account type, and get set up for secure online banking access.</p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="signup-name" className={labelCls}>Full name</label>
                <input id="signup-name" type="text" placeholder="Your full name" required value={form.name} onChange={set("name")} className={inputCls} />
              </div>
              <div>
                <label htmlFor="signup-email" className={labelCls}>Email</label>
                <input id="signup-email" type="email" placeholder="name@example.com" required value={form.email} onChange={set("email")} className={inputCls} />
              </div>
              <div>
                <label htmlFor="signup-phone" className={labelCls}>Phone</label>
                <input id="signup-phone" type="text" placeholder="403-555-0100" value={form.phone} onChange={set("phone")} className={inputCls} />
              </div>
              <div>
                <label htmlFor="signup-ssn" className={labelCls}>SSN</label>
                <input id="signup-ssn" type="text" placeholder="123-456-7890" required value={form.ssn} onChange={set("ssn")} className={inputCls} />
              </div>
              <div>
                <label htmlFor="signup-password" className={labelCls}>Password</label>
                <input id="signup-password" type="password" placeholder="Create a password" required value={form.password} onChange={set("password")} className={inputCls} />
              </div>
              <div>
                <label htmlFor="signup-account-type" className={labelCls}>First account type</label>
                <select id="signup-account-type" value={form.account_type} onChange={set("account_type")} className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-slate-900">
                  <option>Chequing Account</option>
                  <option>Savings Account</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
