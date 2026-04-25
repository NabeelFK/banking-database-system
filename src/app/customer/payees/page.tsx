"use client";

import { useEffect, useState } from "react";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

interface Payee {
  Payee_id: number;
  Company_name: string;
}

export default function CustomerPayeesPage() {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function load() {
    return apiFetch("/api/customer/payees")
      .then((data) => setPayees(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load payees"));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/customer/payees", {
        method: "POST",
        body: JSON.stringify({ company_name: newName.trim() }),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess(`"${newName.trim()}" added as a payee.`);
      setNewName("");
      await load();
    } catch {
      setError("Failed to add payee.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(payeeId: number, name: string) {
    setError("");
    try {
      await apiFetch(`/api/customer/payees/${payeeId}`, { method: "DELETE" });
      setPayees((prev) => prev.filter((p) => p.Payee_id !== payeeId));
      setSuccess(`"${name}" removed.`);
    } catch {
      setError("Failed to remove payee.");
    }
  }

  return (
    <CustomerPortal
      activePage="payees"
      title="Manage payees"
      description="Add and remove saved payees for bill payments."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Payees list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Saved payees</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Payee list</h2>

          {success && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{success}</div>
          )}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : payees.length === 0 ? (
              <p className="text-sm text-slate-500">No payees saved yet. Add one using the form.</p>
            ) : payees.map((p) => (
              <div key={p.Payee_id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-700">{p.Company_name}</p>
                <button
                  onClick={() => handleRemove(p.Payee_id, p.Company_name)}
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add payee */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">New payee</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Add a payee</h2>
          <p className="mt-2 text-sm text-slate-600">Enter the company or payee name to save it to your account.</p>

          <form className="mt-6 space-y-4" onSubmit={handleAdd}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Company name</label>
              <input
                type="text"
                placeholder="e.g. City Utilities"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add payee"}
            </button>
          </form>
        </div>
      </div>
    </CustomerPortal>
  );
}
