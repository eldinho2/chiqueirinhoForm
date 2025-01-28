import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, oldPoints, newPoints } = body;

    console.log(`User ${nickname} points updated from ${oldPoints} to ${newPoints}`);

    const user = await prisma.users.findUnique({
      where: {
        nickname: nickname.toString().toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.users.update({
      where: {
        nickname: user.nickname,
      },
      data: {
        oincPoints: newPoints,
      },
    });

    const updatedUser = await prisma.users.findUnique({
      where: {
        nickname: user.nickname,
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

    return NextResponse.json({ message: "Pontos atualizados com sucesso", user: updatedUser });
  } catch (error) {
    console.error(`Erro ao atualizar usuário: ${error}`);
    return NextResponse.json({ error: `Erro ao atualizar usuário: ${error}` }, { status: 500 });
  }
}
