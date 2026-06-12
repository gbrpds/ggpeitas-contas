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
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modelo || !tamanho) { setErro("Selecione o modelo e o tamanho."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelo, tamanho, quantidade, preco_custo: 0 }),
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
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "#111", borderTop: "2px solid #008C3A", borderLeft: "1px solid #222", borderRight: "1px solid #222", borderRadius: "20px 20px 0 0", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1c1c1c", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>Estoque</p>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#008C3A", margin: 0 }}>
              Entrada de Camisetas
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Modelo */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Modelo *</p>
            <select value={modelo} onChange={(e) => setModelo(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#1a1a1a", border: "1px solid #252525", color: modelo ? "#fff" : "#aaa", fontSize: 13, outline: "none", colorScheme: "dark" }}>
              <option value="">Selecione...</option>
              {MODELOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Tamanho */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Tamanho *</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {TAMANHOS.map((t) => (
                <button key={t} type="button" onClick={() => setTamanho(t)} style={{
                  padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em",
                  background: tamanho === t ? "#008C3A" : "#1a1a1a",
                  color: tamanho === t ? "#fff" : "#555",
                  border: `1px solid ${tamanho === t ? "#008C3A" : "#252525"}`,
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Quantidade *</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={() => setQuantidade(Math.max(1, quantidade - 1))} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #252525", background: "#1a1a1a", color: "#888", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>−</button>
              <p style={{ flex: 1, textAlign: "center", fontSize: 32, fontWeight: 900, fontFamily: "monospace", color: "#fff" }}>{quantidade}</p>
              <button type="button" onClick={() => setQuantidade(quantidade + 1)} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #252525", background: "#1a1a1a", color: "#888", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>+</button>
            </div>
          </div>

          {erro && <p style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>{erro}</p>}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
            border: "none", cursor: "pointer", background: "#008C3A", color: "#fff", opacity: loading ? 0.5 : 1,
          }}>
            {loading ? "Salvando..." : "Adicionar ao Estoque"}
          </button>
        </form>
      </div>
    </div>
  );
}
