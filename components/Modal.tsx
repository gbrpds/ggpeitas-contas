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

  // Campos venda
  const [comprador, setComprador] = useState("");
  const [modelo, setModelo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [valorBruto, setValorBruto] = useState("");
  const [frete, setFrete] = useState("");

  // Campos saída
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");

  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const lucroLiquido = isVenda
    ? (parseFloat(valorBruto) || 0) - (parseFloat(frete) || 0)
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (isVenda) {
      if (!comprador || !modelo || !tamanho || !valorBruto) {
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }
    } else {
      if (!descricao || !valor || !categoria) {
        setErro("Preencha todos os campos.");
        return;
      }
    }

    setLoading(true);
    try {
      const body = isVenda
        ? {
            tipo: "VENDA",
            descricao: `${modelo} ${tamanho} — ${comprador}`,
            valor: parseFloat(valorBruto),
            categoria: "Camiseta",
            data,
            comprador,
            modelo,
            tamanho,
            frete: parseFloat(frete) || 0,
          }
        : {
            tipo: "SAIDA",
            descricao,
            valor: parseFloat(valor),
            categoria,
            data,
            frete: 0,
          };

      const res = await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "#0d0d0d",
          border: "1px solid",
          borderColor: isVenda ? "#008C3A" : "#ef4444",
          boxShadow: isVenda
            ? "0 0 40px rgba(0,140,58,0.2)"
            : "0 0 40px rgba(239,68,68,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: isVenda
              ? "linear-gradient(135deg, rgba(0,140,58,0.2) 0%, rgba(0,140,58,0.05) 100%)"
              : "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.03) 100%)",
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-0.5">
              {isVenda ? "Nova Transação" : "Registrar Saída"}
            </p>
            <h2
              className="text-xl font-black tracking-widest uppercase"
              style={{ color: isVenda ? "#008C3A" : "#ef4444" }}
            >
              {isVenda ? "⚽ Venda de Camiseta" : "↓ Saída / Investimento"}
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
          {isVenda ? (
            <>
              <Field label="Nome do comprador *">
                <input
                  value={comprador}
                  onChange={(e) => setComprador(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="input-field"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Modelo da camisa *">
                  <select
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Selecione...</option>
                    {MODELOS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Tamanho *">
                  <div className="flex gap-2">
                    {TAMANHOS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTamanho(t)}
                        className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{
                          background: tamanho === t ? "#008C3A" : "#1a1a1a",
                          color: tamanho === t ? "#fff" : "#666",
                          border: "1px solid",
                          borderColor: tamanho === t ? "#008C3A" : "#2a2a2a",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor da venda (R$) *">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorBruto}
                    onChange={(e) => setValorBruto(e.target.value)}
                    placeholder="189,90"
                    className="input-field"
                  />
                </Field>
                <Field label="Frete pago por nós (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={frete}
                    onChange={(e) => setFrete(e.target.value)}
                    placeholder="0,00"
                    className="input-field"
                  />
                </Field>
              </div>

              {/* Preview lucro */}
              {valorBruto && (
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: "rgba(0,140,58,0.08)", border: "1px solid rgba(0,140,58,0.2)" }}
                >
                  <span className="text-xs uppercase tracking-wider text-gray-500">Lucro líquido desta venda</span>
                  <span
                    className="text-lg font-black font-mono"
                    style={{ color: lucroLiquido >= 0 ? "#4ade80" : "#f87171" }}
                  >
                    {lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              )}

              <Field label="Data">
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="input-field"
                  style={{ colorScheme: "dark" }}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Descrição *">
                <input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Compra de 10 camisas no fornecedor"
                  className="input-field"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$) *">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0,00"
                    className="input-field"
                  />
                </Field>
                <Field label="Data">
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="input-field"
                    style={{ colorScheme: "dark" }}
                  />
                </Field>
              </div>

              <Field label="Categoria *">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS_SAIDA.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategoria(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: categoria === c ? "#ef4444" : "#1a1a1a",
                        color: categoria === c ? "#fff" : "#666",
                        border: "1px solid",
                        borderColor: categoria === c ? "#ef4444" : "#2a2a2a",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {erro && (
            <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black tracking-widest uppercase text-sm transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: isVenda
                ? "linear-gradient(135deg, #009942, #008C3A)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
              boxShadow: isVenda
                ? "0 4px 20px rgba(0,140,58,0.3)"
                : "0 4px 20px rgba(239,68,68,0.3)",
            }}
          >
            {loading ? "Salvando..." : `Registrar ${isVenda ? "Venda" : "Saída"}`}
          </button>
        </form>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: #444;
        }
        .input-field::placeholder {
          color: #444;
        }
        select.input-field option {
          background: #1a1a1a;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
