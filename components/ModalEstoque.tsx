"use client";

import { useState } from "react";

const MODELOS = ["Brasil 2026 Home", "Brasil 2026 Away", "Outro"];
const TAMANHOS = ["P", "M", "G", "GG"];

interface Props {
  onClose: () => void;
  onSalvo: () => void;
}

export default function ModalEstoque({ onClose, onSalvo }: Props) {
  const [modelo, setModelo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoCusto, setPrecoCusto] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modelo || !tamanho || !quantidade) {
      setErro("Preencha modelo, tamanho e quantidade.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelo, tamanho, quantidade, preco_custo: precoCusto }),
      });
      if (!res.ok) throw new Error();
      onSalvo();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "#0d0d0d",
          border: "1px solid #008C3A",
          boxShadow: "0 0 40px rgba(0,140,58,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(0,140,58,0.2) 0%, rgba(0,140,58,0.05) 100%)",
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-0.5">Estoque</p>
            <h2 className="text-xl font-black tracking-widest uppercase" style={{ color: "#008C3A" }}>
              + Entrada de Camisetas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Modelo */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>
              Modelo *
            </label>
            <div className="flex flex-col gap-2">
              {MODELOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModelo(m)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all text-left px-4"
                  style={{
                    background: modelo === m ? "rgba(0,140,58,0.15)" : "#1a1a1a",
                    color: modelo === m ? "#4ade80" : "#555",
                    border: "1px solid",
                    borderColor: modelo === m ? "#008C3A" : "#2a2a2a",
                  }}
                >
                  {modelo === m ? "✓ " : ""}{m}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>
              Tamanho *
            </label>
            <div className="flex gap-2">
              {TAMANHOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTamanho(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
                  style={{
                    background: tamanho === t ? "#008C3A" : "#1a1a1a",
                    color: tamanho === t ? "#fff" : "#555",
                    border: "1px solid",
                    borderColor: tamanho === t ? "#008C3A" : "#2a2a2a",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantidade */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>
                Quantidade *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantidade(String(Math.max(1, parseInt(quantidade) - 1)))}
                  className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
                  style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="flex-1 text-center py-2 rounded-xl text-lg font-black text-white outline-none"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                />
                <button
                  type="button"
                  onClick={() => setQuantidade(String(parseInt(quantidade) + 1))}
                  className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
                  style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Preço de custo */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>
                Preço de custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precoCusto}
                onChange={(e) => setPrecoCusto(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-[#444] outline-none"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              />
            </div>
          </div>

          {erro && (
            <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black tracking-widest uppercase text-sm transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #009942, #008C3A)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(0,140,58,0.3)",
            }}
          >
            {loading ? "Salvando..." : "Adicionar ao Estoque"}
          </button>
        </form>
      </div>
    </div>
  );
}
