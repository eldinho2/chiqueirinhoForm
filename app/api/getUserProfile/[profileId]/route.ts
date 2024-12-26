import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.pathname.split('/').pop() || ''

    console.log('Profile ID:', profileId);

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { userID: profileId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(user);
    

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar jogador:", error);
    return NextResponse.json({ error: "Erro ao buscar jogador" }, { status: 500 });
  }
}