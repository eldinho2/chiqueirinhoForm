import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId
    const getDungeons = await prisma.dungeons.findMany({  
      where: {
        eventId: eventId
      }
    })
    return NextResponse.json(getDungeons)
  } catch (error) {
    console.error("Erro ao buscar dungeons:", error);
    return NextResponse.json({ error: "Erro ao buscar dungeons" }, { status: 500 });
  }
}