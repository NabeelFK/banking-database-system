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
  OpenDate: string;
  Overdraft_limit: number | null;
  Interest_rate: number | null;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(s: string) {
  if (s === "Active") return "bg-emerald-100 text-emerald-700";
  if (s === "Frozen") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-500";
}

export default function CustomerAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const userId = stored ? JSON.parse(stored).userId : null;
    if (!userId) { setError("Not logged in"); setLoading(false); return; }

    apiFetch(`/api/customer/accounts?userId=${userId}`)
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load accounts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerPortal
      activePage="accounts"
      title="Customer accounts"
      description="View all your bank accounts, balances, and account details."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">All accounts</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your bank accounts</h2>
          </div>
          <Link href="/customer/create-account" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900">
            New account
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-slate-500">No accounts found.</p>
          ) : accounts.map((a) => (
            <article key={a.AccountID} className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{a.AccountType}</p>
                  <p className="mt-1 text-xs text-slate-400">Account #{a.AccountID}</p>
                </div>
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(a.Status)}`}>
                  {a.Status}
                </div>
              </div>
              <p className="text-3xl font-semibold">{fmt(a.Balance)}</p>
              <div className="border-t border-slate-200 pt-3 space-y-1 text-xs text-slate-500">
                <p>Opened: {new Date(a.OpenDate).toLocaleDateString("en-CA")}</p>
                {a.Overdraft_limit != null && <p>Overdraft limit: {fmt(a.Overdraft_limit)}</p>}
                {a.Interest_rate != null && <p>Interest rate: {a.Interest_rate}%</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </CustomerPortal>
  );
}
