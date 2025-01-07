import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

interface PlayerData {
  nick: string;
  ip: string;
}

interface Role {
  [key: string]: {
    nick?: string;
    ip?: string;
    [key: string]: any;
  };
}

interface Dungeon {
  eventId: string;
  name: string | null;
  id: string;
  creatorName: string;
  date: Date;
  morList: any[];
  roles: any[];
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, playerData }: { eventId: string; playerData: PlayerData } = body;

  const dungeon: Dungeon | null = await prisma.dungeons.findUnique({
    where: { eventId: eventId }
  });

  if (!dungeon) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  const updatedRoles = dungeon.roles.filter(role => {
    const roleKey = Object.keys(role)[0];
    return !(role[roleKey].nick === playerData.nick && role[roleKey].ip === playerData.ip);
  });

  await prisma.dungeons.update({
    where: { eventId: eventId },
    data: { roles: updatedRoles }
  });

  return NextResponse.json({ message: "Jogador e role removidos com sucesso" }, { status: 200 });
}