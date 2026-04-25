"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EmployeePortal from "@/components/employee-portal";
import { apiFetch } from "@/lib/api";

interface Transaction {
  TransactionID: number;
  Timestamp: string;
  Amount: number;
  CustomerName: string;
  Type: string;
  AccountID: number | null;
}

interface Account {
  AccountID: number;
  AccountType: string;
  Balance: number;
  Status: string;
  OwnerName: string;
}

interface Loan {
  Loan_No: number;
  Amount: number;
  Status: string;
  CustomerName: string;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function txBadge(type: string) {
  if (type === "Deposit") return "bg-emerald-100 text-emerald-700";
  if (type === "Withdraw") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

const managerTasks = [
  { title: "Assignment tools", detail: "View employees, current assignments, and unassigned work from the manager workspace.", action: "Open manager tools", href: "/employee/manager" },
  { title: "Create staff account", detail: "Set up login credentials, assign a role and branch, and add dependent info for a new employee.", action: "Create employee account", href: "/employee/create-account" },
];

export default function EmployeeDashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({
        ...parsed,
        role: typeof parsed.role === "string" ? parsed.role.trim().toLowerCase() : "",
      });
    }

    Promise.all([
      apiFetch("/api/employee/transactions"),
      apiFetch("/api/employee/accounts"),
      apiFetch("/api/employee/loans"),
    ])
      .then(([txs, accts, lns]) => {
        setTransactions((Array.isArray(txs) ? txs : []).slice(0, 5));
        setAccounts((Array.isArray(accts) ? accts : []).slice(0, 5));
        setLoans((Array.isArray(lns) ? lns : []).slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const flaggedAccounts = accounts.filter((a) => a.Status === "Frozen");

  return (
    <EmployeePortal
      activePage="dashboard"
      title="Manage customer operations and staff workflows."
      description="Shared staff dashboard for transaction review, account controls, and loan processing."
      stats={[
        { label: "Transactions to review", value: loading ? "—" : String(transactions.length) },
        { label: "Frozen accounts", value: loading ? "—" : String(flaggedAccounts.length) },
        { label: "Loan items open", value: loading ? "—" : String(loans.filter((l) => l.Status === "Pending").length) },
        { label: "Total accounts", value: loading ? "—" : String(accounts.length) },
      ]}
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          {/* Transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-600">Daily admin tasks</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Recent transactions</h2>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No transactions found.</p>
              ) : transactions.map((t) => (
                <article key={t.TransactionID} className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">TX-{t.TransactionID}</p>
                      <p className="mt-1 text-sm text-slate-600">{t.CustomerName ?? "Unknown"} — {t.Type}</p>
                      <p className="mt-1 text-sm text-slate-600">Amount: {fmt(t.Amount)}</p>
                    </div>
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${txBadge(t.Type)}`}>
                      {t.Type}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/employee/transactions" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                      View all transactions
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Account controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-600">Account controls</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Freeze and unfreeze accounts</h2>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-slate-500">No accounts found.</p>
              ) : accounts.map((a) => (
                <article key={a.AccountID} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{a.OwnerName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{a.AccountType} #{a.AccountID}</p>
                    <p className="mt-1 text-sm text-slate-600">Status: {a.Status}</p>
                  </div>
                  <Link href="/employee/accounts" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                    {a.Status === "Frozen" ? "Unfreeze account" : "Freeze account"}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Loans */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-600">Loan processing</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Loan status controls</h2>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : loans.length === 0 ? (
                <p className="text-sm text-slate-500">No loans found.</p>
              ) : loans.map((l) => (
                <article key={l.Loan_No} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{l.CustomerName}</h3>
                    <p className="mt-1 text-sm text-slate-600">Loan #{l.Loan_No} — {fmt(l.Amount)}</p>
                    <p className="mt-1 text-sm text-slate-600">Status: {l.Status}</p>
                  </div>
                  <Link href="/employee/loans" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                    Update status
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Staff profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Employee profile</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Basic user information</h2>
            <div className="mt-6 space-y-4">
              {[
                { label: "Name", value: user?.name ?? "—" },
                { label: "Role", value: user?.role ?? "—" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{f.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-800 capitalize">{f.value}</p>
                </div>
              ))}
            </div>
            <Link href="/employee/profile" className="mt-6 block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800">
              Update employee profile
            </Link>
          </div>

          {user?.role === "manager" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Manager tools</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Additional management controls</h2>
              <div className="mt-6 space-y-4">
                {managerTasks.map((item) => (
                  <article key={item.title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    <Link href={item.href} className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
                      {item.action}
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </EmployeePortal>
  );
}
