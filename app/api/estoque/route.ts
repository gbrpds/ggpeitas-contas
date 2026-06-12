import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT * FROM estoque ORDER BY modelo ASC, tamanho ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { modelo, tamanho, quantidade, preco_custo } = await req.json();

  if (!modelo || !tamanho || quantidade == null) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  // Se já existe esse modelo+tamanho, incrementa a quantidade
  const existing = await sql`
    SELECT id, quantidade FROM estoque WHERE modelo = ${modelo} AND tamanho = ${tamanho}
  `;

  if (existing.length > 0) {
    const rows = await sql`
      UPDATE estoque
      SET quantidade = quantidade + ${parseInt(quantidade)},
          preco_custo = ${parseFloat(preco_custo) || 0}
      WHERE modelo = ${modelo} AND tamanho = ${tamanho}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  }

  const rows = await sql`
    INSERT INTO estoque (id, modelo, tamanho, quantidade, preco_custo)
    VALUES (${id}, ${modelo}, ${tamanho}, ${parseInt(quantidade)}, ${parseFloat(preco_custo) || 0})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
