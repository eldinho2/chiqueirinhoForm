import { NextResponse } from "next/server"
import prisma from "@/services/prisma";

interface PlayerData {
  nick: string;
  ip: string;
  newNick: string;
  newRole: string;
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
  roles: Role[];
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

  const updatedRoles = dungeon.roles.map(role => {
    const roleKey = Object.keys(role)[0];
    if (role[roleKey].nick === playerData.nick && role[roleKey].ip === playerData.ip) {
      return { [playerData.newRole]: { ...role[roleKey], nick: playerData.newNick } };
    }
    return role;
  });

  await prisma.dungeons.update({
    where: { eventId: eventId },
    data: { roles: updatedRoles }
  });

  return NextResponse.json({ message: "Jogador e role atualizados com sucesso" }, { status: 200 });
}
