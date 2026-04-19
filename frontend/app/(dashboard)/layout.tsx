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
  Users,
} from "lucide-react";

const navItems = [
  { href: "/",           label: "Visão geral",  icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações",   icon: ArrowLeftRight  },
  { href: "/metas",      label: "Metas",        icon: Target          },
  { href: "/negocio",    label: "Negócio",      icon: Store           },
  { href: "/pessoas",    label: "Pessoas",      icon: Users           },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">

      {/* ── SIDEBAR (desktop) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950 sticky top-0 h-screen">

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
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
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

        {/* Rodapé — placeholder para o usuário logado */}
        <div className="px-4 py-4 border-t border-slate-800">
          <Link
            href="/pessoas"
            className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs text-slate-900 font-bold shrink-0 select-none">
              G
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                Gabriel
              </span>
              <span className="text-[11px] text-slate-500">Administrador</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── CONTEÚDO PRINCIPAL ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

      {/* ── BARRA MOBILE ──────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-yellow-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
