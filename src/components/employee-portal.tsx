"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import PortalShell from "@/components/portal-shell";

type EmployeePortalProps = {
  activePage:
    | "dashboard"
    | "transactions"
    | "accounts"
    | "loans"
    | "manager"
    | "profile";
  title: string;
  description: string;
  children: ReactNode;
  stats?: { label: string; value: string }[];
};

export default function EmployeePortal({
  activePage,
  title,
  description,
  children,
  stats,
}: EmployeePortalProps) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setRole(typeof parsed.role === "string" ? parsed.role.trim().toLowerCase() : null);
    } catch {
      setRole(null);
    }
  }, []);

  const navItems = [
    { href: "/employee/dashboard", label: "Dashboard", active: activePage === "dashboard" },
    { href: "/employee/transactions", label: "Transactions", active: activePage === "transactions" },
    { href: "/employee/accounts", label: "Accounts", active: activePage === "accounts" },
    { href: "/employee/loans", label: "Loans", active: activePage === "loans" },
    ...(role === "manager"
      ? [{ href: "/employee/manager", label: "Manager tools", active: activePage === "manager" }]
      : []),
    { href: "/employee/profile", label: "Profile", active: activePage === "profile" },
  ];

  return (
    <PortalShell
      sectionLabel="Employee management and admin tools"
      title={title}
      description={description}
      navItems={navItems}
      headerActions={[
        { href: "/employee/transactions", label: "Review transactions", primary: true },
        { label: "Sign out", signOut: true, signOutRedirect: "/employee/login" },
      ]}
      stats={stats}
    >
      {children}
    </PortalShell>
  );
}
