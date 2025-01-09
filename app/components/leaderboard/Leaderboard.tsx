import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { TopPlayerCard } from './TopPlayerCard';
import { LeaderboardTable } from './LeaderboardTable';
import { processPlayerStats } from '@/utils/leaderboardUtils';
import { ELOS } from '@/lib/elos';
import { roles } from '@/lib/roles';
import localFont from 'next/font/local';
import Loading from '@/utils/Loading';

const koch = localFont({
  src: '../../../public/fonts/Koch Fraktur.ttf',
  weight: '100',
});

interface PlayerData {
  nick: string;
  role: string;
  points: number;
  damage?: number;
  heal?: number;
  maxDps?: number;
  maxPercentage?: number;
  playerData?: {
    icon: string;
    highestStats?: {
      roleWhithMorePoints?: { points: number; role: string };
      mostFrequentRole?: { role: string };
    };
  };
}

const Leaderboard = ({ dungeons }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [playersData, setPlayersData] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  const playersPerPage = 10;

  const getEloInfo = useCallback((points:any) => {
    const eloEntries = Object.entries(ELOS);

    const currentEloIndex = eloEntries.findIndex(([, { threshold }], index) => {
      const prevThreshold = index === 0 ? -Infinity : eloEntries[index - 1][1].threshold;
      const nextThreshold = index + 1 < eloEntries.length ? eloEntries[index + 1][1].threshold : Infinity;
      return points >= prevThreshold && points < nextThreshold;
    });

    const currentElo = currentEloIndex >= 0 ? eloEntries[currentEloIndex] : eloEntries[0];
    const nextElo = currentEloIndex + 1 < eloEntries.length ? eloEntries[currentEloIndex + 1][1] : null;
    const previousElo = currentEloIndex - 1 >= 0 ? eloEntries[currentEloIndex - 1][1] : null;

    const progress =
      nextElo && currentElo[1]
        ? Math.min(
            ((points - currentElo[1].threshold) / (nextElo.threshold - currentElo[1].threshold)) * 100,
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

  const getRoleIcon = useCallback((roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon || '/chiqueirinhologo.webp';
  }, []);

  const fetchPlayerDetails = useCallback(async (player: PlayerData) => {
    try {
      const { nick } = player;
      const playerIdResponse = await fetch(`/api/getUserId/${nick}`);
      const playerId = await playerIdResponse.json();

      const playerDataResponse = await fetch(`/api/getUserProfile/${playerId}`);
      const playerData = await playerDataResponse.json();

      return { ...player, playerData };
    } catch {
      return { ...player, playerData: { icon: '/chiqueirinhologo.webp' } };
    }
  }, []);

  const attachPicturesToPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const sortedPlayers = processPlayerStats(dungeons);
      const playerData = await Promise.all(sortedPlayers.map(fetchPlayerDetails as any));
      setPlayersData(playerData as any);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {loading ? (
        <div className="mx-auto">
          <Loading />
        </div>
      ) : (
        <div className="bg-gradient-to-br rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className={`${koch.className} font-koch text-6xl mt-3 flex justify-center mb-2`}>
              Chiqueirinho Avaloniano
            </h1>

            <h2 className="text-3xl flex justify-center font-bold text-white mb-8 items-center gap-3">
              <Trophy className="text-yellow-500" />
              Tabela de Pontos Totais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {topPlayers.map((player, index) => (
                <TopPlayerCard key={player.nick} rank={index + 1} player={player as any} />
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
      )}
    </div>
  );
};

export default Leaderboard;
