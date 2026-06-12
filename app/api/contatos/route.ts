import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT
      comprador,
      MAX(email) AS email,
      MAX(telefone) AS telefone,
      COUNT(*) AS total_compras,
      SUM(valor) AS total_gasto,
      MAX(data) AS ultima_compra,
      STRING_AGG(DISTINCT (modelo || ' ' || tamanho), ', ') AS modelos
    FROM transacoes
    WHERE tipo = 'VENDA' AND comprador IS NOT NULL
    GROUP BY comprador
    ORDER BY ultima_compra DESC
  `;
  return NextResponse.json(rows);
}

export async function PUT(req: NextRequest) {
  const { comprador, email, telefone } = await req.json();
  if (!comprador) return NextResponse.json({ error: "Comprador obrigatório" }, { status: 400 });

  await sql`
    UPDATE transacoes
    SET email = ${email ?? null}, telefone = ${telefone ?? null}
    WHERE comprador = ${comprador} AND tipo = 'VENDA'
  `;
  return NextResponse.json({ ok: true });
}
