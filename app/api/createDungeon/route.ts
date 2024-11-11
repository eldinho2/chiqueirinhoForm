import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function POST(request: Request) {
  try {
    const { name, creatorName, roles, eventId } = await request.json();

    
    const currentDate = new Date().toISOString();
    
    const dungeon = await prisma.dungeons.create({ 
      data: { 
        eventId,
        name, 
        creatorName, 
        date: currentDate,
        morList: [],
        roles
      } 
    });
    return NextResponse.json(dungeon);
  } catch (error) {
    console.error('Erro ao criar dungeon:', error);
    return NextResponse.json(
      { error: 'Erro ao criar dungeon' },
      { status: 500 }
    );
  }
}
