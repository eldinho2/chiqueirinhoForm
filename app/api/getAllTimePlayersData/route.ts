import { NextResponse } from "next/server"
import prisma from "@/services/prisma"
import { generateHash } from "@/utils/generateHash"
import { processPlayerStats } from "@/utils/leaderboardUtils"
import { calculateHighestStats } from "@/utils/calculateMaxStats"
import { ELOS } from "@/lib/elos"
import { roles } from "@/lib/roles"

let cachedData: any = null
let cachedHash: string | null = null

const getEloInfo = (points: number) => {
  const eloEntries = Object.entries(ELOS)

  const currentEloIndex = eloEntries.findIndex(([, { threshold }], index) => {
    const prevThreshold = index === 0 ? Number.NEGATIVE_INFINITY : eloEntries[index - 1][1].threshold
    const nextThreshold = index + 1 < eloEntries.length ? eloEntries[index + 1][1].threshold : Number.POSITIVE_INFINITY
    return points >= prevThreshold && points < nextThreshold
  })

  const currentElo = currentEloIndex >= 0 ? eloEntries[currentEloIndex] : eloEntries[0]
  const nextElo = currentEloIndex + 1 < eloEntries.length ? eloEntries[currentEloIndex + 1][1] : null

  const progress =
    nextElo && currentElo[1]
      ? Math.min(((points - currentElo[1].threshold) / (nextElo.threshold - currentElo[1].threshold)) * 100, 100)
      : 100

  return {
    previous: currentEloIndex > 0 ? eloEntries[currentEloIndex - 1][1] : null,
    current: currentElo[1],
    next: nextElo,
    progress,
  }
}

const getRoleIcon = (roleName: string) => {
  const role = roles.find((r) => r.value === roleName)
  return role?.icon || "/chiqueirinhologo.webp"
}

export async function GET() {
  try {
    const allDungeons = await prisma.dungeonsHistory.findMany()
    const newHash = generateHash(allDungeons)

    if (newHash === cachedHash && cachedData) {
      return NextResponse.json({ data: cachedData, hash: cachedHash })
    }

    const sortedPlayers = processPlayerStats(allDungeons)

    const enhancedPlayers = await Promise.all(
      sortedPlayers.map(async (player) => {
        const user = await prisma.users.findUnique({
          where: { nickname: player.nick.toLowerCase() },
          select: {
            id: true,
            userID: true,
            username: true,
            nickname: true,
            oincPoints: true,
            image: true,
            banner: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        if (!user) {
          return null
        }

        const participacoes = allDungeons.filter((dungeon: any) =>
          dungeon.players.some((p: any) => p.nick.toLowerCase() === player.nick.toLowerCase()),
        )

        const dungeonHistory = participacoes.slice(0, 15).map((dungeon: any) => ({
          date: dungeon.createdAt,
          ...dungeon.players.find((p: any) => p.nick.toLowerCase() === player.nick.toLowerCase())!,
        }))

        const highestStats = calculateHighestStats(
          participacoes.flatMap((dungeon: any) =>
            dungeon.players.filter((p: any) => p.nick.toLowerCase() === player.nick.toLowerCase()),
          ),
        )

        return {
          ...player,
          playerData: {
            user,
            highestStats,
            lastFiveDungeons: dungeonHistory,
          },
          eloInfo: getEloInfo(highestStats.roleWhithMorePoints?.points || 0),
          roleIcon: getRoleIcon(highestStats.mostFrequentRole || ""),
          highestRoleIcon: getRoleIcon(highestStats.roleWhithMorePoints?.role || ""),
        }
      }),
    )

    const filteredEnhancedPlayers = enhancedPlayers.filter(Boolean)

    cachedData = filteredEnhancedPlayers
    cachedHash = newHash

    return NextResponse.json({ data: filteredEnhancedPlayers, hash: newHash })
  } catch (error) {
    console.error("Erro ao buscar dados dos jogadores:", error instanceof Error ? error.message : error)

    return NextResponse.json(
      {
        error: "Erro ao buscar dados dos jogadores",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

