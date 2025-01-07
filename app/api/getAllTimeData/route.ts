import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET() {
  try {
      const allDungeons = await prisma.dungeonsHistory.findMany();

      return NextResponse.json(allDungeons);
  } catch (error) {
    console.error("Erro ao buscar dungeons:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        error: "Erro ao buscar jogador",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
