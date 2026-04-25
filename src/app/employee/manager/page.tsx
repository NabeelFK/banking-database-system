"use client";

import { useEffect, useState } from "react";
import EmployeePortal from "@/components/employee-portal";
import { apiFetch } from "@/lib/api";

interface EmployeeAssignment {
  EmployeeID: number;
  EmployeeName: string;
  Role: string | null;
  AssignmentID: number | null;
  AssignmentTitle: string | null;
  AssignmentStatus: string | null;
}

interface UnassignedAssignment {
  AssignmentID: number;
  AssignmentTitle: string;
  AssignmentStatus: string | null;
}

interface ManagerAssignmentsResponse {
  employees: EmployeeAssignment[];
  unassignedAssignments: UnassignedAssignment[];
}

function badgeClass(status: string | null) {
  const colors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return colors[status || ""] ?? "bg-slate-100 text-slate-600";
}

export default function EmployeeManagerPage() {
  const [employees, setEmployees] = useState<EmployeeAssignment[]>([]);
  const [unassignedAssignments, setUnassignedAssignments] = useState<UnassignedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/manager/assignments")
      .then((data: ManagerAssignmentsResponse) => {
        setEmployees(Array.isArray(data.employees) ? data.employees : []);
        setUnassignedAssignments(Array.isArray(data.unassignedAssignments) ? data.unassignedAssignments : []);
      })
      .catch(() => setError("Failed to load employee assignments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <EmployeePortal
      activePage="manager"
      title="Manager tools"
      description="View all employees, their assignments, and assignments not yet assigned."
    >
      <div className="space-y-6">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-600">Employee overview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Employees and assignments</h2>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : employees.length === 0 ? (
              <p className="text-sm text-slate-500">No employees found.</p>
            ) : (
              employees.map((e, index) => (
                <article
                  key={`${e.EmployeeID}-${e.AssignmentID ?? "none"}-${index}`}
                  className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">{e.EmployeeName}</h3>
                    <p className="text-sm text-slate-600">Employee ID: {e.EmployeeID}</p>
                    {e.Role && <p className="text-sm text-slate-600">Role: {e.Role}</p>}

                    {e.AssignmentID ? (
                      <>
                        <p className="text-sm text-slate-700">
                          Assignment #{e.AssignmentID} — {e.AssignmentTitle}
                        </p>
                        {e.AssignmentStatus && (
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(e.AssignmentStatus)}`}>
                            {e.AssignmentStatus}
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">No assignment yet.</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-600">Unassigned work</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Assignments not yet given</h2>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : unassignedAssignments.length === 0 ? (
              <p className="text-sm text-slate-500">All assignments are assigned.</p>
            ) : (
              unassignedAssignments.map((a) => (
                <article
                  key={a.AssignmentID}
                  className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">{a.AssignmentTitle}</h3>
                    <p className="text-sm text-slate-600">Assignment ID: {a.AssignmentID}</p>
                    {a.AssignmentStatus && (
                      <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(a.AssignmentStatus)}`}>
                        {a.AssignmentStatus}
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </EmployeePortal>
  );
}