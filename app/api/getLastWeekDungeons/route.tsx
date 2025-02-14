import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET() {
  try {
    const getDungeons = await prisma.dungeonsHistory.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });
    return NextResponse.json(getDungeons);
  } catch (error) {
    console.error("Erro ao buscar historico dungeons:", error);
    return NextResponse.json({ error: "Erro ao buscar historico dungeons" }, { status: 500 });
  }
}