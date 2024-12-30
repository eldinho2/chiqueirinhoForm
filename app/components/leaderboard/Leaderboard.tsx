import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { TopPlayerCard } from './TopPlayerCard';
import { LeaderboardTable } from './LeaderboardTable';
import { processPlayerStats } from '@/utils/leaderboardUtils';
import { ELOS } from '@/lib/elos';
import { roles } from '@/lib/roles';

const Leaderboard = ({ dungeons }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [playersData, setPlayersData] = useState([]);
  const playersPerPage = 10;

  const getEloInfo = useCallback((points) => {
    const eloEntries = Object.entries(ELOS);
  
    const currentEloIndex = eloEntries.findIndex(([, { threshold }], index) => {
      const prevThreshold = index === 0 ? -Infinity : eloEntries[index - 1][1].threshold;
      const nextThreshold = index + 1 < eloEntries.length ? eloEntries[index + 1][1].threshold : Infinity;
      return points >= prevThreshold && points < nextThreshold; // Corrige a lógica de comparação.
    });
  
    const currentElo =
      currentEloIndex >= 0 ? eloEntries[currentEloIndex] : eloEntries[0];
  
    const nextElo =
      currentEloIndex + 1 < eloEntries.length
        ? eloEntries[currentEloIndex + 1][1]
        : null;
  
    const previousElo =
      currentEloIndex - 1 >= 0
        ? eloEntries[currentEloIndex - 1][1]
        : null;
  
    const progress =
      nextElo && currentElo[1]
        ? Math.min(
            ((points - currentElo[1].threshold) /
              (nextElo.threshold - currentElo[1].threshold)) *
              100,
            100
          )
        : 100;
  
    return {
      current: currentElo[1],
      next: nextElo,
      previous: previousElo,
      progress,
    };
  }, []);
  

  const getRoleIcon = useCallback((roleName) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon || '/chiqueirinhoLogo.webp';
  }, []);

  const fetchPlayerDetails = useCallback(async (player) => {
    try {
      const { nick } = player;
      const playerIdResponse = await fetch(`/api/getUserId/${nick}`);
      const playerId = await playerIdResponse.json();

      const playerDataResponse = await fetch(`/api/getUserProfile/${playerId}`);
      const playerData = await playerDataResponse.json();

      return { ...player, playerData };
    } catch {
      return { ...player, playerData: { icon: '/chiqueirinhoLogo.webp' } };
    }
  }, []);

  const attachPicturesToPlayers = useCallback(async () => {
    const sortedPlayers = processPlayerStats(dungeons);
    const playerData = await Promise.all(sortedPlayers.map(fetchPlayerDetails));
    setPlayersData(playerData);
  }, [dungeons, fetchPlayerDetails]);

  useEffect(() => {
    attachPicturesToPlayers();
  }, [attachPicturesToPlayers]);

  const { topPlayers, remainingPlayers, totalPages, currentPlayers } = useMemo(() => {
    const enhancedPlayers = playersData.map((player) => ({
      ...player,
      eloInfo: getEloInfo(player.playerData?.highestStats?.roleWhithMorePoints?.points || 0),
      roleIcon: getRoleIcon(player.playerData?.highestStats?.mostFrequentRole?.role || ''),
      highestRoleIcon: getRoleIcon(player.playerData?.highestStats?.roleWhithMorePoints?.role || ''),
    }));

    const topPlayers = enhancedPlayers.slice(0, 3);
    const remainingPlayers = enhancedPlayers.slice(3);
    const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);
    const currentPlayers = remainingPlayers.slice(
      (currentPage - 1) * playersPerPage,
      currentPage * playersPerPage
    );

    return { topPlayers, remainingPlayers, totalPages, currentPlayers };
  }, [playersData, getEloInfo, getRoleIcon, currentPage]);

  console.log(remainingPlayers);
  

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            Leaderboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {topPlayers.map((player, index) => (
              <TopPlayerCard key={player.nick} rank={index + 1} player={player} />
            ))}
          </div>

          <LeaderboardTable
            players={currentPlayers}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
