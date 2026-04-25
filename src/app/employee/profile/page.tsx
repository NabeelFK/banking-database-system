"use client";

import { useEffect, useState } from "react";
import EmployeePortal from "@/components/employee-portal";
import { apiFetch } from "@/lib/api";

interface EmployeeProfile {
  UserID: number;
  Name: string;
  Email: string;
  Phone: string | null;
  Role: string | null;
  EmergencyNo: string | null;
  BranchName: string | null;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", emergencyNo: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    apiFetch("/api/employee/profile")
      .then((data: EmployeeProfile) => {
        setProfile(data);
        setForm({
          name: data.Name,
          email: data.Email,
          phone: data.Phone ?? "",
          emergencyNo: data.EmergencyNo ?? "",
        });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function setField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const data = await apiFetch("/api/employee/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (data.error) { setError(data.error); return; }
      setProfile(data.user);
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      const data = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (data.error) { setPwError(data.error); return; }
      setPwSuccess("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPwError("Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  const inputCls = "w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900";
  const labelCls = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <EmployeePortal
      activePage="profile"
      title="Employee profile"
      description="View and update your personal and emergency contact information."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Current info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Staff information</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Current details</h2>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading…</p>
          ) : !profile ? (
            <p className="mt-6 text-sm text-red-500">{error}</p>
          ) : (
            <div className="mt-6 space-y-3">
              {[
                { label: "Name",         value: profile.Name },
                { label: "Email",        value: profile.Email },
                { label: "Phone",        value: profile.Phone ?? "—" },
                { label: "Role",         value: profile.Role ?? "—" },
                { label: "Branch",       value: profile.BranchName ?? "—" },
                { label: "Emergency no.", value: profile.EmergencyNo ?? "—" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{f.label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit form + password change */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Edit profile</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Update information</h2>

            {success && (
              <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{success}</div>
            )}
            {error && !loading && (
              <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" value={form.name} onChange={setField("name")} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={setField("email")} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" placeholder="555-0100" value={form.phone} onChange={setField("phone")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Emergency contact number</label>
                <input type="text" placeholder="555-0999" value={form.emergencyNo} onChange={setField("emergencyNo")} className={inputCls} />
              </div>
              <button
                type="submit"
                disabled={saving || loading}
                className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>

          {/* Password change */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Security</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Change password</h2>

            {pwSuccess && (
              <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">{pwSuccess}</div>
            )}
            {pwError && (
              <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{pwError}</div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handlePasswordChange}>
              <div>
                <label className={labelCls}>Current password</label>
                <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>New password</label>
                <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} required minLength={8} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Confirm new password</label>
                <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} required minLength={8} className={inputCls} />
              </div>
              <button
                type="submit"
                disabled={pwSaving}
                className="block w-full rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {pwSaving ? "Updating…" : "Change password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </EmployeePortal>
  );
}
