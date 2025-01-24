import React from 'react'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { roles } from '@/lib/roles'

interface LeaderboardTableProps {
  players: any[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  role?: string
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  players,
  currentPage,
  totalPages,
  onPageChange,
  role,
}) => {    

  const findEloFromRole = (player: any, role: string) => {
    const playerRoles = player.playerData?.highestStats?.allPlayersRoles;
  
    if (!playerRoles) return 0; 
  
    const result = playerRoles?.find((item: any) => item.role === role);
    console.log(result);
    
    return result?.elo.current.icon ?? '/chiqueirinhologo.webp';
  };
  
  const getRoleIcon = (roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon;
  };   
  

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Jogador</th>
              {role ? <th className="px-4 py-3">Pontos na Role</th> : <th className="px-4 py-3">Pontos Totais</th>}
              <th className="px-4 py-3">{role ? 'Elo Atual' : 'Maior Elo'}</th>
              <th className="px-4 py-3">Maior Dano</th>
              <th className="px-4 py-3">Maior DPS</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <motion.tr
                key={player.nick}
                className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-4 py-3 text-zinc-300">
                  {index + 4 + (currentPage - 1) * 10}
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Image
                    src={player.playerData?.user?.image || '/chiqueirinhologo.webp'}
                    alt={player.nick || 'Player'} 
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <Link className='text-sm' href={`/perfil/${player.playerData?.user?.nickname}`}>{player.nick}</Link>
                </td>
                <td className="px-4 py-3">{role ? player?.rolePoints?.toLocaleString() : player?.totalPoints?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span title={player.eloInfo.current.name}>{role ? role : player.playerData?.highestStats?.roleWhithMorePoints?.role} {role ? findEloFromRole(player, role) : player.eloInfo?.current?.icon}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{parseInt(player?.playerData?.highestStats?.highestDamage).toLocaleString()}</td>
                <td className="px-4 py-3">{player?.playerData?.highestStats?.highestMaxDps}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="border-[#3A3A3A] text-gray-300 hover:bg-[#2A2A2A] hover:text-gray-100"
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-400">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="border-[#3A3A3A] text-gray-300 hover:bg-[#2A2A2A] hover:text-gray-100"
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}

