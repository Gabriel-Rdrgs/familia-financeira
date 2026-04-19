"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Plus,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type PilarItem = { total: number; percentualDaReceita: number };

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

type Meta = {
  id: number;
  nome: string;
  tipo: string;
  valorAlvo: number;
  valorAcumulado: number;
  progressoPercentual: number;
  ativa: boolean;
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const API_URL = "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function clamp(v: number) {
  return Math.min(100, Math.max(0, v));
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────
function ProgressBar({
  percent,
  color = "bg-yellow-400",
  limit,
}: {
  percent: number;
  color?: string;
  limit?: number;
}) {
  const safePercent = clamp(percent);
  const excedido = limit != null && percent > limit;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          excedido ? "bg-red-400" : color
        }`}
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

function StatusBadge({
  ok,
  labelOk,
  labelNok,
}: {
  ok: boolean;
  labelOk: string;
  labelNok: string;
}) {
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

function KpiCard({
  label,
  valor,
  sub,
  icon: Icon,
  cor,
}: {
  label: string;
  valor: string;
  sub?: React.ReactNode;
  icon: React.ElementType;
  cor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.16em]">
          {label}
        </p>
        <div className={`rounded-lg p-2 ${cor}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-50">{valor}</p>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

// ─── Página principal (Client Component) ─────────────────────────────────────
export default function DashboardPage() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const [data, setData] = useState<DashboardMensalResponse | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Carregamento ───────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resDash, resMetas] = await Promise.all([
        fetch(`${API_URL}/dashboard/mensal?ano=${ano}&mes=${mes}`),
        fetch(`${API_URL}/metas`),
      ]);

      if (!resDash.ok) throw new Error(`Erro ${resDash.status}`);
      setData(await resDash.json());

      if (resMetas.ok) {
        const todasMetas: Meta[] = await resMetas.json();
        setMetas(todasMetas.filter((m) => m.ativa));
      }
    } catch {
      setError(
        "Não foi possível conectar à API. Verifique se o backend está rodando em localhost:3000."
      );
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // ─── Navegação de mês ───────────────────────────────────────────────────
  function mesAnterior() {
    if (mes === 1) { setMes(12); setAno((a) => a - 1); }
    else setMes((m) => m - 1);
  }

  function mesSeguinte() {
    if (mes === 12) { setMes(1); setAno((a) => a + 1); }
    else setMes((m) => m + 1);
  }

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // ─── Alertas automáticos ────────────────────────────────────────────────
  const alertas: string[] = [];
  if (data) {
    if (!data.limites.essenciaisMaisSaude.dentroDoLimite)
      alertas.push(
        `Essenciais + Saúde em ${fmtPct(data.limites.essenciaisMaisSaude.usadoPercentual)} da receita — limite é 50%.`
      );
    if (!data.limites.lazer.dentroDoLimite)
      alertas.push(
        `Lazer em ${fmtPct(data.limites.lazer.usadoPercentual)} da receita — limite é 15%.`
      );
    if (!data.limites.prioridades.atingiuMinimo && data.totalReceitas > 0)
      alertas.push(
        `Apenas ${fmtPct(data.limites.prioridades.usadoPercentual)} em dívidas/investimentos — recomendado ≥ 20%.`
      );
    if (data.saldo < 0)
      alertas.push("Saldo negativo: as despesas superaram as receitas este mês.");
  }

  const metasDestaque = [...metas]
    .sort((a, b) => b.progressoPercentual - a.progressoPercentual)
    .slice(0, 3);

  const maxPercentual = Math.max(
    ...(data?.porCategoria.map((c) => c.percentualDaReceita) ?? [1]),
    1
  );

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-semibold text-slate-50">Painel</h1>
            <span className="inline-flex items-center rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
              beta
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Acompanhe as finanças da família em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navegação de mês */}
          <button
            onClick={mesAnterior}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="rounded-full border border-slate-700 px-4 py-1 text-xs text-slate-300 capitalize min-w-36 text-center">
            {nomeMes}
          </span>
          <button
            onClick={mesSeguinte}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          {/* Ação rápida */}
          <a
            href="/transacoes"
            className="inline-flex items-center gap-1.5 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors ml-2"
          >
            <Plus size={14} />
            Lançamento
          </a>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Erro */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            <p className="font-medium">Erro ao carregar o painel</p>
            <p className="text-xs text-red-200/80 mt-1">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/80"
                />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900/80"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Alertas */}
            {alertas.length > 0 && (
              <div className="rounded-xl border border-yellow-700/40 bg-yellow-950/30 px-4 py-3 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-yellow-300 mb-2">
                  <AlertTriangle size={14} />
                  {alertas.length === 1
                    ? "1 alerta financeiro"
                    : `${alertas.length} alertas financeiros`}{" "}
                  em {nomeMes}
                </p>
                {alertas.map((a, i) => (
                  <p key={i} className="text-xs text-yellow-200/80 pl-5">
                    • {a}
                  </p>
                ))}
              </div>
            )}

            {alertas.length === 0 && data.totalReceitas > 0 && (
              <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-200">
                  Todos os limites financeiros respeitados em {nomeMes}. Continue assim!
                </p>
              </div>
            )}

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Receitas"
                valor={fmt(data.totalReceitas)}
                icon={TrendingUp}
                cor="bg-emerald-500/15 text-emerald-300"
                sub={nomeMes}
              />
              <KpiCard
                label="Despesas"
                valor={fmt(data.totalDespesas)}
                icon={TrendingDown}
                cor="bg-red-500/15 text-red-300"
                sub={
                  data.totalReceitas > 0
                    ? `${fmtPct((data.totalDespesas / data.totalReceitas) * 100)} da receita`
                    : undefined
                }
              />
              <KpiCard
                label="Saldo consolidado"
                valor={fmt(data.saldo)}
                icon={Wallet}
                cor={
                  data.saldo >= 0
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-red-500/15 text-red-300"
                }
                sub={
                  <span
                    className={data.saldo >= 0 ? "text-emerald-400" : "text-red-400"}
                  >
                    {data.saldo >= 0 ? "Superávit" : "Déficit"} em {nomeMes}
                  </span>
                }
              />
            </div>

            {/* Grid: Pilares + Categorias */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pilares */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                    Pilares de gasto
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    % da receita mensal ({fmt(data.totalReceitas)})
                  </p>
                </div>

                {(
                  [
                    { key: "essenciais", label: "Essenciais", cor: "bg-slate-300", limite: 35 },
                    { key: "saude",      label: "Saúde",      cor: "bg-emerald-400", limite: 15 },
                    { key: "lazer",      label: "Lazer",      cor: "bg-purple-400",  limite: 15 },
                    { key: "dividas",    label: "Dívidas",    cor: "bg-red-400",     limite: undefined },
                    { key: "investimentos", label: "Investimentos", cor: "bg-yellow-400", limite: undefined },
                    { key: "negocio",    label: "Negócio",    cor: "bg-orange-400",  limite: undefined },
                  ] as const
                ).map(({ key, label, cor, limite }) => {
                  const pilar = data.pilares[key];
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <span className="text-slate-400">
                          {fmt(pilar.total)} • {fmtPct(pilar.percentualDaReceita)}
                        </span>
                      </div>
                      <ProgressBar
                        percent={pilar.percentualDaReceita}
                        color={cor}
                        limit={limite}
                      />
                      {limite && (
                        <p className="text-[11px] text-slate-500">
                          Limite recomendado: {limite}%
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Limite combinado essenciais + saúde */}
                <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-300">
                      Essenciais + Saúde
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
                    {fmtPct(data.limites.essenciaisMaisSaude.usadoPercentual)} de 50%
                    permitidos
                  </p>
                </div>
              </div>

              {/* Categorias + alertas de prioridade */}
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm flex-1">
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                      Despesas por categoria
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranking do mês
                    </p>
                  </div>

                  {data.porCategoria.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">
                      Nenhuma despesa lançada em {nomeMes}.
                      <br />
                      <a
                        href="/transacoes"
                        className="text-yellow-400 hover:underline text-xs mt-1 inline-block"
                      >
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
                                className="h-full rounded-full bg-yellow-400/70 transition-all duration-500"
                                style={{
                                  width: `${clamp(
                                    (cat.percentualDaReceita / maxPercentual) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Alerta de prioridades */}
                <div
                  className={`rounded-xl border p-4 text-xs ${
                    data.limites.prioridades.atingiuMinimo
                      ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
                      : "border-yellow-600/40 bg-yellow-950/30 text-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {data.limites.prioridades.atingiuMinimo ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {data.limites.prioridades.atingiuMinimo
                          ? "Você está pagando a si mesmo primeiro!"
                          : "Investimentos abaixo do mínimo recomendado"}
                      </p>
                      <p className="mt-1 opacity-80 text-[11px]">
                        Prioridades (invest. + reservas + dívidas):{" "}
                        {fmtPct(data.limites.prioridades.usadoPercentual)} da receita.
                        Mínimo: {fmtPct(data.limites.prioridades.minimoRecomendadoPercentual)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metas ativas */}
            {metasDestaque.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em] flex items-center gap-1.5">
                    <Target size={13} />
                    Metas ativas
                  </p>
                  <a
                    href="/metas"
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Ver todas →
                  </a>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {metasDestaque.map((meta) => (
                    <div key={meta.id} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[65%]">
                          {meta.nome}
                        </span>
                        <span className="text-slate-400">
                          {meta.progressoPercentual.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            meta.progressoPercentual >= 100
                              ? "bg-emerald-400"
                              : meta.progressoPercentual >= 50
                              ? "bg-yellow-400"
                              : "bg-slate-500"
                          }`}
                          style={{ width: `${clamp(meta.progressoPercentual)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>{fmt(meta.valorAcumulado)}</span>
                        <span>{fmt(meta.valorAlvo)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {data.totalReceitas === 0 && data.totalDespesas === 0 && (
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-300 font-medium">
                  Nenhum dado para {nomeMes}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Comece lançando receitas e despesas da família para ver o painel completo.
                </p>
                <a
                  href="/transacoes"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
                >
                  <Plus size={14} />
                  Lançar primeira transação
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}