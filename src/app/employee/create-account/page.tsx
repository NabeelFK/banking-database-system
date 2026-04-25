"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ThemeToggleIcon } from "@/components/theme-toggle";

export default function EmployeeCreateAccountPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    emergencyNo: "",
    role: "Employee",
    branchId: "1",
    dependentName: "",
    dependentRelationship: "",
    dependentDob: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function setField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, string | number | undefined> = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        emergencyNo: form.emergencyNo || undefined,
        role: form.role,
        branchId: form.branchId ? Number(form.branchId) : undefined,
      };
      if (form.dependentName && form.dependentDob) {
        payload.dependentName = form.dependentName;
        payload.dependentRelationship = form.dependentRelationship || undefined;
        payload.dependentDob = form.dependentDob;
      }
      const data = await apiFetch("/api/employee/create-account", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess(`Employee account created for ${data.name} (${data.email}) with role ${data.role}.`);
      setForm({
        name: "", email: "", password: "", phone: "", emergencyNo: "",
        role: "Employee", branchId: "1",
        dependentName: "", dependentRelationship: "", dependentDob: "",
      });
    } catch {
      setError("Failed to create employee account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900";
  const labelCls = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <main className="min-h-screen text-slate-900" style={{ background: "var(--paper)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="keel-wordmark" style={{ fontSize: 20 }}>Keel</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggleIcon />
            <Link href="/employee/dashboard" className="keel-btn ghost" style={{ padding: "8px 16px" }}>Back to dashboard</Link>
          </div>
        </header>

        <section className="py-10">
          <div className="rounded-2xl px-8 py-8 ring-1 ring-slate-200" style={{ background: "var(--paper-2)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Manager action</p>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,4vw,44px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.026em", marginTop: 12, color: "var(--ink)" }}>
              Create a staff account
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Set up access credentials, assign a role and branch, and optionally add dependent information.
            </p>
          </div>

          {success && (
            <div className="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{success}</div>
          )}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* Staff details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold">Staff details</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input type="text" placeholder="Employee name" required value={form.name} onChange={setField("name")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" placeholder="employee@ourbank.com" required value={form.email} onChange={setField("email")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password * (min. 8 characters)</label>
                  <input type="password" placeholder="Temporary password" required minLength={8} value={form.password} onChange={setField("password")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="text" placeholder="555-0100" value={form.phone} onChange={setField("phone")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Emergency contact number</label>
                  <input type="text" placeholder="555-0999" value={form.emergencyNo} onChange={setField("emergencyNo")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Role *</label>
                  <select value={form.role} onChange={setField("role")} className={inputCls + " bg-white"}>
                    <option>Teller</option>
                    <option>Employee</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Branch ID</label>
                  <input type="number" min="1" placeholder="1" value={form.branchId} onChange={setField("branchId")} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Dependent information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-base font-semibold">Dependent information</h2>
              <p className="mb-5 text-sm text-slate-500">Optional — leave blank if not applicable.</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Dependent name</label>
                  <input type="text" placeholder="Dependent full name" value={form.dependentName} onChange={setField("dependentName")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Relationship</label>
                  <input type="text" placeholder="e.g. Spouse, Child" value={form.dependentRelationship} onChange={setField("dependentRelationship")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of birth</label>
                  <input type="date" value={form.dependentDob} onChange={setField("dependentDob")} className={inputCls} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create employee account"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
