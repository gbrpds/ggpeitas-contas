"use client";

import { useState } from "react";

const CATEGORIAS_VENDA = ["Camiseta", "Frete cobrado", "Outro"];
const CATEGORIAS_SAIDA = ["Estoque", "Frete", "Embalagem", "Marketing", "Taxa MP", "Outro"];

interface Props {
  tipo: "VENDA" | "SAIDA";
  onClose: () => void;
  onSalvo: () => void;
}

export default function Modal({ tipo, onClose, onSalvo }: Props) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const categorias = tipo === "VENDA" ? CATEGORIAS_VENDA : CATEGORIAS_SAIDA;
  const isVenda = tipo === "VENDA";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !valor || !categoria) {
      setErro("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, descricao, valor, categoria, data }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      onSalvo();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{ background: "#111", borderColor: isVenda ? "#008C3A" : "#F5C400" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-bold tracking-widest uppercase"
            style={{ color: isVenda ? "#008C3A" : "#F5C400" }}
          >
            {isVenda ? "+ Nova Venda" : "− Nova Saída"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Descrição
            </label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={isVenda ? "Ex: Camisa Brasil M — João" : "Ex: Compra 10 camisas"}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                // @ts-expect-error css var
                "--tw-ring-color": isVenda ? "#008C3A" : "#F5C400",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                style={{ background: "#1a1a1a", border: "1px solid #333" }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1"
                style={{ background: "#1a1a1a", border: "1px solid #333", colorScheme: "dark" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1"
              style={{ background: "#1a1a1a", border: "1px solid #333" }}
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {erro && <p className="text-red-400 text-xs">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-opacity disabled:opacity-50"
            style={{
              background: isVenda ? "#008C3A" : "#F5C400",
              color: isVenda ? "#fff" : "#050505",
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
