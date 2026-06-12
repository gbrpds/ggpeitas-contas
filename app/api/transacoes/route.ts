import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const mes = searchParams.get("mes"); // YYYY-MM

  const where: Record<string, unknown> = {};
  if (tipo) where.tipo = tipo;
  if (mes) {
    const [year, month] = mes.split("-").map(Number);
    where.data = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  const transacoes = await prisma.transacao.findMany({
    where,
    orderBy: { data: "desc" },
  });

  return NextResponse.json(transacoes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, descricao, valor, categoria, data } = body;

  if (!tipo || !descricao || !valor || !categoria) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const transacao = await prisma.transacao.create({
    data: {
      tipo,
      descricao,
      valor: parseFloat(valor),
      categoria,
      data: data ? new Date(data) : new Date(),
    },
  });

  return NextResponse.json(transacao, { status: 201 });
}
