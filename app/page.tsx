'use client'

import { useEffect, useState, useCallback, useMemo } from 'react';
import localFont from 'next/font/local';
import Header from './components/Header';
import Leaderboard from "@/app/components/leaderboard/Leaderboard";
import RoleLeaderboard from "@/app/components/leaderboard/RoleLeaderboard";
import HighestEloLeaderboard from "@/app/components/leaderboard/HighestEloLeaderboard";
import Loading from '@/utils/Loading';
import { processPlayerStats } from '@/utils/leaderboardUtils';
import { ELOS } from '@/lib/elos';
import { roles } from '@/lib/roles';
import { Button } from "@/components/ui/button"

const koch = localFont({
  src: '../public/fonts/Koch Fraktur.ttf',
  weight: '100',
});

export default function Home() {
  const [weekData, setWeekData] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState('total'); // 'total' or 'role'

  const getEloInfo = useCallback((points: number) => {
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

  const fetchPlayerDetails = useCallback(async (player: any) => {
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

  const attachPicturesToPlayers = useCallback(async (dungeons: any) => {
    try {
      const sortedPlayers = processPlayerStats(dungeons);
      const playerData = await Promise.all(sortedPlayers.map(fetchPlayerDetails));
      return playerData;
    } catch (error) {
      console.error("Error attaching pictures to players:", error);
      return [];
    }
  }, [fetchPlayerDetails]);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        const response = await fetch('/api/getAllTimeData');
        const data = await response.json();
        setWeekData(data);
        const playersWithPictures = await attachPicturesToPlayers(data);
        setPlayersData(playersWithPictures as any);
      } catch (error) {
        console.error("Error fetching week data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekData();
  }, [attachPicturesToPlayers]);

  const enhancedPlayers = useMemo(() => {
    return playersData.map((player: any) => ({
      ...player,
      eloInfo: getEloInfo(player.playerData?.highestStats?.roleWhithMorePoints?.points || 0),
      roleIcon: getRoleIcon(player.playerData?.highestStats?.mostFrequentRole?.role || ''),
      highestRoleIcon: getRoleIcon(player.playerData?.highestStats?.roleWhithMorePoints?.role || ''),
    }));
  }, [playersData, getEloInfo, getRoleIcon]);

  return (
    <div>
      <Header />
      {loading ? (<Loading />) : (
        <main className=''>
          <h1 className={`${koch.className} font-koch text-6xl mt-6 flex justify-center mb-2`}>
            Chiqueirinho Avaloniano
          </h1>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setActiveLeaderboard('total')}
              variant="outline" 
              className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${activeLeaderboard === 'total' ? 'bg-zinc-400' : ''}`}
            >
              Pontos Totais
            </Button>
            <Button 
              onClick={() => setActiveLeaderboard('role')}
              variant="outline" 
              className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${activeLeaderboard === 'role' ? 'bg-zinc-400' : ''}`}
            >
              Pontos por Role
            </Button>
            <Button 
              onClick={() => setActiveLeaderboard('highestElos')}
              variant="outline" 
              className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${activeLeaderboard === 'highestElos' ? 'bg-zinc-400' : ''}`}
            >
              Jogadores com maior Elo
            </Button>
          </div>
          <div>
            {activeLeaderboard === 'total' && <Leaderboard players={enhancedPlayers} />}
            {activeLeaderboard === 'role' && <RoleLeaderboard players={enhancedPlayers} />}
            {activeLeaderboard === 'highestElos' && <HighestEloLeaderboard players={enhancedPlayers} />}
          </div>
        </main>
      )}
    </div>
  );
}

