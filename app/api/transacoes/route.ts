import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const mes = searchParams.get("mes");

  let rows;
  if (tipo && mes) {
    const [y, m] = mes.split("-").map(Number);
    const ini = new Date(y, m - 1, 1).toISOString();
    const fim = new Date(y, m, 1).toISOString();
    rows = await sql`SELECT * FROM transacoes WHERE tipo = ${tipo} AND data >= ${ini} AND data < ${fim} ORDER BY data DESC`;
  } else if (tipo) {
    rows = await sql`SELECT * FROM transacoes WHERE tipo = ${tipo} ORDER BY data DESC`;
  } else if (mes) {
    const [y, m] = mes.split("-").map(Number);
    const ini = new Date(y, m - 1, 1).toISOString();
    const fim = new Date(y, m, 1).toISOString();
    rows = await sql`SELECT * FROM transacoes WHERE data >= ${ini} AND data < ${fim} ORDER BY data DESC`;
  } else {
    rows = await sql`SELECT * FROM transacoes ORDER BY data DESC`;
  }

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { tipo, descricao, valor, categoria, data, comprador, email, telefone, modelo, tamanho, frete } = await req.json();

  if (!tipo || !descricao || !valor || !categoria) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  // Valida estoque antes de registrar venda
  if (tipo === "VENDA" && modelo && tamanho) {
    const estoque = await sql`
      SELECT quantidade FROM estoque WHERE modelo = ${modelo} AND tamanho = ${tamanho}
    `;
    if (estoque.length === 0 || estoque[0].quantidade <= 0) {
      return NextResponse.json(
        { error: `Sem estoque disponível para ${modelo} tamanho ${tamanho}.` },
        { status: 400 }
      );
    }
  }

  const id = crypto.randomUUID();
  const dataFinal = data ? new Date(data).toISOString() : new Date().toISOString();

  const rows = await sql`
    INSERT INTO transacoes (id, tipo, descricao, valor, categoria, data, "createdAt", comprador, email, telefone, modelo, tamanho, frete)
    VALUES (
      ${id}, ${tipo}, ${descricao}, ${parseFloat(valor)}, ${categoria}, ${dataFinal},
      ${new Date().toISOString()}, ${comprador ?? null}, ${email ?? null}, ${telefone ?? null},
      ${modelo ?? null}, ${tamanho ?? null}, ${parseFloat(frete) || 0}
    )
    RETURNING *
  `;

  // Desconta estoque
  if (tipo === "VENDA" && modelo && tamanho) {
    await sql`
      UPDATE estoque SET quantidade = quantidade - 1
      WHERE modelo = ${modelo} AND tamanho = ${tamanho}
    `;
  }

  return NextResponse.json(rows[0], { status: 201 });
}
