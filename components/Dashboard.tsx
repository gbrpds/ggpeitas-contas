"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "./Header";
import Modal from "./Modal";

interface Transacao {
  id: string;
  tipo: "VENDA" | "SAIDA";
  descricao: string;
  valor: number;
  frete: number;
  categoria: string;
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
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <Header />

      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Cards */}
        <div className="summary-grid">
          {[
            { label: "Vendas brutas", value: fmt(totalBruto), color: "#fff" },
            { label: "Frete enviado", value: fmt(totalFrete), color: "#888" },
            { label: "Saídas", value: fmt(totalSaidas), color: "#ef4444" },
            { label: "Lucro líquido", value: fmt(lucro), color: lucro >= 0 ? "#F5C400" : "#ef4444" },
          ].map((c) => (
            <div key={c.label} className="summary-card">
              <p>{c.label}</p>
              <p className="summary-value" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="filters-row" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", border: "1px solid #1c1c1c", borderRadius: 10, overflow: "hidden" }}>
            {(["TODOS", "VENDA", "SAIDA"] as const).map((t) => {
              const active = filtroTipo === t;
              return (
                <button key={t} onClick={() => setFiltroTipo(t)} style={{
                  padding: "7px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: "pointer", border: "none",
                  background: active ? (t === "VENDA" ? "#008C3A" : t === "SAIDA" ? "#ef4444" : "#fff") : "#111",
                  color: active ? (t === "TODOS" ? "#000" : "#fff") : "#555",
                }}>
                  {t === "TODOS" ? "Todos" : t === "VENDA" ? "Vendas" : "Saídas"}
                </button>
              );
            })}
          </div>
          <select value={mes} onChange={(e) => setMes(e.target.value)} style={{
            padding: "7px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
            color: mes ? "#fff" : "#777", background: "#111", border: "1px solid #1c1c1c",
            colorScheme: "dark", cursor: "pointer", maxWidth: 160,
          }}>
            <option value="">Todos os meses</option>
            {getMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          {/* Botões de ação — visíveis só no desktop */}
          <div className="hide-mobile" style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button onClick={() => setModal("SAIDA")} style={{
              padding: "7px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              color: "#fff", border: "1px solid #ef4444", background: "transparent",
            }}>− Saída</button>
            <button onClick={() => setModal("VENDA")} style={{
              padding: "7px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              color: "#fff", background: "#008C3A", border: "none",
            }}>+ Venda</button>
          </div>
        </div>

        {/* Lista */}
        <div className="table-container">
          <div className="table-header">
            <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
              Histórico · {transacoes.length} registro{transacoes.length !== 1 ? "s" : ""}
            </p>
          </div>
          {loading ? (
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
            </div>
          ) : transacoes.length === 0 ? (
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Nenhuma transação ainda</p>
            </div>
          ) : (
            <div className="table-body">
              {transacoes.map((t) => (
                <div key={t.id} className="table-row" style={{ opacity: deletando === t.id ? 0.3 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.descricao}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: t.tipo === "VENDA" ? "#008C3A" : "#ef4444" }}>{t.categoria}</span>
                      {t.tamanho && <span style={{ fontSize: 10, fontWeight: 700, color: "#444", background: "#1a1a1a", padding: "1px 5px", borderRadius: 4 }}>{t.tamanho}</span>}
                      <span className="hide-mobile" style={{ fontSize: 10, color: "#333" }}>{fmtData(t.data)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 900, fontFamily: "monospace", color: t.tipo === "VENDA" ? "#4ade80" : "#ef4444", whiteSpace: "nowrap" }}>
                      {t.tipo === "VENDA" ? "+" : "−"}{fmt(t.valor)}
                    </p>
                    {t.tipo === "VENDA" && (t.frete || 0) > 0 && (
                      <p className="hide-mobile" style={{ fontSize: 11, fontFamily: "monospace", color: "#555" }}>frete −{fmt(t.frete)}</p>
                    )}
                    {t.tipo === "VENDA" && (
                      <p className="hide-mobile" style={{ fontSize: 11, fontFamily: "monospace", color: "#555" }}>líq. {fmt(t.valor - (t.frete || 0))}</p>
                    )}
                  </div>
                  <button onClick={() => deletar(t.id)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "#2a2a2a", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
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

      {/* FABs — apenas no mobile */}
      <div className="show-mobile-only" style={{ position: "fixed", bottom: 24, right: 20, flexDirection: "column", gap: 10, zIndex: 30 }}>
        <button onClick={() => setModal("SAIDA")} style={{
          padding: "13px 22px", borderRadius: 14, fontSize: 13, fontWeight: 900,
          letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
          color: "#fff", border: "1px solid #ef4444", background: "#0a0a0a",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>− Saída</button>
        <button onClick={() => setModal("VENDA")} style={{
          padding: "13px 22px", borderRadius: 14, fontSize: 13, fontWeight: 900,
          letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
          color: "#fff", background: "#008C3A", border: "none",
          boxShadow: "0 4px 20px rgba(0,140,58,0.35)",
        }}>+ Venda</button>
      </div>

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
