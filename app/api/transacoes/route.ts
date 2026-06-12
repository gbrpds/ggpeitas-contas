import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const mes = searchParams.get("mes");

  let query = "SELECT * FROM transacoes";
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (tipo) {
    params.push(tipo);
    conditions.push(`tipo = $${params.length}`);
  }
  if (mes) {
    const [year, month] = mes.split("-").map(Number);
    params.push(new Date(year, month - 1, 1).toISOString());
    conditions.push(`data >= $${params.length}`);
    params.push(new Date(year, month, 1).toISOString());
    conditions.push(`data < $${params.length}`);
  }

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY data DESC";

  const rows = await sql(query, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { tipo, descricao, valor, categoria, data } = await req.json();

  if (!tipo || !descricao || !valor || !categoria) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const dataFinal = data ? new Date(data).toISOString() : new Date().toISOString();

  const rows = await sql(
    `INSERT INTO transacoes (id, tipo, descricao, valor, categoria, data, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, tipo, descricao, parseFloat(valor), categoria, dataFinal, new Date().toISOString()]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
