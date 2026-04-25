"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

interface Account {
  AccountID: number;
  AccountType: string;
  Balance: number;
  Status: string;
}

interface Loan {
  Loan_No: number;
  Amount: number;
  Status: string;
  BranchName: string | null;
}

const quickActions = [
  { title: "Create a new account", description: "Choose between a savings account or a chequing account.", action: "Start account setup", href: "/customer/create-account" },
  { title: "Deposit money", description: "Add funds to an existing account after signing in.", action: "Make a deposit", href: "/customer/deposit" },
  { title: "Request a loan", description: "Submit a loan request and track the current status here.", action: "Request loan", href: "/customer/request-loan" },
  { title: "Update personal information", description: "Edit your email, password, phone number, name, or address.", action: "Edit profile", href: "/customer/profile" },
];

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Frozen: "bg-blue-100 text-blue-700",
    Closed: "bg-slate-100 text-slate-500",
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
    "Under Review": "bg-violet-100 text-violet-700",
  };
  return colors[status] ?? "bg-slate-100 text-slate-600";
}

export default function CustomerDashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const userId = JSON.parse(stored || "{}").userId;
    Promise.all([
      apiFetch(`/api/customer/accounts?userId=${userId}`),
      apiFetch("/api/customer/loans"),
    ])
      .then(([accts, lns]) => {
        setAccounts(Array.isArray(accts) ? accts : []);
        setLoans(Array.isArray(lns) ? lns : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.Balance), 0);

  return (
    <CustomerPortal
      activePage="dashboard"
      title="Manage your banking in one place."
      description="View balances, track loans, manage payees, and access profile updates."
      stats={[
        { label: "Total balance", value: loading ? "—" : fmt(totalBalance) },
        { label: "Open accounts", value: loading ? "—" : String(accounts.length) },
        { label: "Active loans", value: loading ? "—" : String(loans.length) },
        { label: "Saved payees", value: "—" },
      ]}
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          {/* Accounts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Your accounts</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Account balances</h2>
              </div>
              <Link href="/customer/create-account" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                New account
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading accounts…</p>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-slate-500">No accounts found.</p>
              ) : accounts.map((a) => (
                <article key={a.AccountID} className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{a.AccountType}</p>
                  <p className="mt-2 text-sm text-slate-500">Account **** {String(a.AccountID).slice(-4).padStart(4, "0")}</p>
                  <p className="mt-5 text-2xl font-semibold">{fmt(a.Balance)}</p>
                  <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(a.Status)}`}>
                    {a.Status}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Loans */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-600">Loan overview</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Active loans</h2>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading loans…</p>
              ) : loans.length === 0 ? (
                <p className="text-sm text-slate-500">No loans found.</p>
              ) : loans.map((l) => (
                <article key={l.Loan_No} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Loan #{l.Loan_No}</h3>
                    <p className="mt-1 text-sm text-slate-600">Amount: {fmt(l.Amount)}</p>
                    {l.BranchName && <p className="mt-1 text-sm text-slate-600">Branch: {l.BranchName}</p>}
                  </div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(l.Status)}`}>
                    {l.Status}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Quick actions</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Customer tools</h2>
            <div className="mt-6 space-y-4">
              {quickActions.map((action) => (
                <article key={action.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                  <Link href={action.href} className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                    {action.action}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Profile details</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Personal information</h2>
            <div className="mt-6 space-y-4">
              {[
                { label: "Name", value: user?.name ?? "—" },
                { label: "Email", value: user?.email ?? "—" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{f.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>
            <Link href="/customer/profile" className="mt-6 block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800">
              Update profile
            </Link>
          </div>
        </div>
      </section>
    </CustomerPortal>
  );
}
