"use client";

import { useState } from "react";

const MODELOS = ["Brasil 2026 Home", "Brasil 2026 Away", "Outro"];
const TAMANHOS = ["P", "M", "G", "GG"];
const CATEGORIAS_SAIDA = ["Estoque", "Frete", "Embalagem", "Marketing", "Taxa MP", "Outro"];

interface Props {
  tipo: "VENDA" | "SAIDA";
  onClose: () => void;
  onSalvo: () => void;
}

export default function Modal({ tipo, onClose, onSalvo }: Props) {
  const isVenda = tipo === "VENDA";

  const [comprador, setComprador] = useState("");
  const [modelo, setModelo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [valorBruto, setValorBruto] = useState("");
  const [frete, setFrete] = useState("");

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");

  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const lucro = (parseFloat(valorBruto) || 0) - (parseFloat(frete) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (isVenda && (!comprador || !modelo || !tamanho || !valorBruto)) { setErro("Preencha todos os campos obrigatórios."); return; }
    if (!isVenda && (!descricao || !valor || !categoria)) { setErro("Preencha todos os campos."); return; }

    setLoading(true);
    try {
      const body = isVenda
        ? { tipo: "VENDA", descricao: `${modelo} ${tamanho} — ${comprador}`, valor: parseFloat(valorBruto), categoria: "Camiseta", data, comprador, modelo, tamanho, frete: parseFloat(frete) || 0 }
        : { tipo: "SAIDA", descricao, valor: parseFloat(valor), categoria, data, frete: 0 };

      const res = await fetch("/api/transacoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      onSalvo();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const accent = isVenda ? "#008C3A" : "#ef4444";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "#111", borderTop: `2px solid ${accent}`, borderLeft: "1px solid #222", borderRight: "1px solid #222", borderRadius: "20px 20px 0 0", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1c1c1c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                {isVenda ? "Nova Transação" : "Registrar Saída"}
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, margin: 0 }}>
                {isVenda ? "Venda de Camiseta" : "Saída / Investimento"}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {isVenda ? (
            <>
              <Field label="Nome do comprador *">
                <input value={comprador} onChange={(e) => setComprador(e.target.value)} placeholder="Ex: João Silva" style={inputStyle} />
              </Field>

              <Field label="Modelo *">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {MODELOS.map((m) => (
                    <button key={m} type="button" onClick={() => setModelo(m)} style={{
                      padding: "10px 14px", borderRadius: 8, textAlign: "left", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
                      background: modelo === m ? "rgba(0,140,58,0.12)" : "#1a1a1a",
                      color: modelo === m ? "#4ade80" : "#666",
                      border: `1px solid ${modelo === m ? "#008C3A" : "#252525"}`,
                    }}>
                      {modelo === m ? "✓  " : "   "}{m}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Tamanho *">
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
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Valor da venda (R$) *">
                  <input type="number" step="0.01" min="0" value={valorBruto} onChange={(e) => setValorBruto(e.target.value)} placeholder="189,90" style={inputStyle} />
                </Field>
                <Field label="Frete pago (R$)">
                  <input type="number" step="0.01" min="0" value={frete} onChange={(e) => setFrete(e.target.value)} placeholder="0,00" style={inputStyle} />
                </Field>
              </div>

              {valorBruto && (
                <div style={{ background: "#0d0d0d", border: "1px solid #1c1c1c", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444" }}>Lucro líquido desta venda</p>
                  <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: lucro >= 0 ? "#F5C400" : "#ef4444" }}>
                    {fmt(lucro)}
                  </p>
                </div>
              )}

              <Field label="Data">
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Descrição *">
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Compra de camisas no fornecedor" style={inputStyle} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Valor (R$) *">
                  <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" style={inputStyle} />
                </Field>
                <Field label="Data">
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                </Field>
              </div>

              <Field label="Categoria *">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORIAS_SAIDA.map((c) => (
                    <button key={c} type="button" onClick={() => setCategoria(c)} style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                      background: categoria === c ? "#ef4444" : "#1a1a1a",
                      color: categoria === c ? "#fff" : "#555",
                      border: `1px solid ${categoria === c ? "#ef4444" : "#252525"}`,
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {erro && <p style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>{erro}</p>}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer",
            background: accent, color: "#fff", opacity: loading ? 0.5 : 1,
          }}>
            {loading ? "Salvando..." : isVenda ? "Registrar Venda" : "Registrar Saída"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8, background: "#1a1a1a",
  border: "1px solid #252525", color: "#fff", fontSize: 13, outline: "none",
};

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  );
}
