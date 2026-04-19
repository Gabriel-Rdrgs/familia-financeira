// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* SIDEBAR ÚNICA */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950">
        {/* Topo da sidebar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-yellow-400 text-slate-900 flex items-center justify-center text-sm font-bold">
            FF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              Família Financeira
            </span>
            <span className="text-xs text-slate-400">Painel da família</span>
          </div>
        </div>

        {/* Menu principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {/* Item ativo */}
          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 bg-yellow-400 text-slate-950 font-medium shadow-sm hover:bg-yellow-300 transition-colors">
            <span className="text-lg">▢</span>
            <span>Visão geral</span>
          </button>

          {/* Itens inativos */}
          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-slate-200 hover:bg-yellow-500/10 hover:text-yellow-200 transition-colors">
            <span className="text-lg">☰</span>
            <span>Transações</span>
          </button>

          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-slate-200 hover:bg-yellow-500/10 hover:text-yellow-200 transition-colors">
            <span className="text-lg">◎</span>
            <span>Metas</span>
          </button>

          <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-slate-200 hover:bg-yellow-500/10 hover:text-yellow-200 transition-colors">
            <span className="text-lg">🏬</span>
            <span>Negócio</span>
          </button>
        </nav>

        {/* Rodapé / avatar */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
            N
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}