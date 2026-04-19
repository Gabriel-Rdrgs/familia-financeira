// app/(dashboard)/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Store,
  User,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/negocio", label: "Negócio", icon: Store },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-yellow-400 text-slate-900 flex items-center justify-center text-sm font-bold select-none">
            FF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              Família Financeira
            </span>
            <span className="text-xs text-slate-400">Painel da família</span>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-yellow-400 text-slate-950 font-medium shadow-sm"
                    : "text-slate-200 hover:bg-yellow-500/10 hover:text-yellow-200"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-slate-300">
            <User size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-200">Gabriel</span>
            <span className="text-[11px] text-slate-500">Família</span>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}