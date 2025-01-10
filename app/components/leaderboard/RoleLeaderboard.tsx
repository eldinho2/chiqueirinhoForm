import React, { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { TopPlayerCard } from './TopPlayerCard';
import { LeaderboardTable } from './LeaderboardTable';
import { roles } from '@/lib/roles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image";

const RoleLeaderboard = ({ players }: { players: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState('X-Bow');
  const playersPerPage = 10;

  const filteredPlayers = useMemo(() => {
    return players.filter(player => player.role === selectedRole)
      .sort((a, b) => b.points - a.points);
  }, [players, selectedRole]);

  const { topPlayers, remainingPlayers, totalPages, currentPlayers } = useMemo(() => {
    const topPlayers = filteredPlayers.slice(0, 3);
    const remainingPlayers = filteredPlayers.slice(3);
    const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);
    const currentPlayers = remainingPlayers.slice(
      (currentPage - 1) * playersPerPage,
      currentPage * playersPerPage
    );

    return { topPlayers, remainingPlayers, totalPages, currentPlayers };
  }, [filteredPlayers, currentPage]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border border-[#3A3A3A]">
          <div className='flex gap-4 justify-center'>
            <h2 className="text-2xl flex justify-center font-semibold mb-8 items-center gap-3">
              <Trophy className="" />
              Pontos por Role: {roles.find(role => role.value === selectedRole)?.label}
            </h2>

            <div className="mb-6">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione sua role" />
                </SelectTrigger>
                <SelectContent className="w-full h-[300px] overflow-y-auto bg-black text-white">
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{role.label}</span>
                        <Image
                          src={role.icon}
                          alt={role.label}
                          width={26}
                          height={26}
                          className="ml-2"
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPlayers.length > 0 ? (
            <>
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
            </>
          ) : (
            <Card className="bg-[#2A2A2A] border-[#3A3A3A] flex flex-col justify-center items-center">
              <CardContent className="p-6 text-center">
                <p className="text-green-200 text-lg">
                  Não há jogadores para a role {roles.find(role => role.value === selectedRole)?.label} ainda.
                </p>
                <Image src="/porco error.png" alt="porco error" width={400} height={400} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleLeaderboard;

