import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId }: { eventId: string} = body;

  console.log("Recebendo dados:", { eventId });

  if (!eventId) {
    console.error("Dados ausentes ou inválidos:", { eventId });
    return NextResponse.json(
      { message: "Dados inválidos: 'eventId' ausente ou incorreto." },
      { status: 400 }
    );
  }

  const dungeon: any | null = await prisma.dungeonsHistory.findUnique({
    where: { eventId: eventId }
  });

  if (!dungeon) {
    return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 })
  }

  await prisma.dungeonsHistory.delete({
    where: { eventId: eventId }
  });
  
  

  return NextResponse.json({ message: "Jogador e role removidos com sucesso" }, { status: 200 });
}