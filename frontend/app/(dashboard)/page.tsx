// app/(dashboard)/page.tsx

// ─── Tipos alinhados com o dashboard.service.ts real ───────────────────────
type PilarItem = {
  total: number;
  percentualDaReceita: number;
};

type DashboardMensalResponse = {
  ano: number;
  mes: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  porCategoria: {
    categoriaId: number;
    nome: string;
    total: number;
    percentualDaReceita: number;
  }[];
  pilares: {
    essenciais: PilarItem;
    dividas: PilarItem;
    saude: PilarItem;
    lazer: PilarItem;
    negocio: PilarItem;
    investimentos: PilarItem;
  };
  limites: {
    essenciaisMaisSaude: {
      limitePercentual: number;
      usadoPercentual: number;
      dentroDoLimite: boolean;
    };
    lazer: {
      limitePercentual: number;
      usadoPercentual: number;
      dentroDoLimite: boolean;
    };
    prioridades: {
      minimoRecomendadoPercentual: number;
      usadoPercentual: number;
      atingiuMinimo: boolean;
    };
  };
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const API_URL = "http://localhost:3000";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

async function getDashboard(
  ano: number,
  mes: number
): Promise<DashboardMensalResponse> {
  const res = await fetch(
    `${API_URL}/dashboard/mensal?ano=${ano}&mes=${mes}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  return res.json() as Promise<DashboardMensalResponse>;
}

// ─── Sub-componentes puros ──────────────────────────────────────────────────
function ProgressBar({
  percent,
  color = "bg-yellow-400",
  limit,
}: {
  percent: number;
  color?: string;
  limit?: number;
}) {
  const safePercent = Math.min(100, Math.max(0, percent));
  const excedido = limit != null && percent > limit;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all ${excedido ? "bg-red-400" : color}`}
        style={{ width: `${safePercent}%` }}
      />
      {limit != null && (
        <div
          className="absolute top-0 h-full w-px bg-slate-400/60"
          style={{ left: `${Math.min(100, limit)}%` }}
        />
      )}
    </div>
  );
}

function StatusBadge({ ok, labelOk, labelNok }: { ok: boolean; labelOk: string; labelNok: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        ok
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-red-500/15 text-red-300"
      }`}
    >
      {ok ? labelOk : labelNok}
    </span>
  );
}

// ─── Página principal (Server Component) ───────────────────────────────────
export default async function DashboardPage() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  let data: DashboardMensalResponse | null = null;
  let error: string | null = null;

  try {
    data = await getDashboard(ano, mes);
  } catch (err) {
    console.error("[dashboard]", err);
    error =
      "Não foi possível conectar à API. Verifique se o backend está rodando em localhost:3000.";
  }

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full">
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Painel</h1>
          <p className="text-sm text-slate-400">
            Acompanhe o mês da família em tempo real.
          </p>
        </div>
        <div className="rounded-full border border-slate-700 px-4 py-1 text-xs text-slate-300 capitalize">
          {nomeMes}
        </div>
      </div>

      {/* ── Conteúdo ───────────────────────────────────────────────────── */}
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
              Saldos, pilares e metas da família — dados reais do banco de dados.
            </p>
          </div>
          {/* Botão de novo lançamento (será funcional na tela de transações) */}
          <a
            href="/transacoes"
            className="inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium shadow-sm hover:bg-yellow-300 transition-colors"
          >
            + Novo lançamento
          </a>
        </header>

        {/* ── Banner de erro ─────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            <p className="font-medium">Erro ao carregar o dashboard</p>
            <p className="text-xs text-red-200/80 mt-1">{error}</p>
          </div>
        )}

        {/* ── Cards de resumo (visíveis só quando data carregou) ─────── */}
        {data && (
          <>
            {/* 3 Cards de resumo */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Saldo */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
                  Saldo consolidado
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {fmt(data.saldo)}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    data.saldo >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {data.saldo >= 0 ? "Superávit" : "Déficit"} em{" "}
                  {nomeMes}
                </p>
              </div>

              {/* Despesas */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
                  Despesas do mês
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {fmt(data.totalDespesas)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Receitas:{" "}
                  <span className="text-slate-200 font-medium">
                    {fmt(data.totalReceitas)}
                  </span>
                </p>
              </div>

              {/* Investimentos */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
                  Investimentos / Reservas
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {fmt(data.pilares.investimentos.total)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge
                    ok={data.limites.prioridades.atingiuMinimo}
                    labelOk="Meta atingida ✓"
                    labelNok="Abaixo do mínimo"
                  />
                  <span className="text-xs text-slate-400">
                    {fmtPct(data.limites.prioridades.usadoPercentual)} de{" "}
                    {fmtPct(data.limites.prioridades.minimoRecomendadoPercentual)}{" "}
                    recomendados
                  </span>
                </div>
              </div>
            </div>

            {/* ── Grid: Pilares + Distribuição por categoria ─────────── */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* Pilares de gasto */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                    Pilares de gasto
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Percentual da receita mensal ({fmt(data.totalReceitas)})
                  </p>
                </div>

                {/* Essenciais */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Essenciais</span>
                    <span className="text-slate-400">
                      {fmt(data.pilares.essenciais.total)} •{" "}
                      {fmtPct(data.pilares.essenciais.percentualDaReceita)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={data.pilares.essenciais.percentualDaReceita}
                    color="bg-slate-200"
                    limit={35}
                  />
                  <p className="text-[11px] text-slate-500">Limite recomendado: 35%</p>
                </div>

                {/* Saúde */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Saúde</span>
                    <span className="text-slate-400">
                      {fmt(data.pilares.saude.total)} •{" "}
                      {fmtPct(data.pilares.saude.percentualDaReceita)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={data.pilares.saude.percentualDaReceita}
                    color="bg-emerald-400"
                    limit={15}
                  />
                  <p className="text-[11px] text-slate-500">Limite recomendado: 15%</p>
                </div>

                {/* Lazer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Lazer</span>
                    <span className="text-slate-400">
                      {fmt(data.pilares.lazer.total)} •{" "}
                      {fmtPct(data.pilares.lazer.percentualDaReceita)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={data.pilares.lazer.percentualDaReceita}
                    color="bg-purple-400"
                    limit={15}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">Limite recomendado: 15%</p>
                    <StatusBadge
                      ok={data.limites.lazer.dentroDoLimite}
                      labelOk="OK"
                      labelNok="Acima"
                    />
                  </div>
                </div>

                {/* Dívidas */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Dívidas</span>
                    <span className="text-slate-400">
                      {fmt(data.pilares.dividas.total)} •{" "}
                      {fmtPct(data.pilares.dividas.percentualDaReceita)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={data.pilares.dividas.percentualDaReceita}
                    color="bg-red-400"
                  />
                  <p className="text-[11px] text-slate-500">Meta: reduzir até zerar</p>
                </div>

                {/* Limite Essenciais + Saúde */}
                <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-300">
                      Essenciais + Saúde (limite 50%)
                    </p>
                    <StatusBadge
                      ok={data.limites.essenciaisMaisSaude.dentroDoLimite}
                      labelOk="Dentro do limite"
                      labelNok="Excedido!"
                    />
                  </div>
                  <ProgressBar
                    percent={data.limites.essenciaisMaisSaude.usadoPercentual}
                    color="bg-yellow-400"
                    limit={50}
                  />
                  <p className="text-[11px] text-slate-500">
                    Usado: {fmtPct(data.limites.essenciaisMaisSaude.usadoPercentual)} de 50%
                    permitidos
                  </p>
                </div>
              </div>

              {/* Breakdown por categoria */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                    Despesas por categoria
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranking de categorias no mês
                  </p>
                </div>

                {data.porCategoria.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Nenhuma despesa lançada neste mês ainda.
                    <br />
                    <a href="/transacoes" className="text-yellow-400 hover:underline text-xs mt-1 inline-block">
                      Lançar primeira transação →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...data.porCategoria]
                      .sort((a, b) => b.total - a.total)
                      .map((cat) => (
                        <div key={cat.categoriaId} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium capitalize">
                              {cat.nome.toLowerCase()}
                            </span>
                            <span className="text-slate-400">
                              {fmt(cat.total)} •{" "}
                              {fmtPct(cat.percentualDaReceita)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-yellow-400/70"
                              style={{
                                width: `${Math.min(100, cat.percentualDaReceita)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Alerta de prioridades */}
                <div
                  className={`mt-5 rounded-lg border p-3 text-xs ${
                    data.limites.prioridades.atingiuMinimo
                      ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
                      : "border-yellow-600/40 bg-yellow-950/30 text-yellow-200"
                  }`}
                >
                  <p className="font-semibold">
                    {data.limites.prioridades.atingiuMinimo
                      ? "✓ Você está pagando a si mesmo primeiro!"
                      : "⚠ Atenção: investimentos abaixo do mínimo recomendado"}
                  </p>
                  <p className="mt-1 text-[11px] opacity-80">
                    Prioridades (invest. + reservas + dívidas):{" "}
                    {fmtPct(data.limites.prioridades.usadoPercentual)} da receita.
                    Mínimo recomendado:{" "}
                    {fmtPct(data.limites.prioridades.minimoRecomendadoPercentual)}.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Estado vazio - sem dados E sem erro (mês sem transações) */}
        {data && data.totalReceitas === 0 && data.totalDespesas === 0 && !error && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-300 font-medium">Nenhum dado para {nomeMes}</p>
            <p className="text-sm text-slate-500 mt-1">
              Comece lançando receitas e despesas da família para ver o painel completo.
            </p>
            <a
              href="/transacoes"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
            >
              + Lançar primeira transação
            </a>
          </div>
        )}
      </div>
    </div>
  );
}