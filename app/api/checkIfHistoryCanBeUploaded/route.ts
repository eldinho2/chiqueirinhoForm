import { NextResponse } from "next/server";
import prisma from "@/services/prisma";

export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);

    const checkIfHistoryCanBeUploaded = await prisma.dungeonsHistory.findUnique({
        where: {
            eventId: body.eventId
        }
    });

    if (checkIfHistoryCanBeUploaded) {
        return NextResponse.json({ cadastrada: true, message: "Dungeon já cadastrada" });
    }

    return NextResponse.json({ cadastrada: false, message: "Dungeon pode ser cadastrada" });
}