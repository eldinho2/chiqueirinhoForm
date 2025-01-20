export const processPlayerStats = (dungeons: any[]) => {
  if (!dungeons || !Array.isArray(dungeons)) {
    return [];
  }

  const playerStats = dungeons.reduce((acc: { [key: string]: any }, dungeon) => {
    dungeon.players.forEach((player: any) => {
      const key = player.nick.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          nick: player.nick,
          totalPoints: 0,
          roleDamage: {},
        };
      }
      
      acc[key].totalPoints += player.points;

      if (!acc[key].roleDamage[player.role]) {
        acc[key].roleDamage[player.role] = 0;
      }
      acc[key].roleDamage[player.role] += player.damage;
    });
    return acc;
  }, {});

  return Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);
};