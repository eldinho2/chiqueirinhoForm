import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET() {
  try {
    const getDungeons = await prisma.dungeons.findMany();
    return NextResponse.json(getDungeons);
  } catch (error) {
    console.error("Erro ao buscar dungeons:", error);
    return NextResponse.json({ error: "Erro ao buscar dungeons" }, { status: 500 });
  }
}