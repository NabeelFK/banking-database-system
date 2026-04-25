"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerPortal from "@/components/customer-portal";
import { apiFetch } from "@/lib/api";

export default function CustomerCreateAccountPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState("Chequing Account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const stored = localStorage.getItem("user");
      const userId = stored ? JSON.parse(stored).userId : null;
      if (!userId) { setError("Not logged in"); return; }

      const data = await apiFetch("/api/customer/accounts", {
        method: "POST",
        body: JSON.stringify({ userId, accountType }),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess(`${accountType} created successfully! Account #${data.account.accountId}`);
      setTimeout(() => router.push("/customer/accounts"), 1500);
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerPortal
      activePage="accounts"
      title="Create a new account"
      description="Open a new chequing or savings account. Funds can be deposited immediately after creation."
    >
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">New bank account</h2>
          <p className="mt-2 text-sm text-slate-600">Choose your account type to get started.</p>

          {success && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{success}</div>
          )}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Account type</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Chequing Account", "Savings Account"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={`rounded-xl p-5 text-left ring-1 transition-all ${
                      accountType === type
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-slate-50 text-slate-700 ring-slate-200 hover:ring-slate-400"
                    }`}
                  >
                    <p className="text-sm font-semibold">{type}</p>
                    <p className={`mt-1 text-xs ${accountType === type ? "text-slate-300" : "text-slate-500"}`}>
                      {type === "Chequing Account"
                        ? "$500 overdraft limit · No interest"
                        : "2.50% interest rate · No overdraft"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Creating…" : `Open ${accountType}`}
            </button>
          </form>
        </div>
      </div>
    </CustomerPortal>
  );
}
