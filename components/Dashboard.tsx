"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "./Modal";

interface Transacao {
  id: string;
  tipo: "VENDA" | "SAIDA";
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function Dashboard() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [modal, setModal] = useState<"VENDA" | "SAIDA" | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "VENDA" | "SAIDA">("TODOS");
  const [filtroCat, setFiltroCat] = useState("");
  const [mes, setMes] = useState("");
  const [deletando, setDeletando] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroTipo !== "TODOS") params.set("tipo", filtroTipo);
    if (mes) params.set("mes", mes);
    const res = await fetch(`/api/transacoes?${params}`);
    const data = await res.json();
    setTransacoes(data);
    setLoading(false);
  }, [filtroTipo, mes]);

  useEffect(() => { carregar(); }, [carregar]);

  async function deletar(id: string) {
    if (!confirm("Remover essa transação?")) return;
    setDeletando(id);
    await fetch(`/api/transacoes/${id}`, { method: "DELETE" });
    await carregar();
    setDeletando(null);
  }

  const totalVendas = transacoes.filter(t => t.tipo === "VENDA").reduce((s, t) => s + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === "SAIDA").reduce((s, t) => s + t.valor, 0);
  const lucro = totalVendas - totalSaidas;

  const categorias = [...new Set(transacoes.map(t => t.categoria))];
  const lista = filtroCat ? transacoes.filter(t => t.categoria === filtroCat) : transacoes;

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40"
        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500">GG PEITAS</span>
          <h1 className="text-xl font-bold tracking-widest uppercase" style={{ color: "#F5C400" }}>
            Controle Financeiro
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModal("VENDA")}
            className="px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#008C3A", color: "#fff" }}
          >
            + Venda
          </button>
          <button
            onClick={() => setModal("SAIDA")}
            className="px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#1a1a1a", color: "#F5C400", border: "1px solid #F5C400" }}
          >
            − Saída
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            label="Total Vendas"
            value={fmt(totalVendas)}
            color="#008C3A"
            icon="↑"
          />
          <Card
            label="Total Saídas"
            value={fmt(totalSaidas)}
            color="#ef4444"
            icon="↓"
          />
          <Card
            label="Lucro Líquido"
            value={fmt(lucro)}
            color={lucro >= 0 ? "#F5C400" : "#ef4444"}
            icon="="
            destaque
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#222" }}>
            {(["TODOS", "VENDA", "SAIDA"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className="px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors"
                style={{
                  background: filtroTipo === t ? (t === "VENDA" ? "#008C3A" : t === "SAIDA" ? "#F5C400" : "#fff") : "#111",
                  color: filtroTipo === t ? (t === "SAIDA" ? "#050505" : t === "TODOS" ? "#050505" : "#fff") : "#888",
                }}
              >
                {t === "TODOS" ? "Todos" : t === "VENDA" ? "Vendas" : "Saídas"}
              </button>
            ))}
          </div>

          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-white outline-none"
            style={{ background: "#111", border: "1px solid #222", colorScheme: "dark" }}
          >
            <option value="">Todos os meses</option>
            {getMeses().map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {categorias.length > 0 && (
            <select
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs text-white outline-none"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              <option value="">Todas categorias</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tabela */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#1a1a1a" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: "#0d0d0d", borderColor: "#1a1a1a" }}>
            <span className="text-xs uppercase tracking-widest text-gray-400">
              Histórico — {lista.length} {lista.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-600 text-sm" style={{ background: "#111" }}>
              Carregando...
            </div>
          ) : lista.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm" style={{ background: "#111" }}>
              Nenhuma transação encontrada.
            </div>
          ) : (
            <table className="w-full text-sm" style={{ background: "#111" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-gray-500 font-normal">Data</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-gray-500 font-normal">Descrição</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-gray-500 font-normal hidden sm:table-cell">Categoria</th>
                  <th className="px-5 py-3 text-right text-xs uppercase tracking-widest text-gray-500 font-normal">Valor</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: i < lista.length - 1 ? "1px solid #161616" : undefined,
                      opacity: deletando === t.id ? 0.4 : 1,
                    }}
                  >
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap text-xs">{fmtData(t.data)}</td>
                    <td className="px-5 py-3 text-white">{t.descricao}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: t.tipo === "VENDA" ? "rgba(0,140,58,0.15)" : "rgba(239,68,68,0.12)",
                          color: t.tipo === "VENDA" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {t.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold whitespace-nowrap"
                      style={{ color: t.tipo === "VENDA" ? "#4ade80" : "#f87171" }}>
                      {t.tipo === "VENDA" ? "+" : "−"}{fmt(t.valor)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deletar(t.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors text-xs"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modal && (
        <Modal
          tipo={modal}
          onClose={() => setModal(null)}
          onSalvo={() => { setModal(null); carregar(); }}
        />
      )}
    </div>
  );
}

function Card({ label, value, color, icon, destaque }: {
  label: string; value: string; color: string; icon: string; destaque?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: destaque ? `rgba(245,196,0,0.05)` : "#111",
        borderColor: destaque ? color : "#1a1a1a",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function getMeses() {
  const meses = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    });
  }
  return meses;
}
