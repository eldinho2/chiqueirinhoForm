import { NextRequest } from 'next/server';
import prisma from "@/services/prisma";

export async function GET(
  request: NextRequest,
) {
  try {
    const eventId = request.nextUrl.pathname.split('/').pop() || ''

    const getDungeons = await prisma.dungeons.findMany({
      where: {
        eventId: eventId.toString()
      }
    })
    
    return Response.json(getDungeons)
  } catch (error) {
    return Response.json({ error: `Erro ao buscar dungeons: ${error}` }, { status: 500 })
  }
}