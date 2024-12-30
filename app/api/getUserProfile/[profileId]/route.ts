import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";
import { NextRequest } from 'next/server';
import { calculateHighestStats } from "@/utils/calculateMaxStats";

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.pathname.split('/').pop() || '';

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { userID: profileId },
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
        return player.nick.toLowerCase() === user.name.toLowerCase();
      });

      players.forEach(player => {
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
    
    const lastFiveDungeons = dungeonHistory.slice(0, 5);
    
    const highestStats = calculateHighestStats(participacoes);

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
