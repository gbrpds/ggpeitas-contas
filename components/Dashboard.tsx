"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Modal from "./Modal";

interface Transacao {
  id: string;
  tipo: "VENDA" | "SAIDA";
  descricao: string;
  valor: number;
  frete: number;
  categoria: string;
  comprador: string | null;
  modelo: string | null;
  tamanho: string | null;
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

  const vendas = transacoes.filter(t => t.tipo === "VENDA");
  const saidas = transacoes.filter(t => t.tipo === "SAIDA");

  const totalBruto = vendas.reduce((s, t) => s + t.valor, 0);
  const totalFrete = vendas.reduce((s, t) => s + (t.frete || 0), 0);
  const totalSaidas = saidas.reduce((s, t) => s + t.valor, 0);
  const lucroLiquido = totalBruto - totalFrete - totalSaidas;

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      {/* Header */}
      <header
        className="px-6 py-4 sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, #080808 0%, rgba(5,5,5,0.95) 100%)",
          borderBottom: "1px solid #161616",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="GG Peitas" width={40} height={40} className="object-contain" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#444" }}>
                GG Peitas
              </p>
              <h1 className="text-sm font-black tracking-widest uppercase leading-none" style={{ color: "#F5C400" }}>
                Controle Financeiro
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModal("VENDA")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black tracking-wider uppercase transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #009942, #008C3A)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(0,140,58,0.3)",
              }}
            >
              <span>⚽</span> Venda
            </button>
            <button
              onClick={() => setModal("SAIDA")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black tracking-wider uppercase transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "#111",
                color: "#F5C400",
                border: "1px solid #2a2a2a",
              }}
            >
              <span>↓</span> Saída
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Vendas brutas"
            value={fmt(totalBruto)}
            sub={`${vendas.length} venda${vendas.length !== 1 ? "s" : ""}`}
            color="#008C3A"
            glow="rgba(0,140,58,0.15)"
          />
          <SummaryCard
            label="Frete enviado"
            value={fmt(totalFrete)}
            sub="custo de envio"
            color="#f97316"
            glow="rgba(249,115,22,0.1)"
          />
          <SummaryCard
            label="Saídas / Invest."
            value={fmt(totalSaidas)}
            sub={`${saidas.length} registro${saidas.length !== 1 ? "s" : ""}`}
            color="#ef4444"
            glow="rgba(239,68,68,0.1)"
          />
          <SummaryCard
            label="Lucro líquido"
            value={fmt(lucroLiquido)}
            sub="resultado final"
            color={lucroLiquido >= 0 ? "#F5C400" : "#ef4444"}
            glow={lucroLiquido >= 0 ? "rgba(245,196,0,0.12)" : "rgba(239,68,68,0.1)"}
            destaque
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <div
            className="flex rounded-xl overflow-hidden p-0.5"
            style={{ background: "#111", border: "1px solid #1a1a1a" }}
          >
            {(["TODOS", "VENDA", "SAIDA"] as const).map((t) => {
              const active = filtroTipo === t;
              return (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className="px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all"
                  style={{
                    background: active
                      ? t === "VENDA" ? "#008C3A" : t === "SAIDA" ? "#F5C400" : "#fff"
                      : "transparent",
                    color: active
                      ? t === "VENDA" ? "#fff" : "#050505"
                      : "#444",
                  }}
                >
                  {t === "TODOS" ? "Todos" : t === "VENDA" ? "Vendas" : "Saídas"}
                </button>
              );
            })}
          </div>

          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold outline-none"
            style={{
              background: "#111",
              border: "1px solid #1a1a1a",
              color: mes ? "#fff" : "#444",
              colorScheme: "dark",
            }}
          >
            <option value="">Todos os meses</option>
            {getMeses().map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #161616" }}>
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ background: "#0a0a0a", borderBottom: "1px solid #161616" }}
          >
            <span className="text-xs uppercase tracking-widest" style={{ color: "#444" }}>
              Histórico — {transacoes.length} registro{transacoes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center" style={{ background: "#0d0d0d" }}>
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#333" }}>Carregando...</p>
            </div>
          ) : transacoes.length === 0 ? (
            <div className="py-20 text-center" style={{ background: "#0d0d0d" }}>
              <div className="text-3xl mb-3">📋</div>
              <p className="text-sm font-semibold" style={{ color: "#333" }}>Nenhuma transação ainda</p>
              <p className="text-xs mt-1" style={{ color: "#2a2a2a" }}>Registre uma venda ou saída acima</p>
            </div>
          ) : (
            <div style={{ background: "#0d0d0d" }}>
              {transacoes.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                  style={{
                    borderBottom: i < transacoes.length - 1 ? "1px solid #141414" : undefined,
                    opacity: deletando === t.id ? 0.3 : 1,
                  }}
                >
                  {/* Ícone tipo */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{
                      background: t.tipo === "VENDA"
                        ? "rgba(0,140,58,0.15)"
                        : "rgba(239,68,68,0.12)",
                    }}
                  >
                    {t.tipo === "VENDA" ? "⚽" : "↓"}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.descricao}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: t.tipo === "VENDA" ? "rgba(0,140,58,0.1)" : "rgba(239,68,68,0.1)",
                          color: t.tipo === "VENDA" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {t.categoria}
                      </span>
                      {t.tamanho && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "#1a1a1a", color: "#666" }}>
                          {t.tamanho}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "#333" }}>{fmtData(t.data)}</span>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-sm font-black font-mono"
                      style={{ color: t.tipo === "VENDA" ? "#4ade80" : "#f87171" }}
                    >
                      {t.tipo === "VENDA" ? "+" : "−"}{fmt(t.valor)}
                    </p>
                    {t.tipo === "VENDA" && (t.frete || 0) > 0 && (
                      <p className="text-xs font-mono" style={{ color: "#f97316" }}>
                        frete −{fmt(t.frete)}
                      </p>
                    )}
                    {t.tipo === "VENDA" && (
                      <p className="text-xs font-mono" style={{ color: "#888" }}>
                        liq. {fmt(t.valor - (t.frete || 0))}
                      </p>
                    )}
                  </div>

                  {/* Deletar */}
                  <button
                    onClick={() => deletar(t.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all flex-shrink-0"
                    style={{ color: "#2a2a2a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a2a")}
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
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

function SummaryCard({
  label, value, sub, color, glow, destaque,
}: {
  label: string; value: string; sub: string; color: string; glow: string; destaque?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: destaque ? `linear-gradient(135deg, ${glow}, transparent)` : "#0d0d0d",
        border: "1px solid",
        borderColor: destaque ? color + "33" : "#161616",
        boxShadow: destaque ? `0 0 30px ${glow}` : undefined,
      }}
    >
      <p className="text-xs uppercase tracking-wider mb-2 truncate" style={{ color: "#444" }}>{label}</p>
      <p className="text-xl font-black font-mono leading-none" style={{ color }}>{value}</p>
      <p className="text-xs mt-1.5" style={{ color: "#333" }}>{sub}</p>
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
