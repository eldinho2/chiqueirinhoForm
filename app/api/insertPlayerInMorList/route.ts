import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

export async function POST(request: Request) {
    const body = await request.json()
    const { eventId, playerData } = body

    console.log(body);

    const dungeon = await prisma.dungeons.findUnique({
        where: { eventId: eventId }
    })

    if (!dungeon) {
        return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }



    const updatedDungeon = await prisma.dungeons.update({
        where: { eventId: eventId },
        data: {
            morList: {
                push: [playerData]
            }
       }
    })

    return NextResponse.json({ message: "Role inserida com sucesso", dungeon: updatedDungeon })
}