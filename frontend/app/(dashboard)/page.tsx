// app/(dashboard)/page.tsx
export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Painel</h1>
          <p className="text-sm text-slate-400">
            Acompanhe o mês da família em tempo real.
          </p>
        </div>
        <div className="rounded-full border border-slate-700 px-4 py-1 text-xs text-slate-300">
          Abril 2026
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-8 py-6 space-y-6">

        {/* Cabeçalho com botão */}
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-slate-50">
                Painel financeiro
              </h2>
              <span className="inline-flex items-center rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                versão beta
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Acompanhe saldos, fluxo de caixa e metas da sua família em um só lugar.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium shadow-sm hover:bg-yellow-300 transition-colors">
            + Novo lançamento
          </button>
        </header>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
              Saldo consolidado
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              R$ 8.420,37
            </p>
            <p className="mt-1 text-xs text-emerald-400">
              + R$ 1.230,00 neste mês
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
              Despesas do mês
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              R$ 3.987,12
            </p>
            <p className="mt-1 text-xs text-amber-300">
              72% do orçamento utilizado
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
              Metas
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              3 de 5
            </p>
            <p className="mt-1 text-xs text-slate-400">
              1 meta em risco neste mês
            </p>
          </div>
        </div>

        {/* Próximos lançamentos */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Próximos lançamentos
              </h3>
              <p className="text-xs text-slate-400">
                Vencimentos para os próximos 7 dias.
              </p>
            </div>
            <button className="text-xs text-slate-400 hover:text-yellow-400 underline-offset-4 hover:underline transition-colors">
              Ver todos
            </button>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span>Aluguel</span>
              <span className="text-xs text-slate-400">20/04 • R$ 1.850,00</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span>Cartão de crédito</span>
              <span className="text-xs text-slate-400">23/04 • R$ 1.230,45</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Mercado</span>
              <span className="text-xs text-slate-400">21/04 • R$ 420,30</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}