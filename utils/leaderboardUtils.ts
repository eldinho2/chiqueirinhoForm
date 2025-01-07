export const processPlayerStats = (dungeons: any) => {
  if (!dungeons || !Array.isArray(dungeons)) {
    return [];
  }

  const playerStats = dungeons.reduce((acc: { [key: string]: any}, dungeon) => {
    dungeon.players.forEach((player: any) => {
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