"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import ModalEstoque from "./ModalEstoque";

interface ItemEstoque {
  id: string;
  modelo: string;
  tamanho: string;
  quantidade: number;
}

const ORDEM: Record<string, number> = { P: 0, M: 1, G: 2, GG: 3 };

export default function Estoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [modal, setModal] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/estoque");
    setItens(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function deletar(id: string) {
    if (!confirm("Remover este item do estoque?")) return;
    setDeletando(id);
    await fetch(`/api/estoque/${id}`, { method: "DELETE" });
    await carregar();
    setDeletando(null);
  }

  const totalPecas = itens.reduce((s, i) => s + i.quantidade, 0);
  const porModelo = itens.reduce((acc, item) => {
    if (!acc[item.modelo]) acc[item.modelo] = [];
    acc[item.modelo].push(item);
    return acc;
  }, {} as Record<string, ItemEstoque[]>);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <header className="header-root">
        <div className="header-inner page-container">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Image src="/logo.png" alt="GG Peitas" width={34} height={34} className="object-contain" />
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>GG Peitas</p>
              <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", color: "#F5C400", textTransform: "uppercase", lineHeight: 1 }}>Estoque</p>
            </div>
          </div>
          <div className="header-nav">
            <Link href="/" className="btn-nav">← Financeiro</Link>
            <button onClick={() => setModal(true)} className="btn-primary">+ Entrada</button>
          </div>
        </div>
      </header>

      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="summary-grid-2">
          <div className="summary-card">
            <p>Total em estoque</p>
            <p className="summary-value" style={{ fontSize: 32, color: "#F5C400" }}>{totalPecas}</p>
            <p className="summary-sub">peças disponíveis</p>
          </div>
          <div className="summary-card">
            <p>Modelos</p>
            <p className="summary-value" style={{ fontSize: 32, color: "#008C3A" }}>{Object.keys(porModelo).length}</p>
            <p className="summary-sub">modelos cadastrados</p>
          </div>
        </div>

        {loading ? (
          <div className="table-container">
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
            </div>
          </div>
        ) : itens.length === 0 ? (
          <div className="table-container">
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>👕</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Estoque vazio</p>
            </div>
          </div>
        ) : (
          Object.entries(porModelo).map(([modelo, modeloItens]) => {
            const total = modeloItens.reduce((s, i) => s + i.quantidade, 0);
            const sorted = [...modeloItens].sort((a, b) => (ORDEM[a.tamanho] ?? 99) - (ORDEM[b.tamanho] ?? 99));
            return (
              <div key={modelo} className="table-container">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>{modelo}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: total > 0 ? "rgba(0,140,58,0.12)" : "rgba(239,68,68,0.12)",
                    color: total > 0 ? "#4ade80" : "#ef4444",
                  }}>
                    {total} {total === 1 ? "peça" : "peças"}
                  </span>
                </div>
                <div className="table-body">
                  {sorted.map((item) => (
                    <div key={item.id} className="table-row" style={{ opacity: deletando === item.id ? 0.3 : 1 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 900,
                        background: item.quantidade > 0 ? "rgba(0,140,58,0.1)" : "rgba(239,68,68,0.1)",
                        color: item.quantidade > 0 ? "#4ade80" : "#ef4444",
                        border: `1px solid ${item.quantidade > 0 ? "rgba(0,140,58,0.25)" : "rgba(239,68,68,0.2)"}`,
                      }}>
                        {item.tamanho}
                      </div>
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#666" }}>Tamanho {item.tamanho}</p>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace", lineHeight: 1, color: item.quantidade > 0 ? "#fff" : "#ef4444" }}>{item.quantidade}</p>
                        <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginTop: 2 }}>
                          {item.quantidade === 0 ? "sem estoque" : "disponível"}
                        </p>
                      </div>
                      <button onClick={() => deletar(item.id)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "#2a2a2a", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a2a")}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      {modal && <ModalEstoque onClose={() => setModal(false)} onSalvo={() => { setModal(false); carregar(); }} />}
    </div>
  );
}
