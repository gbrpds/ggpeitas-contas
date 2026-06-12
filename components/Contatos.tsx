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
      {/* Header */}
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
        {/* Resumo */}
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

        {/* Busca */}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          style={{ width: "100%", padding: "11px 16px", borderRadius: 10, background: "#111", border: "1px solid #1c1c1c", color: "#fff", fontSize: 13, outline: "none" }}
        />

        {/* Lista */}
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
              <p style={{ fontSize: 12, color: "#2a2a2a", marginTop: 4 }}>Registre vendas com o nome do comprador.</p>
            </div>
          ) : (
            <div style={{ background: "#0d0d0d" }}>
              {lista.map((c, i) => (
                <div key={c.comprador} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  borderBottom: i < lista.length - 1 ? "1px solid #141414" : undefined,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "#1a1a1a", border: "1px solid #252525",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: "#F5C400",
                  }}>
                    {c.comprador.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
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

                  {/* Stats */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 900, fontFamily: "monospace", color: "#F5C400" }}>{fmt(c.total_gasto)}</p>
                    <p style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                      {c.total_compras} compra{Number(c.total_compras) !== 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{fmtData(c.ultima_compra)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
