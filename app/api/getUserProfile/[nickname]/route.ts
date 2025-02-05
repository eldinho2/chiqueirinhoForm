import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";
import { NextRequest } from 'next/server';
import { calculateHighestStats } from "@/utils/calculateMaxStats";

type Player = {
  nick: string;
  role?: string;
  points?: number;
  damage?: number;
  heal?: number;
  maxDps?: number;
  maxPercentage?: number;
};

function isValidPlayer(player: any): player is Player {
  return (
    typeof player === "object" &&
    player !== null &&
    typeof player.nick === "string"
  );
}

const cache = new Map()

export async function GET(request: NextRequest) {
  try {
    const nickname = request.nextUrl.pathname.split('/').pop()?.toLowerCase() || '';
    const hash = request.nextUrl.searchParams.get("hash")

    if (!nickname) {
      return NextResponse.json({ error: "nickname is required" }, { status: 400 });
    }

    const cacheKey = `${nickname}-${hash}`

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey))
    }

    const user = await prisma.users.findUnique({
      where: { nickname },
      select: { id: true, userID: true, username: true, email: false, nickname: true, oincPoints: true, image: true, banner: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allDungeons = await prisma.dungeonsHistory.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const participacoes: any[] = [];
    const dungeonHistory: any[] = [];

    allDungeons.forEach(dungeon => {
      const players = dungeon.players.filter((player: any) => {
        if (!isValidPlayer(player)) return false;
        return player.nick.toLowerCase() === user.nickname.toLowerCase();
      });

      players.forEach(player => {
        if (!isValidPlayer(player)) return;

        participacoes.push({
          nick: player.nick,
          role: player.role,
          points: player.points,
          damage: player.damage,
          heal: player.heal,
          maxDps: player.maxDps,
          maxPercentage: player.maxPercentage
        });

        dungeonHistory.push({
          date: dungeon.createdAt,
          nick: player.nick,
          role: player.role,
          points: player.points,
          damage: player.damage,
          heal: player.heal,
          maxPercentage: player.maxPercentage,
          maxDps: player.maxDps,
        });
      });
    });

    const lastFiveDungeons = dungeonHistory.slice(0, 15);

    const highestStats = calculateHighestStats(participacoes);
    const userData = { user, highestStats, lastFiveDungeons: dungeonHistory }

    cache.set(cacheKey, userData)

    return NextResponse.json({ user, highestStats, lastFiveDungeons });
  } catch (error) {
    console.error("Erro ao buscar jogador:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        error: "Erro ao buscar jogador",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
