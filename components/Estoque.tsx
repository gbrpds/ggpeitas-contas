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
  preco_custo: number;
  createdAt: string;
}

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ORDEM_TAMANHO: Record<string, number> = { P: 0, M: 1, G: 2, GG: 3 };

export default function Estoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [modal, setModal] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/estoque");
    const data = await res.json();
    setItens(data);
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
  const totalInvestido = itens.reduce((s, i) => s + i.quantidade * i.preco_custo, 0);

  // Agrupar por modelo
  const porModelo = itens.reduce((acc, item) => {
    if (!acc[item.modelo]) acc[item.modelo] = [];
    acc[item.modelo].push(item);
    return acc;
  }, {} as Record<string, ItemEstoque[]>);

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
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#444" }}>GG Peitas</p>
              <h1 className="text-sm font-black tracking-widest uppercase leading-none" style={{ color: "#F5C400" }}>
                Estoque
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black tracking-wider uppercase transition-all hover:opacity-90"
              style={{ background: "#111", color: "#666", border: "1px solid #1a1a1a" }}
            >
              ← Financeiro
            </Link>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black tracking-wider uppercase transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #009942, #008C3A)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(0,140,58,0.3)",
              }}
            >
              + Entrada
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#0d0d0d", border: "1px solid #161616" }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#444" }}>Total em estoque</p>
            <p className="text-3xl font-black" style={{ color: "#F5C400" }}>{totalPecas}</p>
            <p className="text-xs mt-1" style={{ color: "#333" }}>peças disponíveis</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: "#0d0d0d", border: "1px solid #161616" }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#444" }}>Investido em estoque</p>
            <p className="text-xl font-black font-mono" style={{ color: "#ef4444" }}>{fmt(totalInvestido)}</p>
            <p className="text-xs mt-1" style={{ color: "#333" }}>custo total</p>
          </div>
          <div
            className="rounded-2xl p-4 col-span-2 sm:col-span-1"
            style={{ background: "#0d0d0d", border: "1px solid #161616" }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#444" }}>Modelos cadastrados</p>
            <p className="text-3xl font-black" style={{ color: "#008C3A" }}>{Object.keys(porModelo).length}</p>
            <p className="text-xs mt-1" style={{ color: "#333" }}>modelos diferentes</p>
          </div>
        </div>

        {/* Lista por modelo */}
        {loading ? (
          <div className="py-20 text-center rounded-2xl" style={{ background: "#0d0d0d", border: "1px solid #161616" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#333" }}>Carregando...</p>
          </div>
        ) : itens.length === 0 ? (
          <div className="py-20 text-center rounded-2xl" style={{ background: "#0d0d0d", border: "1px solid #161616" }}>
            <div className="text-3xl mb-3">👕</div>
            <p className="text-sm font-semibold" style={{ color: "#333" }}>Estoque vazio</p>
            <p className="text-xs mt-1" style={{ color: "#2a2a2a" }}>Adicione camisetas com o botão acima</p>
          </div>
        ) : (
          Object.entries(porModelo).map(([modelo, modeloItens]) => {
            const totalModelo = modeloItens.reduce((s, i) => s + i.quantidade, 0);
            const sorted = [...modeloItens].sort(
              (a, b) => (ORDEM_TAMANHO[a.tamanho] ?? 99) - (ORDEM_TAMANHO[b.tamanho] ?? 99)
            );

            return (
              <div
                key={modelo}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid #161616" }}
              >
                {/* Header do modelo */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{ background: "#0a0a0a", borderBottom: "1px solid #161616" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">👕</span>
                    <span className="font-black tracking-wide text-white">{modelo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2.5 py-1 rounded-lg font-black"
                      style={{
                        background: totalModelo > 0 ? "rgba(0,140,58,0.15)" : "rgba(239,68,68,0.15)",
                        color: totalModelo > 0 ? "#4ade80" : "#f87171",
                      }}
                    >
                      {totalModelo} {totalModelo === 1 ? "peça" : "peças"}
                    </span>
                  </div>
                </div>

                {/* Tamanhos */}
                <div style={{ background: "#0d0d0d" }}>
                  {sorted.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-5 py-3.5"
                      style={{
                        borderBottom: i < sorted.length - 1 ? "1px solid #141414" : undefined,
                        opacity: deletando === item.id ? 0.3 : 1,
                      }}
                    >
                      {/* Tamanho badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{
                          background: item.quantidade > 0 ? "rgba(0,140,58,0.12)" : "rgba(239,68,68,0.1)",
                          color: item.quantidade > 0 ? "#4ade80" : "#f87171",
                          border: "1px solid",
                          borderColor: item.quantidade > 0 ? "rgba(0,140,58,0.3)" : "rgba(239,68,68,0.2)",
                        }}
                      >
                        {item.tamanho}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Tamanho {item.tamanho}</p>
                        {item.preco_custo > 0 && (
                          <p className="text-xs" style={{ color: "#444" }}>
                            custo unitário: {fmt(item.preco_custo)}
                          </p>
                        )}
                      </div>

                      {/* Quantidade */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-2xl font-black font-mono leading-none"
                          style={{ color: item.quantidade > 0 ? "#fff" : "#ef4444" }}
                        >
                          {item.quantidade}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#333" }}>
                          {item.quantidade === 0 ? "sem estoque" : item.quantidade === 1 ? "peça" : "peças"}
                        </p>
                      </div>

                      {/* Deletar */}
                      <button
                        onClick={() => deletar(item.id)}
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
              </div>
            );
          })
        )}
      </main>

      {modal && (
        <ModalEstoque
          onClose={() => setModal(false)}
          onSalvo={() => { setModal(false); carregar(); }}
        />
      )}
    </div>
  );
}
