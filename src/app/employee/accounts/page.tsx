"use client";

import { useEffect, useState } from "react";
import EmployeePortal from "@/components/employee-portal";
import { apiFetch } from "@/lib/api";

interface Account {
  AccountID: number;
  AccountType: string;
  Balance: number;
  Status: string;
  OpenDate: string;
  OwnerName: string;
  OwnerID: number;
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

export default function EmployeeAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    apiFetch("/api/employee/accounts")
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load accounts"))
      .finally(() => setLoading(false));
  }, []);

  async function toggleStatus(account: Account) {
    const newStatus = account.Status === "Active" ? "Frozen" : "Active";
    setUpdating(account.AccountID);
    try {
      await apiFetch(`/api/employee/accounts/${account.AccountID}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setAccounts((prev) =>
        prev.map((a) => a.AccountID === account.AccountID ? { ...a, Status: newStatus } : a)
      );
    } catch {
      setError("Failed to update account status");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <EmployeePortal
      activePage="accounts"
      title="Account controls"
      description="Freeze and unfreeze customer accounts."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-600">All customer accounts</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Account management</h2>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-slate-500">No accounts found.</p>
          ) : accounts.map((a) => (
            <article key={a.AccountID} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold">{a.OwnerName}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(a.Status)}`}>
                    {a.Status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{a.AccountType} — Account #{a.AccountID}</p>
                <p className="mt-1 text-sm text-slate-600">Balance: {fmt(a.Balance)}</p>
                <p className="mt-1 text-xs text-slate-400">Opened: {new Date(a.OpenDate).toLocaleDateString("en-CA")}</p>
              </div>
              <button
                onClick={() => toggleStatus(a)}
                disabled={updating === a.AccountID}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                  a.Status === "Active"
                    ? "border border-red-300 text-red-700 hover:border-red-600 hover:text-red-900"
                    : "border border-emerald-300 text-emerald-700 hover:border-emerald-600 hover:text-emerald-900"
                }`}
              >
                {updating === a.AccountID ? "Updating…" : a.Status === "Active" ? "Freeze account" : "Unfreeze account"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </EmployeePortal>
  );
}
