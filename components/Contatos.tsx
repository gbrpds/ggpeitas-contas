"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "./Header";

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
        c.telefone?.includes(busca))
    : contatos;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <Header />

      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="summary-grid-2">
          <div className="summary-card">
            <p>Clientes</p>
            <p className="summary-value" style={{ fontSize: 32, color: "#F5C400" }}>{contatos.length}</p>
            <p className="summary-sub">compradores únicos</p>
          </div>
          <div className="summary-card">
            <p>Com contato</p>
            <p className="summary-value" style={{ fontSize: 32, color: "#008C3A" }}>
              {contatos.filter(c => c.email || c.telefone).length}
            </p>
            <p className="summary-sub">têm email ou telefone</p>
          </div>
        </div>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          style={{ width: "100%", padding: "11px 16px", borderRadius: 10, background: "#111", border: "1px solid #1c1c1c", color: "#fff", fontSize: 13, outline: "none" }}
        />

        <div className="table-container">
          <div className="table-header">
            <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>
              {lista.length} contato{lista.length !== 1 ? "s" : ""}
            </p>
          </div>
          {loading ? (
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Carregando...</p>
            </div>
          ) : lista.length === 0 ? (
            <div className="table-body" style={{ padding: "50px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>👥</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>
                {busca ? "Nenhum resultado." : "Nenhum contato ainda."}
              </p>
            </div>
          ) : (
            <div className="table-body">
              {lista.map((c, i) => (
                <div key={c.comprador} className="table-row" style={{ alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "#1a1a1a", border: "1px solid #252525",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: "#F5C400",
                  }}>
                    {c.comprador.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.comprador}</p>
                    <div className="contact-meta">
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
                        <span style={{ fontSize: 11, color: "#333" }}>sem contato</span>
                      )}
                    </div>
                    {c.modelos && (
                      <p className="hide-mobile" style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{c.modelos}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="contact-stats" style={{ textAlign: "right", flexShrink: 0, marginRight: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 900, fontFamily: "monospace", color: "#F5C400" }}>{fmt(c.total_gasto)}</p>
                    <p style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{c.total_compras} compra{Number(c.total_compras) !== 1 ? "s" : ""}</p>
                    <p style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{fmtData(c.ultima_compra)}</p>
                  </div>

                  {/* Editar */}
                  <button onClick={() => setEditando(c)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #252525", background: "#1a1a1a", color: "#555", cursor: "pointer", fontSize: 13, flexShrink: 0, alignSelf: "center" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F5C400")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                    title="Editar contato">
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

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#1a1a1a", border: "1px solid #252525", color: "#fff", fontSize: 13, outline: "none",
  };

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

  return (
    <div className="modal-centered" onClick={onClose}>
      <div className="modal-box" style={{ borderTop: "2px solid #F5C400" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1c1c1c", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>Editar Contato</p>
            <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F5C400", margin: 0 }}>{contato.comprador}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Telefone</p>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inp} />
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>E-mail</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" style={inp} />
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
