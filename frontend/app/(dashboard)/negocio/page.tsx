// app/(dashboard)/negocio/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Store,
  ReceiptText,
  Percent,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type TipoTransacao = "RECEITA" | "DESPESA" | "TRANSFERENCIA";
type FormaPagamento = "DINHEIRO" | "DEBITO" | "CREDITO" | "PIX" | "BOLETO" | "OUTRO";

type Categoria = { id: number; nome: string };
type Subcategoria = { id: number; nome: string };

type Transacao = {
  id: number;
  data: string;
  tipo: TipoTransacao;
  valor: number;
  descricao?: string;
  formaPagamento: FormaPagamento;
  categoria?: Categoria;
  subcategoria?: Subcategoria;
};

type ResumoMensal = {
  negocioId: number;
  ano: number;
  mes: number;
  receitas: number;
  despesas: number;
  lucro: number;
  margemPercentual: number;
  quantidadeTransacoes: number;
  transacoes: Transacao[];
};

type Negocio = {
  id: number;
  nome: string;
  tipo: string;
  ativo: boolean;
  descricao?: string | null;
  dataInicioPrevista?: string | null;
  dataInicioReal?: string | null;
};

// ─── Constantes ─────────────────────────────────────────────────────────────
const API = "http://localhost:3000";

const FORMA_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Card de KPI ────────────────────────────────────────────────────────────
function KpiCard({
  label,
  valor,
  icon: Icon,
  cor,
  sub,
}: {
  label: string;
  valor: string;
  icon: React.ElementType;
  cor: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <div className={`rounded-lg p-2 ${cor}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-50">{valor}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function NegocioPage() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [negocioSelecionado, setNegocioSelecionado] = useState<Negocio | null>(null);
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);

  const [loadingNegocios, setLoadingNegocios] = useState(true);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro da tabela de transações
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | "">("");

  // ─── Carrega negócios ──────────────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      setLoadingNegocios(true);
      try {
        const res = await fetch(`${API}/negocios`);
        if (!res.ok) throw new Error();
        const data: Negocio[] = await res.json();
        setNegocios(data);
        const ativo = data.find((n) => n.ativo) ?? data[0] ?? null;
        setNegocioSelecionado(ativo);
      } catch {
        setError("Não foi possível carregar os negócios.");
      } finally {
        setLoadingNegocios(false);
      }
    }
    carregar();
  }, []);

  // ─── Carrega resumo mensal ─────────────────────────────────────────────
  const carregarResumo = useCallback(async () => {
    if (!negocioSelecionado) return;
    setLoadingResumo(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/negocios/${negocioSelecionado.id}/mensal?ano=${ano}&mes=${mes}`,
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setResumo(await res.json());
    } catch {
      setError("Não foi possível carregar o resumo do mês.");
    } finally {
      setLoadingResumo(false);
    }
  }, [negocioSelecionado, ano, mes]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  // ─── Navegação de mês ──────────────────────────────────────────────────
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

  // ─── Transações filtradas ──────────────────────────────────────────────
  const transacoesFiltradas = (resumo?.transacoes ?? []).filter((t) => {
    if (filtroTipo && t.tipo !== filtroTipo) return false;
    return true;
  });

  // ─── Render ────────────────────────────────────────────────────────────
  if (loadingNegocios) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-yellow-400" />
      </div>
    );
  }

  if (negocios.length === 0 && !loadingNegocios) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <Store size={36} className="text-slate-600" />
        <p className="text-slate-400 font-medium">Nenhum negócio cadastrado</p>
        <p className="text-sm text-slate-500 max-w-sm">
          Cadastre um negócio via API para começar a acompanhar o desempenho financeiro da lanchonete.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Negócio</h1>
            <p className="text-sm text-slate-400">
              Desempenho financeiro da lanchonete.
            </p>
          </div>

          {/* Seletor de negócio (caso haja mais de um) */}
          {negocios.length > 1 && (
            <select
              value={negocioSelecionado?.id ?? ""}
              onChange={(e) => {
                const n = negocios.find((n) => n.id === Number(e.target.value));
                if (n) setNegocioSelecionado(n);
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-400"
            >
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Info do negócio */}
        {negocioSelecionado && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-slate-50">
                {negocioSelecionado.nome}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                  negocioSelecionado.ativo
                    ? "border-emerald-700/40 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-700/40 bg-slate-500/15 text-slate-400"
                }`}
              >
                {negocioSelecionado.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            {negocioSelecionado.descricao && (
              <p className="text-xs text-slate-400">{negocioSelecionado.descricao}</p>
            )}
            {negocioSelecionado.dataInicioReal && (
              <p className="text-xs text-slate-500">
                Em operação desde{" "}
                <span className="text-slate-300">{fmtDate(negocioSelecionado.dataInicioReal)}</span>
              </p>
            )}
            {!negocioSelecionado.dataInicioReal && negocioSelecionado.dataInicioPrevista && (
              <p className="text-xs text-slate-500">
                Início previsto:{" "}
                <span className="text-yellow-300">{fmtDate(negocioSelecionado.dataInicioPrevista)}</span>
              </p>
            )}
          </div>
        )}

        {/* Navegação de mês */}
        <div className="flex items-center gap-2">
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
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* KPIs */}
        {loadingResumo ? (
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/80"
              />
            ))}
          </div>
        ) : resumo ? (
          <>
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Receita"
                valor={fmt(resumo.receitas)}
                icon={TrendingUp}
                cor="bg-emerald-500/15 text-emerald-300"
                sub={`${resumo.quantidadeTransacoes} transaç${resumo.quantidadeTransacoes === 1 ? "ão" : "ões"} no mês`}
              />
              <KpiCard
                label="Despesa"
                valor={fmt(resumo.despesas)}
                icon={TrendingDown}
                cor="bg-red-500/15 text-red-300"
                sub="Custos operacionais"
              />
              <KpiCard
                label="Lucro líquido"
                valor={fmt(resumo.lucro)}
                icon={DollarSign}
                cor={
                  resumo.lucro >= 0
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-red-500/15 text-red-300"
                }
                sub={resumo.lucro >= 0 ? "Resultado positivo ✓" : "Resultado negativo ✗"}
              />
              <KpiCard
                label="Margem"
                valor={`${resumo.margemPercentual.toFixed(1)}%`}
                icon={Percent}
                cor={
                  resumo.margemPercentual >= 20
                    ? "bg-emerald-500/15 text-emerald-300"
                    : resumo.margemPercentual >= 0
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-red-500/15 text-red-300"
                }
                sub={
                  resumo.margemPercentual >= 20
                    ? "Margem saudável (≥ 20%)"
                    : resumo.margemPercentual >= 0
                    ? "Margem apertada (< 20%)"
                    : "Operando no prejuízo"
                }
              />
            </div>

            {/* Barra visual receita vs despesa */}
            {resumo.receitas > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-4 space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Receita vs Despesa
                </p>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800 gap-0.5">
                  <div
                    className="h-full bg-emerald-400 rounded-l-full transition-all duration-500"
                    style={{
                      width: `${(resumo.receitas / (resumo.receitas + resumo.despesas)) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-red-400 rounded-r-full transition-all duration-500"
                    style={{
                      width: `${(resumo.despesas / (resumo.receitas + resumo.despesas)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                    Receitas ({((resumo.receitas / (resumo.receitas + resumo.despesas)) * 100).toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
                    Despesas ({((resumo.despesas / (resumo.receitas + resumo.despesas)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Tabela de transações */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                  <ReceiptText size={15} className="text-slate-400" />
                  Transações do negócio
                </p>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as TipoTransacao | "")}
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="">Todos os tipos</option>
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>

              {transacoesFiltradas.length === 0 ? (
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    Nenhuma transação do negócio em {nomeMes}.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Crie transações na tela de Transações vinculando ao negócio.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                          <th className="px-4 py-3 text-left">Data</th>
                          <th className="px-4 py-3 text-left">Descrição</th>
                          <th className="px-4 py-3 text-left">Categoria</th>
                          <th className="px-4 py-3 text-left">Forma</th>
                          <th className="px-4 py-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoesFiltradas.map((t, i) => (
                          <tr
                            key={t.id}
                            className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${
                              i % 2 === 0 ? "" : "bg-slate-950/30"
                            }`}
                          >
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                              {fmtDate(t.data)}
                            </td>
                            <td className="px-4 py-3 text-slate-200 max-w-xs truncate">
                              {t.descricao || (
                                <span className="italic text-slate-500">sem descrição</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-300 capitalize">
                                {t.categoria?.nome.toLowerCase() ?? "—"}
                              </span>
                              {t.subcategoria && (
                                <span className="block text-[11px] text-slate-500">
                                  {t.subcategoria.nome}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {FORMA_LABEL[t.formaPagamento]}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <span
                                className={`font-semibold ${
                                  t.tipo === "RECEITA"
                                    ? "text-emerald-300"
                                    : "text-red-300"
                                }`}
                              >
                                {t.tipo === "RECEITA" ? "+" : "−"}
                                {fmt(t.valor)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 border-t border-slate-800 text-[11px] text-slate-500">
                    {transacoesFiltradas.length} transaç{transacoesFiltradas.length === 1 ? "ão" : "ões"} exibida{transacoesFiltradas.length === 1 ? "" : "s"}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}