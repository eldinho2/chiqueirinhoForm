import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function POST(request: Request) {
  try {
    const { role, eventId } = await request.json();
    
    await prisma.dungeons.update({
      where: { eventId: eventId },
      data: {
        roles: {
          set: [
            { MainTank: role[0].MainTank }
          ]
        }
      },
    });

    return NextResponse.json({ message: "Dungeon limpa com sucesso" });

  } catch (error) {
    console.error('Erro ao limpar dungeon:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar dungeon' },
      { status: 500 }
    );
  }
}
