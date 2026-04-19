// app/(dashboard)/metas/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Archive,
  X,
  AlertTriangle,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type TipoMeta =
  | "SAUDE"
  | "DIVIDA"
  | "RESERVA"
  | "NEGOCIO"
  | "LAZER"
  | "OUTRO";

type Meta = {
  id: number;
  nome: string;
  tipo: TipoMeta;
  valorAlvo: number;
  valorAcumulado: number;
  progressoPercentual: number;
  dataInicio: string;
  dataMeta?: string | null;
  ativa: boolean;
};

type FormState = {
  nome: string;
  tipo: TipoMeta;
  valorAlvo: string;
  dataMeta: string;
};

// ─── Constantes ─────────────────────────────────────────────────────────────
const API = "http://localhost:3000";

const TIPO_LABEL: Record<TipoMeta, string> = {
  SAUDE: "Saúde",
  DIVIDA: "Dívida",
  RESERVA: "Reserva",
  NEGOCIO: "Negócio",
  LAZER: "Lazer",
  OUTRO: "Outro",
};

const TIPO_COLOR: Record<TipoMeta, string> = {
  SAUDE: "bg-emerald-500/15 text-emerald-300 border-emerald-700/40",
  DIVIDA: "bg-red-500/15 text-red-300 border-red-700/40",
  RESERVA: "bg-yellow-500/15 text-yellow-300 border-yellow-700/40",
  NEGOCIO: "bg-orange-500/15 text-orange-300 border-orange-700/40",
  LAZER: "bg-purple-500/15 text-purple-300 border-purple-700/40",
  OUTRO: "bg-slate-500/15 text-slate-300 border-slate-700/40",
};

const TIPO_BAR: Record<TipoMeta, string> = {
  SAUDE: "bg-emerald-400",
  DIVIDA: "bg-red-400",
  RESERVA: "bg-yellow-400",
  NEGOCIO: "bg-orange-400",
  LAZER: "bg-purple-400",
  OUTRO: "bg-slate-400",
};

const formDefault: FormState = {
  nome: "",
  tipo: "RESERVA",
  valorAlvo: "",
  dataMeta: "",
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

function diasRestantes(dataMeta?: string | null): number | null {
  if (!dataMeta) return null;
  const diff = new Date(dataMeta).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Componentes internos ────────────────────────────────────────────────────
function ProgressBar({
  percent,
  cor,
}: {
  percent: number;
  cor: string;
}) {
  const safe = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all duration-500 ${cor}`}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

function MetaCard({
  meta,
  onEditar,
  onArquivar,
}: {
  meta: Meta;
  onEditar: (m: Meta) => void;
  onArquivar: (m: Meta) => void;
}) {
  const dias = diasRestantes(meta.dataMeta);
  const concluida = meta.progressoPercentual >= 100;
  const arquivada = !meta.ativa;

  return (
    <div
      className={`rounded-xl border bg-slate-900/80 p-5 flex flex-col gap-4 transition-opacity ${
        arquivada ? "opacity-50 border-slate-800/50" : "border-slate-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-50">{meta.nome}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TIPO_COLOR[meta.tipo]}`}
            >
              {TIPO_LABEL[meta.tipo]}
            </span>
            {concluida && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-700/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                <CheckCircle2 size={10} />
                Concluída
              </span>
            )}
            {arquivada && !concluida && (
              <span className="rounded-full border border-slate-700/40 bg-slate-500/15 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Arquivada
              </span>
            )}
          </div>

          {/* Prazo */}
          {meta.dataMeta && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock size={11} />
              <span>
                Prazo: {fmtDate(meta.dataMeta)}
                {dias !== null && !concluida && (
                  <span
                    className={`ml-1.5 font-medium ${
                      dias < 0
                        ? "text-red-400"
                        : dias <= 30
                        ? "text-yellow-300"
                        : "text-slate-400"
                    }`}
                  >
                    {dias < 0
                      ? `(${Math.abs(dias)} dias atrasada)`
                      : dias === 0
                      ? "(vence hoje!)"
                      : `(${dias} dias restantes)`}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Ações */}
        {!arquivada && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditar(meta)}
              title="Editar meta"
              className="rounded p-1.5 text-slate-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onArquivar(meta)}
              title="Arquivar meta"
              className="rounded p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <Archive size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Valores */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            {fmt(meta.valorAcumulado)} acumulados
          </span>
          <span className="font-semibold text-slate-200">
            {fmt(meta.valorAlvo)} alvo
          </span>
        </div>
        <ProgressBar
          percent={meta.progressoPercentual}
          cor={concluida ? "bg-emerald-400" : TIPO_BAR[meta.tipo]}
        />
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>
            Faltam:{" "}
            <span className="font-medium text-slate-300">
              {fmt(Math.max(0, meta.valorAlvo - meta.valorAcumulado))}
            </span>
          </span>
          <span className="font-semibold text-slate-300">
            {Math.min(100, meta.progressoPercentual).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

  // Modal criar/editar
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Meta | null>(null);
  const [form, setForm] = useState<FormState>(formDefault);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Modal arquivar
  const [arquivando, setArquivando] = useState<Meta | null>(null);
  const [arquivandoId, setArquivandoId] = useState<number | null>(null);

  // ─── Carregamento ─────────────────────────────────────────────────────
  const carregarMetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/metas`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setMetas(await res.json());
    } catch {
      setError("Não foi possível carregar as metas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMetas();
  }, [carregarMetas]);

  // ─── Separação ativa/arquivada ─────────────────────────────────────────
  const metasAtivas = metas.filter((m) => m.ativa);
  const metasArquivadas = metas.filter((m) => !m.ativa);
  const totalAlvo = metasAtivas.reduce((s, m) => s + m.valorAlvo, 0);
  const totalAcumulado = metasAtivas.reduce((s, m) => s + m.valorAcumulado, 0);
  const progressoGeral =
    totalAlvo > 0 ? (totalAcumulado / totalAlvo) * 100 : 0;

  // ─── Modal criar/editar ────────────────────────────────────────────────
  function abrirCriar() {
    setEditando(null);
    setForm(formDefault);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEditar(meta: Meta) {
    setEditando(meta);
    setForm({
      nome: meta.nome,
      tipo: meta.tipo,
      valorAlvo: String(meta.valorAlvo),
      dataMeta: meta.dataMeta ? meta.dataMeta.slice(0, 10) : "",
    });
    setErroForm(null);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
    setErroForm(null);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErroForm("O nome da meta é obrigatório.");
      return;
    }
    const valorNum = parseFloat(form.valorAlvo.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      setErroForm("Valor alvo deve ser um número positivo.");
      return;
    }

    setSalvando(true);
    setErroForm(null);

    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      valorAlvo: valorNum,
      ...(form.dataMeta ? { dataMeta: form.dataMeta } : {}),
    };

    try {
      const url = editando ? `${API}/metas/${editando.id}` : `${API}/metas`;
      const method = editando ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${res.status}`);
      }

      fecharModal();
      await carregarMetas();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // ─── Arquivar ─────────────────────────────────────────────────────────
  async function confirmarArquivar() {
    if (!arquivando) return;
    setArquivandoId(arquivando.id);
    try {
      const res = await fetch(`${API}/metas/${arquivando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativa: false }),
      });
      if (!res.ok) throw new Error();
      setArquivando(null);
      await carregarMetas();
    } catch {
      alert("Erro ao arquivar meta.");
    } finally {
      setArquivandoId(null);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Metas</h1>
          <p className="text-sm text-slate-400">
            Acompanhe e gerencie os objetivos financeiros da família.
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
        >
          <Plus size={15} />
          Nova meta
        </button>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Banner de erro */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Card de progresso geral */}
        {!loading && metasAtivas.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-yellow-400" />
                <p className="text-sm font-semibold text-slate-50">
                  Progresso geral das metas ativas
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {metasAtivas.filter((m) => m.progressoPercentual >= 100).length} de{" "}
                {metasAtivas.length} concluídas
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{fmt(totalAcumulado)} acumulados</span>
                <span>{fmt(totalAlvo)} alvo total</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, progressoGeral)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                {progressoGeral.toFixed(1)}% do objetivo total atingido
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-slate-800 bg-slate-900/80"
              />
            ))}
          </div>
        )}

        {/* Metas ativas */}
        {!loading && metasAtivas.length === 0 && !error && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
            <Target size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">Nenhuma meta ativa</p>
            <p className="text-sm text-slate-500 mt-1">
              Crie a primeira meta da família — reserva de emergência, quitar dívidas, investimentos...
            </p>
            <button
              onClick={abrirCriar}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
            >
              <Plus size={14} />
              Criar primeira meta
            </button>
          </div>
        )}

        {!loading && metasAtivas.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metasAtivas.map((meta) => (
              <MetaCard
                key={meta.id}
                meta={meta}
                onEditar={abrirEditar}
                onArquivar={setArquivando}
              />
            ))}
          </div>
        )}

        {/* Metas arquivadas */}
        {!loading && metasArquivadas.length > 0 && (
          <div>
            <button
              onClick={() => setMostrarArquivadas((v) => !v)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
            >
              <Archive size={13} />
              {mostrarArquivadas ? "Ocultar" : "Mostrar"} metas arquivadas (
              {metasArquivadas.length})
            </button>

            {mostrarArquivadas && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {metasArquivadas.map((meta) => (
                  <MetaCard
                    key={meta.id}
                    meta={meta}
                    onEditar={abrirEditar}
                    onArquivar={setArquivando}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Criar/Editar ─────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-50">
                {editando ? "Editar meta" : "Nova meta"}
              </h2>
              <button
                onClick={fecharModal}
                className="rounded p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {erroForm && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  <AlertTriangle size={14} />
                  {erroForm}
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nome da meta <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Reserva de emergência"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                  autoFocus
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TIPO_LABEL) as TipoMeta[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                        form.tipo === t
                          ? TIPO_COLOR[t]
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {TIPO_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor alvo + Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Valor alvo (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={form.valorAlvo}
                    onChange={(e) => setForm((f) => ({ ...f, valorAlvo: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Prazo (opcional)
                  </label>
                  <input
                    type="date"
                    value={form.dataMeta}
                    onChange={(e) => setForm((f) => ({ ...f, dataMeta: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Dica contextual */}
              {form.tipo === "RESERVA" && (
                <div className="rounded-lg border border-yellow-700/30 bg-yellow-950/30 px-3 py-2 text-[11px] text-yellow-200/80">
                  💡 Para a reserva de emergência, a meta recomendada é de{" "}
                  <strong>6 meses de despesas essenciais</strong> da família.
                </div>
              )}
              {form.tipo === "DIVIDA" && (
                <div className="rounded-lg border border-red-700/30 bg-red-950/30 px-3 py-2 text-[11px] text-red-200/80">
                  💡 Quitando esta dívida, você libera renda para investir. Priorize dívidas mais caras primeiro.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
              <button
                onClick={fecharModal}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-yellow-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Criar meta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Arquivamento ───────────────────────────────── */}
      {arquivando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-start gap-3 border-b border-slate-800 px-5 py-4">
              <Archive size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Arquivar meta
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  A meta será desativada mas ficará visível no histórico. Você pode reativá-la editando-a depois.
                </p>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <p>
                  <span className="text-slate-500">Meta:</span>{" "}
                  <span className="font-medium">{arquivando.nome}</span>
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Progresso:</span>{" "}
                  {arquivando.progressoPercentual.toFixed(1)}% ({fmt(arquivando.valorAcumulado)}{" "}
                  de {fmt(arquivando.valorAlvo)})
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
              <button
                onClick={() => setArquivando(null)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarArquivar}
                disabled={arquivandoId !== null}
                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {arquivandoId ? "Arquivando…" : "Arquivar meta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}