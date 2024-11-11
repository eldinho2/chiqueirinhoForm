import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

export async function POST(request: Request) {
    const body = await request.json();
    const { eventId, playerData } = body;

    const dungeon = await prisma.dungeons.findUnique({
        where: { eventId: eventId }
    });

    if (!dungeon) {
        return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    console.log('Player a ser removido:', playerData);
    console.log('Lista atual:', dungeon.morList);

    const updatedMorList = dungeon.morList.filter((player: any) => 
        !(player.nick === playerData.nick && 
          player.role === playerData.role && 
          player.ip === playerData.ip)
    );

    console.log('Lista após filtro:', updatedMorList);

    const updatedDungeon = await prisma.dungeons.update({
        where: { eventId: eventId },
        data: {
            morList: updatedMorList as any[]
        }
    });

    return NextResponse.json({ message: "Player removido com sucesso", dungeon: updatedDungeon });
}
