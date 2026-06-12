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
  createdAt: string;
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
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1c1c1c", background: "#0a0a0a" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="GG Peitas" width={36} height={36} className="object-contain" />
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>GG Peitas</p>
              <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.2em", color: "#F5C400", textTransform: "uppercase", lineHeight: 1 }}>Estoque</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", border: "1px solid #222", background: "transparent", textDecoration: "none" }}>
              ← Financeiro
            </Link>
            <button onClick={() => setModal(true)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "#008C3A", border: "none", cursor: "pointer" }}>
              + Entrada
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Total em estoque</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#F5C400", lineHeight: 1 }}>{totalPecas}</p>
            <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>peças disponíveis</p>
          </div>
          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Modelos</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#008C3A", lineHeight: 1 }}>{Object.keys(porModelo).length}</p>
            <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>modelos cadastrados</p>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1c1c1c" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
          </div>
        ) : itens.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1c1c1c" }}>
            <p style={{ fontSize: 22, marginBottom: 8 }}>👕</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Estoque vazio</p>
          </div>
        ) : (
          Object.entries(porModelo).map(([modelo, modeloItens]) => {
            const total = modeloItens.reduce((s, i) => s + i.quantidade, 0);
            const sorted = [...modeloItens].sort((a, b) => (ORDEM[a.tamanho] ?? 99) - (ORDEM[b.tamanho] ?? 99));

            return (
              <div key={modelo} style={{ border: "1px solid #1c1c1c", borderRadius: 12, overflow: "hidden" }}>
                {/* Modelo header */}
                <div style={{ background: "#111", borderBottom: "1px solid #1c1c1c", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>{modelo}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 6,
                    background: total > 0 ? "rgba(0,140,58,0.12)" : "rgba(239,68,68,0.12)",
                    color: total > 0 ? "#4ade80" : "#ef4444",
                  }}>
                    {total} {total === 1 ? "peça" : "peças"}
                  </span>
                </div>

                {/* Tamanhos */}
                <div style={{ background: "#0d0d0d" }}>
                  {sorted.map((item, i) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                      borderBottom: i < sorted.length - 1 ? "1px solid #141414" : undefined,
                      opacity: deletando === item.id ? 0.3 : 1,
                    }}>
                      {/* Tamanho */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 900, flexShrink: 0,
                        background: item.quantidade > 0 ? "rgba(0,140,58,0.1)" : "rgba(239,68,68,0.1)",
                        color: item.quantidade > 0 ? "#4ade80" : "#ef4444",
                        border: `1px solid ${item.quantidade > 0 ? "rgba(0,140,58,0.25)" : "rgba(239,68,68,0.2)"}`,
                      }}>
                        {item.tamanho}
                      </div>

                      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#888" }}>Tamanho {item.tamanho}</p>

                      {/* Quantidade */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace", lineHeight: 1, color: item.quantidade > 0 ? "#fff" : "#ef4444" }}>
                          {item.quantidade}
                        </p>
                        <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginTop: 2 }}>
                          {item.quantidade === 0 ? "sem estoque" : "disponível"}
                        </p>
                      </div>

                      <button onClick={() => deletar(item.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "#2a2a2a", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
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
