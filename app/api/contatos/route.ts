import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  // Retorna um contato por comprador, com o histórico de compras agregado
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
