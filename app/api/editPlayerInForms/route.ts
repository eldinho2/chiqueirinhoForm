import { NextResponse } from "next/server";
import prisma from "@/services/prisma";

type JsonValue = string | number | boolean | { [key: string]: JsonValue } | JsonValue[];

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
  roles: JsonValue[];
}

function isValidRoleArray(data: JsonValue[]): data is Role[] {
  return data.every(item => typeof item === "object" && item !== null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, playerData }: { eventId: string; playerData: PlayerData } = body;

  const dungeon: Dungeon | any = await prisma.dungeons.findUnique({
    where: { eventId: eventId }
  });

  if (!dungeon) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  if (!isValidRoleArray(dungeon.roles)) {
    return NextResponse.json({ error: "Formato inválido em roles" }, { status: 500 });
  }

  const updatedRoles = dungeon.roles.map((role: { [x: string]: any; }) => {
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
