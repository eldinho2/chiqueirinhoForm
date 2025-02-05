import prisma from "@/services/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { id } = await request.json();
    const deleteDungeon = await prisma.dungeons.delete({ where: { id } });
    return NextResponse.json(deleteDungeon);
}
  