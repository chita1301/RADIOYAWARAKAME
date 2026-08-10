import Link from "next/link";
import { adminLogoutAction } from "@/app/admin/logout/actions";

const navItems = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/participants", label: "参加者一覧" },
  { href: "/admin/stamps", label: "スタンプ管理" },
  { href: "/admin/card", label: "カード配置" },
  { href: "/admin/perfect-attendance", label: "皆勤賞管理" },
];

export function AdminNav() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
      <nav className="flex flex-wrap gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={adminLogoutAction}>
        <button type="submit" className="text-sm text-slate-500 underline">
          ログアウト
        </button>
      </form>
    </div>
  );
}
