'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import localFont from 'next/font/local';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Leaderboard from '@/app/components/leaderboard/Leaderboard';
import RoleLeaderboard from '@/app/components/leaderboard/RoleLeaderboard';
import HighestEloLeaderboard from '@/app/components/leaderboard/HighestEloLeaderboard';
import Loading from '@/utils/Loading';
import { processPlayerStats } from '@/utils/leaderboardUtils';
import { ELOS } from '@/lib/elos';
import { roles } from '@/lib/roles';

const koch = localFont({
  src: '../public/fonts/Koch Fraktur.ttf',
  weight: '100',
});

const fetchAllTimeData = async () => {
  const response = await fetch('/api/getAllTimeData');
  if (!response.ok) {
    throw new Error('Failed to fetch all-time data');
  }
  return response.json();
};

const fetchPlayerDetails = async (player: any) => {
  const { nick } = player;
  try {
    const playerIdResponse = await fetch(`/api/getUserId/${nick}`);
    const playerId = await playerIdResponse.json();

    const playerDataResponse = await fetch(`/api/getUserProfile/${playerId}`);
    const playerData = await playerDataResponse.json();

    return { ...player, playerData };
  } catch {
    return { ...player, playerData: { icon: '/chiqueirinhologo.webp' } };
  }
};

export default function Home() {
  const [activeLeaderboard, setActiveLeaderboard] = useState('total');
  const [playersDataWithDetails, setPlayersDataWithDetails] = useState<any[]>([]);
  const [isLoadingWithTimeOut ,setIsLoadingWithTimeOut] = useState(true);

  const { data: weekData, isLoading, isError, error } = useQuery({
    queryKey: ['playersAllTimeData'],
    queryFn: fetchAllTimeData,
  });

  const getEloInfo = useCallback((points: number) => {
    const eloEntries = Object.entries(ELOS);

    const currentEloIndex = eloEntries.findIndex(([, { threshold }], index) => {
      const prevThreshold = index === 0 ? -Infinity : eloEntries[index - 1][1].threshold;
      const nextThreshold = index + 1 < eloEntries.length ? eloEntries[index + 1][1].threshold : Infinity;
      return points >= prevThreshold && points < nextThreshold;
    });

    const currentElo = currentEloIndex >= 0 ? eloEntries[currentEloIndex] : eloEntries[0];
    const nextElo = currentEloIndex + 1 < eloEntries.length ? eloEntries[currentEloIndex + 1][1] : null;

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
      progress,
    };
  }, []);

  const getRoleIcon = useCallback((roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon || '/chiqueirinhologo.webp';
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!weekData) return;
      const sortedPlayers = processPlayerStats(weekData);

      try {
        const playersWithDetails = await Promise.all(
          sortedPlayers.map((player: any) => fetchPlayerDetails(player))
        );
        setPlayersDataWithDetails(playersWithDetails);
      } catch (error) {
        console.error('Erro ao buscar detalhes dos jogadores:', error);
        setPlayersDataWithDetails(sortedPlayers);
      }
    };

    fetchDetails();
  }, [weekData]);

  const enhancedPlayers = useMemo(() => {
    if (!playersDataWithDetails) return [];
    return playersDataWithDetails.map((player: any) => ({
      ...player,
      eloInfo: getEloInfo(player.playerData?.highestStats?.roleWhithMorePoints?.points || 0),
      roleIcon: getRoleIcon(player.playerData?.highestStats?.mostFrequentRole?.role || ''),
      highestRoleIcon: getRoleIcon(player.playerData?.highestStats?.roleWhithMorePoints?.role || ''),
    }));
  }, [playersDataWithDetails, getEloInfo, getRoleIcon]);

  if (isError) return <div>Error: {error?.message || 'Failed to load data'}</div>;

  useEffect(() => {
    if (isLoading) {
    setTimeout(() => {
      setIsLoadingWithTimeOut(false);
    }, 1500);
  }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="">
        <motion.h1
          className={`${koch.className} font-koch text-6xl mt-6 flex justify-center mb-2 text-white`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Chiqueirinho Avaloniano
        </motion.h1>
        {isLoadingWithTimeOut ? (
          <Loading />
        ) : (
          <>
        <motion.div
          className="flex justify-center space-x-4 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={() => setActiveLeaderboard('total')}
            variant="outline"
            className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
              activeLeaderboard === 'total' ? 'bg-zinc-400' : ''
            }`}
          >
            Pontos Totais
          </Button>
          <Button
            onClick={() => setActiveLeaderboard('role')}
            variant="outline"
            className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
              activeLeaderboard === 'role' ? 'bg-zinc-400' : ''
            }`}
          >
            Pontos por Role
          </Button>
          <Button
            onClick={() => setActiveLeaderboard('highestElos')}
            variant="outline"
            className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
              activeLeaderboard === 'highestElos' ? 'bg-zinc-400' : ''
            }`}
          >
            Jogadores com maior Elo
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm"
        >
          {activeLeaderboard === 'total' && <Leaderboard players={enhancedPlayers} />}
          {activeLeaderboard === 'role' && <RoleLeaderboard players={enhancedPlayers} />}
          {activeLeaderboard === 'highestElos' && <HighestEloLeaderboard players={enhancedPlayers} />}
        </motion.div>
        </>
        )}
      </main>
    </div>
  );
}
