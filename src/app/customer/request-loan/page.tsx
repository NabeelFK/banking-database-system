"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomerRequestLoanPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid loan amount.");
      return;
    }
    if (parsed > 1_000_000) {
      setError("Maximum loan amount is $1,000,000.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/customer/loans", {
        method: "POST",
        body: JSON.stringify({ amount: parsed }),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess(`Loan request #${data.loanNo} submitted for ${fmt(data.amount)}. Status: ${data.status}.`);
      setAmount("");
    } catch {
      setError("Failed to submit loan request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomerPortal
      activePage="loans"
      title="Request a loan"
      description="Submit a new loan application. A representative will review your request."
    >
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">New loan application</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter the amount you would like to borrow. Applications start as <strong>Pending</strong> and are reviewed by our team.
          </p>

          {success && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
              {success}
              <div className="mt-3">
                <button
                  onClick={() => router.push("/customer/loans")}
                  className="text-emerald-800 underline underline-offset-2"
                >
                  View your loans
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Loan amount ($)</label>
              <input
                type="number"
                min="100"
                max="1000000"
                step="0.01"
                placeholder="e.g. 5000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">Minimum $100 — Maximum $1,000,000</p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">What happens next?</p>
              <p>Your request will be marked <span className="font-medium text-amber-700">Pending</span> immediately.</p>
              <p>An employee will review it and move it to <span className="font-medium text-violet-700">Under Review</span>.</p>
              <p>A manager will make the final <span className="font-medium text-emerald-700">Approved</span> or <span className="font-medium text-red-700">Rejected</span> decision.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit loan request"}
            </button>
          </form>
        </div>
      </div>
    </CustomerPortal>
  );
}
