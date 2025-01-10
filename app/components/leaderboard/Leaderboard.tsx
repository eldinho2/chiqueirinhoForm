import React, { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { TopPlayerCard } from './TopPlayerCard';
import { LeaderboardTable } from './LeaderboardTable';

const Leaderboard = ({ players }: { players: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  const { topPlayers, remainingPlayers, totalPages, currentPlayers } = useMemo(() => {
    const topPlayers = players.slice(0, 3);
    const remainingPlayers = players.slice(3);
    const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);
    const currentPlayers = remainingPlayers.slice(
      (currentPage - 1) * playersPerPage,
      currentPage * playersPerPage
    );

    return { topPlayers, remainingPlayers, totalPages, currentPlayers };
  }, [players, currentPage]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl shadow-xl overflow-hidden border border-[#3A3A3A]">
        <div className="p-6">
          <h2 className="text-2xl flex justify-center font-semibold text-blue-200 mb-8 items-center gap-3">
            <Trophy className="text-blue-400" />
            Pontos Totais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {topPlayers.map((player: any, index: number) => (
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

