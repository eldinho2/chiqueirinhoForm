import { NextResponse } from "next/server"
import prisma from "@/services/prisma";
import { Prisma } from '@prisma/client';

interface MorPlayer {
    nick: string;
    role: string;
    ip: string;
}

export async function POST(request: Request) {
    const body = await request.json();
    const { eventId, playerData } = body;

    const dungeon = await prisma.dungeons.findUnique({
        where: { eventId: eventId }
    });

    if (!dungeon) {
        return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const updatedMorList = (dungeon.morList as unknown as MorPlayer[]).filter((player: MorPlayer) => 
        !(player.nick === playerData.nick && 
          player.role === playerData.role && 
          player.ip === playerData.ip)
    );

    const updatedDungeon = await prisma.dungeons.update({
        where: { eventId: eventId },
        data: {
            morList: updatedMorList as unknown as Prisma.InputJsonValue[]
        }
    });

    return NextResponse.json({ message: "Player removido com sucesso", dungeon: updatedDungeon });
}
