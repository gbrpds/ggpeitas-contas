import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql(`DELETE FROM transacoes WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
