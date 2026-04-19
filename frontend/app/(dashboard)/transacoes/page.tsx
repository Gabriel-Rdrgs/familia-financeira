// app/(dashboard)/transacoes/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type TipoTransacao = "RECEITA" | "DESPESA" | "TRANSFERENCIA";
type FormaPagamento = "DINHEIRO" | "DEBITO" | "CREDITO" | "PIX" | "BOLETO" | "OUTRO";

type Subcategoria = { id: number; nome: string; categoriaId: number };
type Categoria = { id: number; nome: string; tipoFluxo: string; subcategorias: Subcategoria[] };
type Pessoa = { id: number; nome: string };

type Transacao = {
  id: number;
  data: string;
  tipo: TipoTransacao;
  valor: number;
  descricao?: string;
  formaPagamento: FormaPagamento;
  relacionadoAoNegocio: boolean;
  categoriaId: number;
  subcategoriaId?: number;
  pessoaResponsavelId?: number;
  categoria?: Categoria;
  subcategoria?: Subcategoria;
  pessoaResponsavel?: Pessoa;
};

type FormState = {
  tipo: TipoTransacao;
  valor: string;
  descricao: string;
  data: string;
  formaPagamento: FormaPagamento;
  categoriaId: string;
  subcategoriaId: string;
  pessoaResponsavelId: string;
  relacionadoAoNegocio: boolean;
};

// ─── Constantes ─────────────────────────────────────────────────────────────
const API = "http://localhost:3000";

const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "DINHEIRO", "DEBITO", "CREDITO", "PIX", "BOLETO", "OUTRO",
];

const FORMA_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

const TIPO_LABEL: Record<TipoTransacao, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
  TRANSFERENCIA: "Transferência",
};

const formDefault: FormState = {
  tipo: "DESPESA",
  valor: "",
  descricao: "",
  data: new Date().toISOString().slice(0, 10),
  formaPagamento: "PIX",
  categoriaId: "",
  subcategoriaId: "",
  pessoaResponsavelId: "",
  relacionadoAoNegocio: false,
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

// ─── Componente principal ───────────────────────────────────────────────────
export default function TransacoesPage() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | "">("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroPessoa, setFiltroPessoa] = useState<string>("");

  // Modal de criação/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [form, setForm] = useState<FormState>(formDefault);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Modal de exclusão
  const [deletando, setDeletando] = useState<Transacao | null>(null);
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("");
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  // ─── Carregamento de dados ─────────────────────────────────────────────
  const carregarTransacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/transacoes?ano=${ano}&mes=${mes}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setTransacoes(await res.json());
    } catch {
      setError("Não foi possível carregar as transações.");
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    carregarTransacoes();
  }, [carregarTransacoes]);

  useEffect(() => {
    async function carregarAuxiliares() {
      try {
        const resCat = await fetch(`${API}/categorias`);
        if (resCat.ok) setCategorias(await resCat.json());
      } catch {
        console.warn("Categorias indisponíveis");
      }

      try {
        const resPes = await fetch(`${API}/pessoas`);
        if (resPes.ok) setPessoas(await resPes.json());
      } catch {
        console.warn("Pessoas indisponíveis");
      }
    }
    carregarAuxiliares();
  }, []);

  // ─── Navegação de mês ──────────────────────────────────────────────────
  function mesAnterior() {
    if (mes === 1) { setMes(12); setAno(a => a - 1); }
    else setMes(m => m - 1);
  }

  function mesSeguinte() {
    if (mes === 12) { setMes(1); setAno(a => a + 1); }
    else setMes(m => m + 1);
  }

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // ─── Modal criar/editar ────────────────────────────────────────────────
  function abrirCriar() {
    setEditando(null);
    setForm(formDefault);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEditar(t: Transacao) {
    setEditando(t);
    setForm({
      tipo: t.tipo,
      valor: String(t.valor),
      descricao: t.descricao ?? "",
      data: t.data.slice(0, 10),
      formaPagamento: t.formaPagamento,
      categoriaId: String(t.categoriaId),
      subcategoriaId: t.subcategoriaId ? String(t.subcategoriaId) : "",
      pessoaResponsavelId: t.pessoaResponsavelId ? String(t.pessoaResponsavelId) : "",
      relacionadoAoNegocio: t.relacionadoAoNegocio,
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
    if (!form.valor || !form.categoriaId || !form.formaPagamento) {
      setErroForm("Preencha os campos obrigatórios: valor, categoria e forma de pagamento.");
      return;
    }

    const valorNum = parseFloat(form.valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      setErroForm("Valor deve ser um número positivo.");
      return;
    }

    setSalvando(true);
    setErroForm(null);

    const payload = {
      tipo: form.tipo,
      valor: valorNum,
      descricao: form.descricao || undefined,
      data: form.data,
      formaPagamento: form.formaPagamento,
      categoriaId: parseInt(form.categoriaId),
      subcategoriaId: form.subcategoriaId ? parseInt(form.subcategoriaId) : undefined,
      pessoaResponsavelId: form.pessoaResponsavelId ? parseInt(form.pessoaResponsavelId) : undefined,
      relacionadoAoNegocio: form.relacionadoAoNegocio,
    };

    try {
      const url = editando ? `${API}/transacoes/${editando.id}` : `${API}/transacoes`;
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
      await carregarTransacoes();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // ─── Exclusão ──────────────────────────────────────────────────────────
  function abrirDeletar(t: Transacao) {
    setDeletando(t);
    setConfirmacaoTexto("");
  }

  async function confirmarDelete() {
    if (!deletando) return;
    const esperado = deletando.descricao?.trim() || `#${deletando.id}`;
    if (confirmacaoTexto.trim() !== esperado) return;

    setDeletandoId(deletando.id);
    try {
      const res = await fetch(`${API}/transacoes/${deletando.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error();
      setDeletando(null);
      await carregarTransacoes();
    } catch {
      alert("Erro ao excluir transação.");
    } finally {
      setDeletandoId(null);
    }
  }

  // ─── Filtros e totais ──────────────────────────────────────────────────
  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroTipo && t.tipo !== filtroTipo) return false;
    if (filtroCategoria && String(t.categoriaId) !== filtroCategoria) return false;
    if (filtroPessoa && String(t.pessoaResponsavelId) !== filtroPessoa) return false;
    return true;
  });

  const totalReceitas = transacoes.filter(t => t.tipo === "RECEITA").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === "DESPESA").reduce((s, t) => s + t.valor, 0);

  // Subcategorias do formulário (filtra pela categoria selecionada)
  const subcatDoForm = categorias.find(c => String(c.id) === form.categoriaId)?.subcategorias ?? [];

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Transações</h1>
          <p className="text-sm text-slate-400">
            Gerencie receitas e despesas da família.
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
        >
          <Plus size={15} />
          Nova transação
        </button>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Navegação de mês + resumo */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

          <div className="flex gap-3 text-sm">
            <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
              <span className="text-slate-400">Receitas: </span>
              <span className="font-medium text-emerald-300">{fmt(totalReceitas)}</span>
            </span>
            <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
              <span className="text-slate-400">Despesas: </span>
              <span className="font-medium text-red-300">{fmt(totalDespesas)}</span>
            </span>
            <span className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
              <span className="text-slate-400">Saldo: </span>
              <span className={`font-semibold ${totalReceitas - totalDespesas >= 0 ? "text-slate-50" : "text-red-300"}`}>
                {fmt(totalReceitas - totalDespesas)}
              </span>
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500 mr-1">Filtrar:</span>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value as TipoTransacao | "")}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
          >
            <option value="">Todos os tipos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
            <option value="TRANSFERENCIA">Transferência</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(c => (
              <option key={c.id} value={String(c.id)}>{c.nome}</option>
            ))}
          </select>

          <select
            value={filtroPessoa}
            onChange={e => setFiltroPessoa(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
          >
            <option value="">Todas as pessoas</option>
            {pessoas.map(p => (
              <option key={p.id} value={String(p.id)}>{p.nome}</option>
            ))}
          </select>

          {(filtroTipo || filtroCategoria || filtroPessoa) && (
            <button
              onClick={() => { setFiltroTipo(""); setFiltroCategoria(""); setFiltroPessoa(""); }}
              className="ml-auto text-[11px] text-slate-400 hover:text-yellow-300 transition-colors"
            >
              Limpar filtros ×
            </button>
          )}
        </div>

        {/* Tabela */}
        {loading && (
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-900/80" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && transacoesFiltradas.length === 0 && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400 font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm text-slate-500 mt-1">
              {filtroTipo || filtroCategoria || filtroPessoa
                ? "Tente remover os filtros."
                : `Nenhum lançamento em ${nomeMes}. Clique em "Nova transação" para começar.`}
            </p>
          </div>
        )}

        {!loading && !error && transacoesFiltradas.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    <th className="px-4 py-3 text-left">Pessoa</th>
                    <th className="px-4 py-3 text-left">Forma</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Ações</th>
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
                        {t.descricao || <span className="text-slate-500 italic">sem descrição</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-300 capitalize">
                          {t.categoria?.nome.toLowerCase() ?? `cat. ${t.categoriaId}`}
                        </span>
                        {t.subcategoria && (
                          <span className="block text-[11px] text-slate-500">
                            {t.subcategoria.nome}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {t.pessoaResponsavel?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {FORMA_LABEL[t.formaPagamento]}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            t.tipo === "RECEITA"
                              ? "text-emerald-300"
                              : t.tipo === "DESPESA"
                              ? "text-red-300"
                              : "text-slate-300"
                          }`}
                        >
                          {t.tipo === "RECEITA" ? "+" : t.tipo === "DESPESA" ? "−" : ""}
                          {fmt(t.valor)}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {TIPO_LABEL[t.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirEditar(t)}
                            title="Editar"
                            className="rounded p-1.5 text-slate-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => abrirDeletar(t)}
                            title="Excluir"
                            className="rounded p-1.5 text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-slate-800 text-[11px] text-slate-500">
              {transacoesFiltradas.length} transaç{transacoesFiltradas.length === 1 ? "ão" : "ões"} exibida{transacoesFiltradas.length === 1 ? "" : "s"}
              {transacoesFiltradas.length !== transacoes.length && ` de ${transacoes.length} total`}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Criar/Editar ─────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-50">
                {editando ? "Editar transação" : "Nova transação"}
              </h2>
              <button
                onClick={fecharModal}
                className="rounded p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {erroForm && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  <AlertTriangle size={14} />
                  {erroForm}
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Tipo <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  {(["RECEITA", "DESPESA", "TRANSFERENCIA"] as TipoTransacao[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, tipo: t }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        form.tipo === t
                          ? t === "RECEITA"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                            : t === "DESPESA"
                            ? "border-red-500 bg-red-500/15 text-red-300"
                            : "border-slate-500 bg-slate-500/15 text-slate-300"
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {TIPO_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor + Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Valor (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Aluguel de abril"
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Categoria + Subcategoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Categoria <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value, subcategoriaId: "" }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="">Selecionar…</option>
                    {categorias.map(c => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Subcategoria
                  </label>
                  <select
                    value={form.subcategoriaId}
                    onChange={e => setForm(f => ({ ...f, subcategoriaId: e.target.value }))}
                    disabled={subcatDoForm.length === 0}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400 disabled:opacity-40"
                  >
                    <option value="">Nenhuma</option>
                    {subcatDoForm.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Forma de pagamento + Pessoa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Forma de pagamento <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.formaPagamento}
                    onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value as FormaPagamento }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  >
                    {FORMAS_PAGAMENTO.map(fp => (
                      <option key={fp} value={fp}>{FORMA_LABEL[fp]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Pessoa responsável
                  </label>
                  <select
                    value={form.pessoaResponsavelId}
                    onChange={e => setForm(f => ({ ...f, pessoaResponsavelId: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="">Família (geral)</option>
                    {pessoas.map(p => (
                      <option key={p.id} value={String(p.id)}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Relacionado ao negócio */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.relacionadoAoNegocio}
                  onChange={e => setForm(f => ({ ...f, relacionadoAoNegocio: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-yellow-400"
                />
                <span className="text-xs text-slate-300">
                  Relacionado à lanchonete
                </span>
              </label>
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
                {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Criar transação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Exclusão ───────────────────────────────────── */}
      {deletando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-red-700/50 bg-slate-900 shadow-2xl">
            <div className="flex items-start gap-3 border-b border-slate-800 px-5 py-4">
              <AlertTriangle size={20} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-slate-50">
                  Excluir transação
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Esta ação é permanente e não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <p>
                  <span className="text-slate-500">Descrição:</span>{" "}
                  {deletando.descricao || <span className="italic text-slate-500">sem descrição</span>}
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Valor:</span>{" "}
                  <span className={deletando.tipo === "RECEITA" ? "text-emerald-300" : "text-red-300"}>
                    {fmt(deletando.valor)}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Para confirmar, digite{" "}
                  <span className="font-mono font-semibold text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">
                    {deletando.descricao?.trim() || `#${deletando.id}`}
                  </span>{" "}
                  no campo abaixo:
                </p>
                <input
                  type="text"
                  value={confirmacaoTexto}
                  onChange={e => setConfirmacaoTexto(e.target.value)}
                  placeholder="Digite para confirmar..."
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
              <button
                onClick={() => setDeletando(null)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDelete}
                disabled={
                  confirmacaoTexto.trim() !== (deletando.descricao?.trim() || `#${deletando.id}`) ||
                  deletandoId !== null
                }
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deletandoId ? "Excluindo…" : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}