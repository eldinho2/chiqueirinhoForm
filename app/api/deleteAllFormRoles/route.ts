import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

export async function POST(request: Request) {
    const body = await request.json()
    const { eventId, roleData } = body

    console.log(body);

    const mainTank = roleData[0].MainTank

    console.log(mainTank);
    
    const dungeon = await prisma.dungeons.findUnique({
        where: { eventId: eventId }
    })

    if (!dungeon) {
        return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 })
    }

    const updatedDungeon = await prisma.dungeons.update({
        where: { eventId: eventId },
        data: {
            roles: {
                set: [
                    { MainTank: {...mainTank} }
                ]
            }
        }
    })

    return NextResponse.json({ message: "Roles limpos com sucesso, mantendo o MainTank", dungeon: updatedDungeon })      
}
