import { Player, DungeonData } from '../types/leaderboard';

export interface PlayerStats extends Player {
  totalPoints: number;
}

export const processPlayerStats = (dungeons: DungeonData[] | undefined): PlayerStats[] => {
  if (!dungeons || !Array.isArray(dungeons)) {
    return [];
  }

  const playerStats = dungeons.reduce((acc: { [key: string]: PlayerStats }, dungeon) => {
    dungeon.players.forEach((player) => {
      const key = player.nick.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          ...player,
          totalPoints: player.points
        };
      } else {
        acc[key].totalPoints += player.points;
      }
    });
    return acc;
  }, {});

  return Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);
};