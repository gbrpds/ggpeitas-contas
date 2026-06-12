"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES: Record<string, string> = {
  "/": "Financeiro",
  "/estoque": "Estoque",
  "/contatos": "Contatos",
};

interface Props {
  onVenda?: () => void;
  onSaida?: () => void;
  onEntrada?: () => void;
}

export default function Header({ onVenda, onSaida, onEntrada }: Props) {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const titulo = PAGES[pathname] ?? "GG Peitas";

  return (
    <header className="header-root">
      <div className="header-inner page-container">
        {/* Logo + título */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Image src="/logo.png" alt="GG Peitas" width={34} height={34} className="object-contain" />
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>GG Peitas</p>
            <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", color: "#F5C400", textTransform: "uppercase", lineHeight: 1 }}>{titulo}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="header-nav">
          {/* Menu dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="btn-nav"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              ☰ <span className="hide-mobile">Menu</span>
            </button>

            {menuAberto && (
              <>
                <div onClick={() => setMenuAberto(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 20,
                  background: "#161616", border: "1px solid #252525", borderRadius: 12,
                  padding: 6, minWidth: 170, display: "flex", flexDirection: "column", gap: 2,
                }}>
                  {Object.entries(PAGES).map(([href, label]) => {
                    const active = pathname === href;
                    return (
                      <Link key={href} href={href} onClick={() => setMenuAberto(false)} style={{
                        padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        color: active ? "#F5C400" : "#ccc", textDecoration: "none", display: "block",
                        letterSpacing: "0.05em", background: active ? "rgba(245,196,0,0.07)" : "transparent",
                      }}>
                        {label === "Financeiro" ? "💰" : label === "Estoque" ? "👕" : "👥"} {label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Botões contextuais por página */}
          {onSaida && (
            <button onClick={onSaida} className="btn-danger">− Saída</button>
          )}
          {onVenda && (
            <button onClick={onVenda} className="btn-primary">+ Venda</button>
          )}
          {onEntrada && (
            <button onClick={onEntrada} className="btn-primary">+ Entrada</button>
          )}
        </div>
      </div>
    </header>
  );
}
