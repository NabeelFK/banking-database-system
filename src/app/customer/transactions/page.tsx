"use client";

import { useEffect, useState } from "react";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

interface Transaction {
  TransactionID: number;
  Timestamp: string;
  Amount: number;
  Type: string;
  AccountID: number | null;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    Deposit:  "bg-emerald-100 text-emerald-700",
    Withdraw: "bg-red-100 text-red-700",
    Transfer: "bg-blue-100 text-blue-700",
  };
  return map[type] ?? "bg-slate-100 text-slate-600";
}

function typeSign(type: string) {
  if (type === "Deposit") return "+";
  if (type === "Withdraw") return "−";
  return "↔";
}

function typeColor(type: string) {
  if (type === "Deposit") return "text-emerald-700";
  if (type === "Withdraw") return "text-red-700";
  return "text-blue-700";
}

export default function CustomerTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/customer/transactions")
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerPortal
      activePage="transactions"
      title="Transaction history"
      description="A full record of all deposits, withdrawals, and transfers on your accounts."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-600">Activity log</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Recent transactions</h2>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-6 py-10 text-center ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-700">No transactions yet</p>
              <p className="mt-2 text-sm text-slate-500">Transactions will appear here after your first deposit or transfer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-6">Txn #</th>
                    <th className="pb-3 pr-6">Date & time</th>
                    <th className="pb-3 pr-6">Type</th>
                    <th className="pb-3 pr-6">Account</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.TransactionID} className="hover:bg-slate-50">
                      <td className="py-4 pr-6 font-mono text-xs text-slate-500">#{t.TransactionID}</td>
                      <td className="py-4 pr-6 text-slate-600">
                        {new Date(t.Timestamp).toLocaleString("en-CA", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge(t.Type)}`}>
                          {t.Type}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-slate-500">
                        {t.AccountID != null ? `#${t.AccountID}` : "—"}
                      </td>
                      <td className={`py-4 text-right font-semibold ${typeColor(t.Type)}`}>
                        {typeSign(t.Type)}{fmt(t.Amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerPortal>
  );
}
