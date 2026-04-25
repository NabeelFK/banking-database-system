import Link from "next/link";
import { ThemeToggleIcon } from "@/components/theme-toggle";

const services = [
  "Checking Accounts",
  "Savings Accounts",
  "Money Transfers",
  "Loans",
];

export default function Home() {
  return (
    <main className="min-h-screen text-slate-900" style={{ background: "var(--paper)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="keel-wordmark" style={{ fontSize: 20 }}>Keel</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggleIcon />
            <Link href="/login" className="keel-btn accent">Sign in</Link>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          <div className="max-w-4xl rounded-2xl px-8 py-10 ring-1 ring-slate-200 sm:px-10" style={{ background: "var(--paper-2)" }}>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-widest" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
              Welcome to Keel
            </p>
            <h1 className="mt-5" style={{ fontFamily: "var(--serif)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.028em", color: "var(--ink)" }}>
              Banking made clear and easy.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              View accounts, move money, manage your balance, and access online
              banking from one secure place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="keel-btn accent">
                Open online banking
              </Link>
              <Link href="/signup" className="keel-btn ghost">
                Create an account
              </Link>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="grid gap-4 border-t border-slate-200 py-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <div key={service} className="rounded-lg bg-slate-50 p-5 border border-slate-200">
              <h2 className="text-base font-semibold">{service}</h2>
              <p className="mt-2 text-sm text-slate-600">
                Secure access and simple tools for everyday banking.
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
