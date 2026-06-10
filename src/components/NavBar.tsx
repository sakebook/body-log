"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const links = [
    { href: "/", label: "ダッシュボード" },
    { href: "/upload", label: "記録する" },
    { href: "/history", label: "履歴" },
  ];

  return (
    <nav className="nav" aria-label="メインナビゲーション">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label="BodyLog ホーム">
          BodyLog
        </Link>

        <ul className="nav-links" role="list">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link${pathname === href ? " active" : ""}`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="nav-link btn"
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ minInlineSize: "auto", padding: "0.5rem 0.875rem" }}
            >
              ログアウト
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
