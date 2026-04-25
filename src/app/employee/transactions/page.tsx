"use client";

import { useEffect, useState } from "react";
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

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function typeBadge(type: string) {
  if (type === "Deposit") return "bg-emerald-100 text-emerald-700";
  if (type === "Withdraw") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function EmployeeTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    apiFetch("/api/employee/transactions")
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  const types = ["All", "Deposit", "Withdraw", "Transfer"];
  const visible = filter === "All" ? transactions : transactions.filter((t) => t.Type === filter);

  return (
    <EmployeePortal
      activePage="transactions"
      title="Transaction management"
      description="Review all customer transactions."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">All transactions</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Transaction history</h2>
          </div>
          <div className="flex gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filter === t ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:border-slate-900"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Account</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((t) => (
                  <tr key={t.TransactionID} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-mono text-slate-700">TX-{t.TransactionID}</td>
                    <td className="py-3 pr-4 text-slate-700">{t.CustomerName ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge(t.Type)}`}>
                        {t.Type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{fmt(t.Amount)}</td>
                    <td className="py-3 pr-4 text-slate-500">{t.AccountID ?? "—"}</td>
                    <td className="py-3 text-slate-500">{new Date(t.Timestamp).toLocaleString("en-CA")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </EmployeePortal>
  );
}
