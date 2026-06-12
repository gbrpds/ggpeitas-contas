"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
    setTransacoes(await res.json());
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
  const lucro = totalBruto - totalFrete - totalSaidas;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1c1c1c", background: "#0a0a0a" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="GG Peitas" width={36} height={36} className="object-contain" />
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>GG Peitas</p>
              <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.2em", color: "#F5C400", textTransform: "uppercase", lineHeight: 1 }}>Financeiro</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/contatos" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", border: "1px solid #222", background: "transparent", textDecoration: "none" }}>
              Contatos
            </Link>
            <Link href="/estoque" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", border: "1px solid #222", background: "transparent", textDecoration: "none" }}>
              Estoque
            </Link>
            <button onClick={() => setModal("SAIDA")} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", border: "1px solid #ef4444", background: "transparent", cursor: "pointer" }}>
              − Saída
            </button>
            <button onClick={() => setModal("VENDA")} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "#008C3A", border: "none", cursor: "pointer" }}>
              + Venda
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Vendas brutas", value: fmt(totalBruto), color: "#fff" },
            { label: "Frete enviado", value: fmt(totalFrete), color: "#888" },
            { label: "Saídas", value: fmt(totalSaidas), color: "#ef4444" },
            { label: "Lucro líquido", value: fmt(lucro), color: lucro >= 0 ? "#F5C400" : "#ef4444" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>{c.label}</p>
              <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: c.color, letterSpacing: "-0.02em" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", border: "1px solid #1c1c1c", borderRadius: 10, overflow: "hidden" }}>
            {(["TODOS", "VENDA", "SAIDA"] as const).map((t) => {
              const active = filtroTipo === t;
              return (
                <button key={t} onClick={() => setFiltroTipo(t)} style={{
                  padding: "7px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", border: "none",
                  background: active ? (t === "VENDA" ? "#008C3A" : t === "SAIDA" ? "#ef4444" : "#fff") : "#111",
                  color: active ? (t === "TODOS" ? "#000" : "#fff") : "#444",
                }}>
                  {t === "TODOS" ? "Todos" : t === "VENDA" ? "Vendas" : "Saídas"}
                </button>
              );
            })}
          </div>
          <select value={mes} onChange={(e) => setMes(e.target.value)} style={{ padding: "7px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, color: mes ? "#fff" : "#444", background: "#111", border: "1px solid #1c1c1c", letterSpacing: "0.1em", colorScheme: "dark", cursor: "pointer" }}>
            <option value="">Todos os meses</option>
            {getMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div style={{ border: "1px solid #1c1c1c", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "#111", borderBottom: "1px solid #1c1c1c", padding: "10px 18px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
              Histórico · {transacoes.length} registro{transacoes.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#0d0d0d" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
            </div>
          ) : transacoes.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#0d0d0d" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Nenhuma transação ainda</p>
            </div>
          ) : (
            <div style={{ background: "#0d0d0d" }}>
              {transacoes.map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                  borderBottom: i < transacoes.length - 1 ? "1px solid #141414" : undefined,
                  opacity: deletando === t.id ? 0.3 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.descricao}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: t.tipo === "VENDA" ? "#008C3A" : "#ef4444" }}>{t.categoria}</span>
                      {t.tamanho && <span style={{ fontSize: 10, fontWeight: 700, color: "#444", background: "#1a1a1a", padding: "1px 6px", borderRadius: 4 }}>{t.tamanho}</span>}
                      <span style={{ fontSize: 10, color: "#333" }}>{fmtData(t.data)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: t.tipo === "VENDA" ? "#4ade80" : "#ef4444" }}>
                      {t.tipo === "VENDA" ? "+" : "−"}{fmt(t.valor)}
                    </p>
                    {t.tipo === "VENDA" && (t.frete || 0) > 0 && (
                      <p style={{ fontSize: 11, fontFamily: "monospace", color: "#555" }}>frete −{fmt(t.frete)}</p>
                    )}
                    {t.tipo === "VENDA" && (
                      <p style={{ fontSize: 11, fontFamily: "monospace", color: "#555" }}>líq. {fmt(t.valor - (t.frete || 0))}</p>
                    )}
                  </div>

                  <button onClick={() => deletar(t.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "#2a2a2a", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a2a")}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modal && <Modal tipo={modal} onClose={() => setModal(null)} onSalvo={() => { setModal(null); carregar(); }} />}
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
