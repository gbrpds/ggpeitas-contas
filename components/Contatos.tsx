"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Contato {
  comprador: string;
  email: string | null;
  telefone: string | null;
  total_compras: number;
  total_gasto: number;
  ultima_compra: string;
  modelos: string | null;
}

function fmt(val: number) {
  return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function Contatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Contato | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/contatos");
    setContatos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const lista = busca
    ? contatos.filter(c =>
        c.comprador.toLowerCase().includes(busca.toLowerCase()) ||
        c.email?.toLowerCase().includes(busca.toLowerCase()) ||
        c.telefone?.includes(busca)
      )
    : contatos;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <header style={{ borderBottom: "1px solid #1c1c1c", background: "#0a0a0a" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="GG Peitas" width={36} height={36} className="object-contain" />
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>GG Peitas</p>
              <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.2em", color: "#F5C400", textTransform: "uppercase", lineHeight: 1 }}>Contatos</p>
            </div>
          </div>
          <Link href="/" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", border: "1px solid #222", background: "transparent", textDecoration: "none" }}>
            ← Financeiro
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Clientes</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#F5C400", lineHeight: 1 }}>{contatos.length}</p>
            <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>compradores únicos</p>
          </div>
          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Com contato</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#008C3A", lineHeight: 1 }}>
              {contatos.filter(c => c.email || c.telefone).length}
            </p>
            <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>têm email ou telefone</p>
          </div>
        </div>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          style={{ width: "100%", padding: "11px 16px", borderRadius: 10, background: "#111", border: "1px solid #1c1c1c", color: "#fff", fontSize: 13, outline: "none" }}
        />

        <div style={{ border: "1px solid #1c1c1c", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "#111", borderBottom: "1px solid #1c1c1c", padding: "10px 18px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
              {lista.length} contato{lista.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#0d0d0d" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
            </div>
          ) : lista.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#0d0d0d" }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>👥</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>
                {busca ? "Nenhum resultado." : "Nenhum contato ainda."}
              </p>
            </div>
          ) : (
            <div style={{ background: "#0d0d0d" }}>
              {lista.map((c, i) => (
                <div key={c.comprador} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  borderBottom: i < lista.length - 1 ? "1px solid #141414" : undefined,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "#1a1a1a", border: "1px solid #252525",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: "#F5C400",
                  }}>
                    {c.comprador.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.comprador}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                      {c.telefone && (
                        <a href={`tel:${c.telefone}`} style={{ fontSize: 12, color: "#008C3A", textDecoration: "none" }}>
                          📞 {c.telefone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>
                          ✉ {c.email}
                        </a>
                      )}
                      {!c.telefone && !c.email && (
                        <span style={{ fontSize: 11, color: "#333" }}>sem contato cadastrado</span>
                      )}
                    </div>
                    {c.modelos && (
                      <p style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{c.modelos}</p>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, marginRight: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 900, fontFamily: "monospace", color: "#F5C400" }}>{fmt(c.total_gasto)}</p>
                    <p style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                      {c.total_compras} compra{Number(c.total_compras) !== 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{fmtData(c.ultima_compra)}</p>
                  </div>

                  <button
                    onClick={() => setEditando(c)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #252525", background: "#1a1a1a", color: "#555", cursor: "pointer", fontSize: 13, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F5C400")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                    title="Editar contato"
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {editando && (
        <ModalEditar
          contato={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
    </div>
  );
}

function ModalEditar({ contato, onClose, onSalvo }: { contato: Contato; onClose: () => void; onSalvo: () => void }) {
  const [email, setEmail] = useState(contato.email ?? "");
  const [telefone, setTelefone] = useState(contato.telefone ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contatos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprador: contato.comprador, email: email || null, telefone: telefone || null }),
      });
      if (!res.ok) throw new Error();
      onSalvo();
    } catch {
      setErro("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#1a1a1a", border: "1px solid #252525", color: "#fff", fontSize: 13, outline: "none",
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#111", border: "1px solid #222", borderTop: "2px solid #F5C400", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1c1c1c", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>Editar Contato</p>
            <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F5C400", margin: 0 }}>
              {contato.comprador}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Telefone</p>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>E-mail</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" style={inputStyle} />
          </div>

          {erro && <p style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>{erro}</p>}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", background: "#F5C400", color: "#000", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
