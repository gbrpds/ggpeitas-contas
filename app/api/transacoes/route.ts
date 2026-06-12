import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const mes = searchParams.get("mes");

  let rows;

  if (tipo && mes) {
    const [year, month] = mes.split("-").map(Number);
    const ini = new Date(year, month - 1, 1).toISOString();
    const fim = new Date(year, month, 1).toISOString();
    rows = await sql`SELECT * FROM transacoes WHERE tipo = ${tipo} AND data >= ${ini} AND data < ${fim} ORDER BY data DESC`;
  } else if (tipo) {
    rows = await sql`SELECT * FROM transacoes WHERE tipo = ${tipo} ORDER BY data DESC`;
  } else if (mes) {
    const [year, month] = mes.split("-").map(Number);
    const ini = new Date(year, month - 1, 1).toISOString();
    const fim = new Date(year, month, 1).toISOString();
    rows = await sql`SELECT * FROM transacoes WHERE data >= ${ini} AND data < ${fim} ORDER BY data DESC`;
  } else {
    rows = await sql`SELECT * FROM transacoes ORDER BY data DESC`;
  }

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { tipo, descricao, valor, categoria, data, comprador, modelo, tamanho, frete } = await req.json();

  if (!tipo || !descricao || !valor || !categoria) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const dataFinal = data ? new Date(data).toISOString() : new Date().toISOString();
  const freteVal = parseFloat(frete ?? 0);
  const valorVal = parseFloat(valor);

  const rows = await sql`
    INSERT INTO transacoes (id, tipo, descricao, valor, categoria, data, "createdAt", comprador, modelo, tamanho, frete)
    VALUES (${id}, ${tipo}, ${descricao}, ${valorVal}, ${categoria}, ${dataFinal}, ${new Date().toISOString()}, ${comprador ?? null}, ${modelo ?? null}, ${tamanho ?? null}, ${freteVal})
    RETURNING *
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
