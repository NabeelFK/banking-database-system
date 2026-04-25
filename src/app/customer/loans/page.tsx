"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

interface Loan {
  Loan_No: number;
  Amount: number;
  Status: string;
  BranchName: string | null;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    Pending:        "bg-amber-100 text-amber-700",
    Approved:       "bg-emerald-100 text-emerald-700",
    Rejected:       "bg-red-100 text-red-700",
    "Under Review": "bg-violet-100 text-violet-700",
  };
  return map[s] ?? "bg-slate-100 text-slate-600";
}

export default function CustomerLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/customer/loans")
      .then((data) => setLoans(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load loans"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerPortal
      activePage="loans"
      title="Your loans"
      description="View all your loan applications and their current status."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">Loan overview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">All loans</h2>
          </div>
          <Link
            href="/customer/request-loan"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Request loan
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : loans.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-6 py-10 text-center ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-700">No loans yet</p>
              <p className="mt-2 text-sm text-slate-500">Submit a loan request to get started.</p>
              <Link
                href="/customer/request-loan"
                className="mt-4 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                Request a loan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-6">Loan #</th>
                    <th className="pb-3 pr-6">Amount</th>
                    <th className="pb-3 pr-6">Branch</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((l) => (
                    <tr key={l.Loan_No} className="hover:bg-slate-50">
                      <td className="py-4 pr-6 font-mono text-slate-700">#{l.Loan_No}</td>
                      <td className="py-4 pr-6 font-semibold text-slate-900">{fmt(l.Amount)}</td>
                      <td className="py-4 pr-6 text-slate-500">{l.BranchName ?? "—"}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(l.Status)}`}>
                          {l.Status}
                        </span>
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
