"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  active?: boolean;
};

type HeaderAction = {
  href?: string;
  label: string;
  primary?: boolean;
  signOut?: boolean;
  signOutRedirect?: string;
};

type StatItem = {
  label: string;
  value: string;
};

type PortalShellProps = {
  sectionLabel: string;
  title: string;
  description: string;
  navItems: NavItem[];
  headerActions?: HeaderAction[];
  stats?: StatItem[];
  children: ReactNode;
};

const NAV_ICONS: Record<string, ReactNode> = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  Accounts: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M11 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Transactions: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Transfer: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 5h9l-2-2M13 11H4l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Deposit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v10M3 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" transform="rotate(180 8 8)"/>
      <path d="M8 12V2M3.5 8.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Loans: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13V6l5-3.5L13 6v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 13V9h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  Payees: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 13.5c.8-2.2 2.7-3.5 5-3.5s4.2 1.3 5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Profile: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 13.5c.8-2.2 2.7-3.5 5-3.5s4.2 1.3 5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function PortalShell({
  sectionLabel,
  title,
  description,
  navItems,
  headerActions = [],
  stats = [],
  children,
}: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleSignOut(redirect: string) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push(redirect);
  }

  const isEmployee = pathname.startsWith("/employee");
  const wordmark = isEmployee ? "Keel — Staff" : "Keel";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--paper)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: "var(--paper-2)",
        borderRight: "1px solid var(--rule)",
        padding: "28px 18px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 36 }}>
          <div className="keel-wordmark">{wordmark}</div>
          <div style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--ink-4)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 6,
            paddingLeft: 18,
          }}>
            {sectionLabel}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`keel-nav-item${item.active ? " active" : ""}`}
            >
              <span style={{ display: "inline-flex", opacity: item.active ? 0.85 : 0.6 }}>
                {NAV_ICONS[item.label] ?? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <div style={{ marginBottom: 8 }}>
          <ThemeToggle />
        </div>

        {/* Sign-out at bottom */}
        {headerActions.filter(a => a.signOut).map(action => (
          <button
            key={action.label}
            onClick={() => handleSignOut(action.signOutRedirect ?? "/login")}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "9px 12px",
              border: "1px solid var(--rule-2)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--ink-3)",
              fontFamily: "var(--sans)",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {action.label}
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Page header */}
        <header style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "36px 40px 22px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-4)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {description}
            </div>
            <h1 style={{
              fontFamily: "var(--serif)",
              fontSize: 48,
              fontWeight: 300,
              lineHeight: 1.02,
              letterSpacing: "-0.026em",
              margin: 0,
              color: "var(--ink)",
            }}>
              {title}
            </h1>
          </div>

          {/* Non-signout header actions */}
          {headerActions.filter(a => !a.signOut).length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {headerActions.filter(a => !a.signOut).map(action =>
                action.href ? (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`keel-btn${action.primary ? " accent" : " ghost"}`}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    className={`keel-btn${action.primary ? " accent" : " ghost"}`}
                  >
                    {action.label}
                  </button>
                )
              )}
            </div>
          )}
        </header>

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: 1,
            borderBottom: "1px solid var(--rule)",
            background: "var(--rule)",
          }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "20px 28px",
                  background: "var(--paper-3)",
                }}
              >
                <div style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--ink-4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: "var(--serif)",
                  fontSize: 28,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                  marginTop: 8,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, padding: "32px 40px 60px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
