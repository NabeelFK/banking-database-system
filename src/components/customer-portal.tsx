import type { ReactNode } from "react";
import PortalShell from "@/components/portal-shell";

type CustomerPortalProps = {
  activePage: "dashboard" | "accounts" | "transactions" | "loans" | "payees" | "profile" | "transfer" | "withdraw";
  title: string;
  description: string;
  children: ReactNode;
  stats?: { label: string; value: string }[];
};

export default function CustomerPortal({
  activePage,
  title,
  description,
  children,
  stats,
}: CustomerPortalProps) {
  return (
    <PortalShell
      sectionLabel="Personal banking dashboard"
      title={title}
      description={description}
      navItems={[
        { href: "/customer/dashboard",     label: "Dashboard",     active: activePage === "dashboard" },
        { href: "/customer/accounts",      label: "Accounts",      active: activePage === "accounts" },
        { href: "/customer/transactions",  label: "Transactions",  active: activePage === "transactions" },
        { href: "/customer/loans",         label: "Loans",         active: activePage === "loans" },
        { href: "/customer/transfer",      label: "Transfer",      active: activePage === "transfer" },
        { href: "/customer/payees",        label: "Payees",        active: activePage === "payees" },
        { href: "/customer/profile",       label: "Profile",       active: activePage === "profile" },
      ]}
      headerActions={[
        { href: "/customer/deposit",  label: "Deposit",  primary: true },
        { href: "/customer/withdraw", label: "Withdraw", primary: false },
        { label: "Sign out", signOut: true, signOutRedirect: "/login" },
      ]}
      stats={stats}
    >
      {children}
    </PortalShell>
  );
}
