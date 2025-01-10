import React, { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { TopPlayerCard } from './TopPlayerCard';
import { LeaderboardTable } from './LeaderboardTable';
import { Card, CardContent } from "@/components/ui/card"

interface Player {
  nick: string;
  role: string;
  points: number;
  playerData: {
    highestStats: {
      roleWhithMorePoints: {
        points: number;
        role: string;
      };
    };
  };
}

interface HighestEloLeaderboardProps {
  players: Player[];
}

const HighestEloLeaderboard: React.FC<HighestEloLeaderboardProps> = ({ players }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => 
      (b.playerData?.highestStats?.roleWhithMorePoints?.points || 0) - 
      (a.playerData?.highestStats?.roleWhithMorePoints?.points || 0)
    );
  }, [players]);

  const { topPlayers, remainingPlayers, totalPages, currentPlayers } = useMemo(() => {
    const topPlayers = sortedPlayers.slice(0, 3);
    const remainingPlayers = sortedPlayers.slice(3);
    const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);
    const currentPlayers = remainingPlayers.slice(
      (currentPage - 1) * playersPerPage,
      currentPage * playersPerPage
    );

    return { topPlayers, remainingPlayers, totalPages, currentPlayers };
  }, [sortedPlayers, currentPage]);

  const formatPlayerForDisplay = (player: Player) => ({
    ...player,
    points: player.playerData?.highestStats?.roleWhithMorePoints?.points || 0,
    role: player.playerData?.highestStats?.roleWhithMorePoints?.role || 'N/A'
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl shadow-xl overflow-hidden border border-[#3A3A3A]">
        <div className="p-6">
          <h2 className="text-2xl flex justify-center font-semibold text-purple-200 mb-8 items-center gap-3">
            <Trophy className="text-purple-400" />
            Maior ELO Alcançado
          </h2>

          {sortedPlayers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {topPlayers.map((player, index) => (
                  <TopPlayerCard 
                    key={player.nick} 
                    rank={index + 1} 
                    player={formatPlayerForDisplay(player) as any}
                  />
                ))}
              </div>

              <LeaderboardTable
                players={currentPlayers.map(formatPlayerForDisplay)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
              <CardContent className="p-6 text-center">
                <p className="text-purple-200 text-lg">
                  Não há jogadores registrados ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighestEloLeaderboard;

