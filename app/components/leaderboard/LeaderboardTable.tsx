import React from 'react'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface LeaderboardTableProps {
  players: any[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  players,
  currentPage,
  totalPages,
  onPageChange,
}) => {

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Jogador</th>
              <th className="px-4 py-3">Pontos Totais</th>
              <th className="px-4 py-3">Maior Elo</th>
              <th className="px-4 py-3">Maior Dano</th>
              <th className="px-4 py-3">Maior DPS</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <motion.tr
                key={player.nick}
                className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-4 py-3 text-zinc-300">
                  {index + 4 + (currentPage - 1) * 10}
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Image
                    src={player.playerData.user.image || '/chiqueirinhologo.webp'}
                    alt={player.nick || 'Player'} 
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <Link href={`/perfil/${player.playerData.user.userID}`}>{player.nick}</Link>
                </td>
                <td className="px-4 py-3">{player.totalPoints.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" title={player.eloInfo.current.name}>{player.playerData.highestStats.roleWhithMorePoints.role} {player.eloInfo.current.icon}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{parseInt(player.damage).toLocaleString()}</td>
                <td className="px-4 py-3">{player.maxDps}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

