"use client";

import { useEffect, useState } from "react";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

interface Account {
  AccountID: number;
  AccountType: string;
  Balance: number;
  Status: string;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomerTransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const userId = stored ? JSON.parse(stored).userId : null;
    if (!userId) { setLoading(false); return; }
    apiFetch(`/api/customer/accounts?userId=${userId}`)
      .then((data) => {
        const active = (Array.isArray(data) ? data : []).filter((a: Account) => a.Status === "Active");
        setAccounts(active);
        if (active.length > 0) setFromId(String(active[0].AccountID));
      })
      .catch(() => setError("Failed to load accounts"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const parsed = parseFloat(amount);
    if (!fromId || !toId || isNaN(parsed) || parsed <= 0) {
      setError("Fill in all fields with a valid amount.");
      return;
    }
    if (fromId === toId) { setError("Source and destination must differ."); return; }
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/customer/transfer", {
        method: "POST",
        body: JSON.stringify({ fromAccountId: Number(fromId), toAccountId: Number(toId), amount: parsed }),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess(`Transfer successful! New balance on account #${fromId}: ${fmt(data.newSourceBalance)}`);
      setAmount("");
      // refresh balances
      const stored = localStorage.getItem("user");
      const userId = stored ? JSON.parse(stored).userId : null;
      if (userId) {
        const updated = await apiFetch(`/api/customer/accounts?userId=${userId}`);
        setAccounts((Array.isArray(updated) ? updated : []).filter((a: Account) => a.Status === "Active"));
      }
    } catch {
      setError("Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fromAccount = accounts.find((a) => String(a.AccountID) === fromId);

  return (
    <CustomerPortal
      activePage="transfer"
      title="Transfer funds"
      description="Move money between accounts instantly."
    >
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Transfer money</h2>
          <p className="mt-2 text-sm text-slate-600">Transfer funds from your account to any active account.</p>

          {success && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{success}</div>
          )}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading accounts…</p>
          ) : accounts.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No active accounts to transfer from.</p>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">From account</label>
                <select
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  {accounts.map((a) => (
                    <option key={a.AccountID} value={a.AccountID}>
                      {a.AccountType} #{a.AccountID} — {fmt(a.Balance)}
                    </option>
                  ))}
                </select>
                {fromAccount && (
                  <p className="mt-1 text-xs text-slate-500">Available: {fmt(fromAccount.Balance)}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">To account ID</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Destination account number"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Processing…" : "Confirm transfer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </CustomerPortal>
  );
}
