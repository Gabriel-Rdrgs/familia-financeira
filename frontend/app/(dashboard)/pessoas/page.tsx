"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, X, AlertTriangle, Users, UserCheck,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Papel = "ADMIN" | "MEMBRO" | "VISUALIZADOR";

type Pessoa = {
  id: number;
  nome: string;
  email?: string | null;
  papel?: string | null;
  cor?: string | null;
  ativo?: boolean;
};

type FormState = {
  nome: string;
  email: string;
  papel: Papel;
  cor: string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const API = "http://localhost:3000";

const PAPEL_LABEL: Record<Papel, string> = {
  ADMIN: "Administrador",
  MEMBRO: "Membro",
  VISUALIZADOR: "Visualizador",
};

const PAPEL_COR: Record<Papel, string> = {
  ADMIN:        "bg-yellow-500/15 text-yellow-300 border-yellow-700/40",
  MEMBRO:       "bg-blue-500/15 text-blue-300 border-blue-700/40",
  VISUALIZADOR: "bg-slate-500/15 text-slate-300 border-slate-700/40",
};

const PAPEL_DESC: Record<Papel, string> = {
  ADMIN:        "Acesso total — criar categorias, ver tudo, gerenciar usuários",
  MEMBRO:       "Registra transações e visualiza o painel",
  VISUALIZADOR: "Apenas visualiza — sem poder registrar",
};

const CORES_OPCOES = [
  "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ef4444", "#f97316", "#ec4899", "#06b6d4",
];

const formDefault: FormState = {
  nome: "",
  email: "",
  papel: "MEMBRO",
  cor: CORES_OPCOES[0],
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function initials(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Pessoa | null>(null);
  const [form, setForm] = useState<FormState>(formDefault);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [excluindo, setExcluindo] = useState<Pessoa | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  // ─── Carregamento ───────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/pessoas`);
      if (!res.ok) throw new Error();
      setPessoas(await res.json());
    } catch {
      setError("Não foi possível carregar as pessoas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ─── Modal ──────────────────────────────────────────────────────────────
  function abrirCriar() {
    setEditando(null);
    setForm(formDefault);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEditar(p: Pessoa) {
    setEditando(p);
    setForm({
      nome: p.nome,
      email: p.email ?? "",
      papel: (p.papel as Papel) ?? "MEMBRO",
      cor: p.cor ?? CORES_OPCOES[0],
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
      setErroForm("O nome é obrigatório.");
      return;
    }
    setSalvando(true);
    setErroForm(null);
    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim() || undefined,
      papel: form.papel,
      cor: form.cor,
    };
    try {
      const url = editando ? `${API}/pessoas/${editando.id}` : `${API}/pessoas`;
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
      await carregar();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // ─── Exclusão ───────────────────────────────────────────────────────────
  async function confirmarExcluir() {
    if (!excluindo) return;
    setExcluindoId(excluindo.id);
    try {
      await fetch(`${API}/pessoas/${excluindo.id}`, { method: "DELETE" });
      setExcluindo(null);
      await carregar();
    } catch {
      alert("Erro ao excluir.");
    } finally {
      setExcluindoId(null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  const admins  = pessoas.filter((p) => p.papel === "ADMIN");
  const membros = pessoas.filter((p) => p.papel !== "ADMIN");

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Pessoas</h1>
          <p className="text-sm text-slate-400">
            Gerencie os membros da família e seus níveis de acesso.
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
        >
          <Plus size={15} />
          Adicionar pessoa
        </button>
      </div>

      <div className="px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Banner explicativo de roles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <UserCheck size={13} />
            Níveis de acesso
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {(["ADMIN", "MEMBRO", "VISUALIZADOR"] as Papel[]).map((p) => (
              <div key={p} className={`rounded-lg border px-3 py-2 ${PAPEL_COR[p]}`}>
                <p className="text-xs font-semibold">{PAPEL_LABEL[p]}</p>
                <p className="text-[11px] opacity-70 mt-0.5">{PAPEL_DESC[p]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/80" />
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && pessoas.length === 0 && !error && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
            <Users size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">Nenhum membro cadastrado</p>
            <p className="text-sm text-slate-500 mt-1">
              Adicione cada membro da família para controlar quem registra o quê.
            </p>
            <button
              onClick={abrirCriar}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow-400 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
            >
              <Plus size={14} />
              Adicionar primeiro membro
            </button>
          </div>
        )}

        {/* Lista de pessoas */}
        {!loading && pessoas.length > 0 && (
          <div className="space-y-6">
            {/* Admins */}
            {admins.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Administradores ({admins.length})
                </p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {admins.map((p) => (
                    <PessoaCard
                      key={p.id}
                      pessoa={p}
                      onEditar={abrirEditar}
                      onExcluir={setExcluindo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Membros e visualizadores */}
            {membros.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Membros da família ({membros.length})
                </p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {membros.map((p) => (
                    <PessoaCard
                      key={p.id}
                      pessoa={p}
                      onEditar={abrirEditar}
                      onExcluir={setExcluindo}
                    />
                  ))}
                </div>
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
                {editando ? "Editar membro" : "Novo membro"}
              </h2>
              <button onClick={fecharModal} className="rounded p-1 text-slate-400 hover:text-slate-200">
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

              {/* Avatar preview */}
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-slate-900 text-sm font-bold shrink-0"
                  style={{ backgroundColor: form.cor }}
                >
                  {initials(form.nome || "?")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {CORES_OPCOES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, cor: c }))}
                      className={`h-6 w-6 rounded-full transition-transform ${form.cor === c ? "ring-2 ring-white scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Maria"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  E-mail <span className="text-slate-600">(opcional)</span>
                </label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Papel */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nível de acesso
                </label>
                <div className="space-y-2">
                  {(["ADMIN", "MEMBRO", "VISUALIZADOR"] as Papel[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, papel: p }))}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        form.papel === p
                          ? PAPEL_COR[p]
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <p className="text-xs font-semibold">{PAPEL_LABEL[p]}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">{PAPEL_DESC[p]}</p>
                    </button>
                  ))}
                </div>
              </div>
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
                className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-yellow-300 transition-colors disabled:opacity-60"
              >
                {salvando ? "Salvando…" : editando ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Exclusão ───────────────────────────────────── */}
      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-50">Remover membro</h2>
            <p className="text-xs text-slate-400">
              Tem certeza que deseja remover{" "}
              <span className="font-semibold text-slate-200">{excluindo.nome}</span>?
              As transações vinculadas a essa pessoa não serão excluídas.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExcluindo(null)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExcluir}
                disabled={excluindoId !== null}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {excluindoId ? "Removendo…" : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card de pessoa ───────────────────────────────────────────────────────────
function PessoaCard({
  pessoa,
  onEditar,
  onExcluir,
}: {
  pessoa: Pessoa;
  onEditar: (p: Pessoa) => void;
  onExcluir: (p: Pessoa) => void;
}) {
  const papel = (pessoa.papel as Papel) ?? "MEMBRO";
  const cor = pessoa.cor ?? CORES_OPCOES[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex items-center gap-4">
      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-slate-900 text-sm font-bold shrink-0"
        style={{ backgroundColor: cor }}
      >
        {initials(pessoa.nome)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-50 truncate">{pessoa.nome}</p>
        {pessoa.email && (
          <p className="text-[11px] text-slate-500 truncate">{pessoa.email}</p>
        )}
        <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${PAPEL_COR[papel]}`}>
          {PAPEL_LABEL[papel]}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEditar(pessoa)}
          className="rounded p-1.5 text-slate-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onExcluir(pessoa)}
          className="rounded p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}