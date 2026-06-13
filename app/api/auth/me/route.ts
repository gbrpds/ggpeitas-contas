import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session.loggedIn) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  // Renova o cookie a cada chamada (reset dos 30 min de inatividade)
  await session.save();

  return NextResponse.json({ loggedIn: true, nome: session.nome });
}
