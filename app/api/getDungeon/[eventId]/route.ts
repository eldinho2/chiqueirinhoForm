import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/services/prisma";

interface RouteParams {
  eventId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const eventId = parseInt(params.eventId)
    
    const getDungeons = await prisma.dungeons.findMany({
      where: {
        eventId: eventId.toString()
      }
    })
    
    return NextResponse.json(getDungeons)
  } catch (error) {
    return NextResponse.json({ error: `Erro ao buscar dungeons: ${error}` }, { status: 500 })
  }
}