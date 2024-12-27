import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

export async function POST(request: Request) {
    const body = await request.json()
    console.log(body);
    


    const updatedDungeon = await prisma.dungeonsHistory.create({
        data: {
            eventId: body.eventId,
            dungeon: body.dungeon,
            players: body.players
        }
    })

    return NextResponse.json({ message: "Historico inserida com sucesso", history: updatedDungeon })
}