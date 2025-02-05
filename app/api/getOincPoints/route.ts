import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      where: {
        oincPoints: {
          gte: 1,
        },
      },
      select: {
        id: false,
        userID: false,
        username: true,
        email: false,
        nickname: true,
        oincPoints: true,
        image: true,
        banner: false,
        role: false,
        createdAt: false,
        updatedAt: false,
      },
    });
    
    

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar oincpoints:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        error: "Erro ao buscar oincpoints",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
