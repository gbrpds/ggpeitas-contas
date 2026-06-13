"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Erro ao entrar.");
        return;
      }
      router.replace("/");
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "#111", border: "1px solid #1c1c1c", color: "#fff",
    fontSize: 14, outline: "none", letterSpacing: "0.02em",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40, gap: 12 }}>
          <Image src="/logo.png" alt="GG Peitas" width={52} height={52} className="object-contain" />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: 4 }}>GG Peitas</p>
            <p style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.25em", color: "#F5C400", textTransform: "uppercase" }}>Financeiro</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ borderTop: "2px solid #008C3A" }} />
          <form onSubmit={handleSubmit} style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Usuário</p>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="seu usuário"
                autoComplete="username"
                required
                style={inp}
              />
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>Senha</p>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={inp}
              />
            </div>

            {erro && (
              <p style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "10px 14px", borderRadius: 8 }}>
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", marginTop: 4, borderRadius: 10,
                fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: "#008C3A", color: "#fff", opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#333", marginTop: 20, letterSpacing: "0.05em" }}>
          Acesso restrito · GG Peitas
        </p>
      </div>
    </div>
  );
}
