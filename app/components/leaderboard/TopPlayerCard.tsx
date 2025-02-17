'use client'

import React from 'react'
import { Trophy, Swords, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { roles } from '@/lib/roles'
import Link from 'next/link'

export const TopPlayerCard: React.FC<any> = ({ rank, player, role }) => {
  const getBorderColor = () => {
    switch (rank) {
      case 1: return 'border-yellow-400'
      case 2: return 'border-slate-400'
      case 3: return 'border-amber-700'
      default: return 'border-zinc-700'
    }
  }

  const getBackgroundGradient = () => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-zinc-900'
      case 2: return 'bg-gradient-to-br from-slate-800/20 via-slate-700/10 to-zinc-900'
      case 3: return 'bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-zinc-900'
      default: return 'bg-gradient-to-br from-zinc-800/20 via-zinc-800/10 to-zinc-900'
    }
  }

  const getRoleIcon = (roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon;
  };   
  
  
  const findEloFromRole = (player: any, role: string) => {
    const playerRoles = player.playerData?.highestStats?.allPlayersRoles;
  
    if (!playerRoles) return 0; 
  
    const result = playerRoles?.find((item: any) => item.role === role);
    
    return result;
  };

  const selectedRoleElo = findEloFromRole(player, role);  

  return (
    <motion.div
      className={`relative rounded-lg ${getBackgroundGradient()} border-2 ${getBorderColor()} p-3 flex flex-col gap-4 overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-lg">
        <Trophy className={`w-6 h-6 ${rank <= 3 ? 'text-yellow-400' : 'text-zinc-400'}`} />
        <span className="absolute text-xs font-bold bg-zinc-900 px-1 rounded-full -bottom-2">{rank}</span>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="flex-1 flex items-center gap-3">
          <Image
            src={player?.playerData?.user?.image || '/chiqueirinhologo.webp'}
            alt={player.nick || 'Player'}
            width={48}
            height={48}
            className='rounded-full border-2 border-zinc-700'
          />
          <div>
            <Link href={`/perfil/${player.playerData?.user?.nickname}`} className="text-xl font-bold mb-1 text-zinc-100">{player.nick}</Link>
            <div className=" text-zinc-400 flex items-center gap-1">
              <Image
                src={getRoleIcon(player.playerData?.highestStats?.mostFrequentRole) || '/chiqueirinhologo.webp'}
                alt={player.playerData?.highestStats?.mostFrequentRole.role || 'Role'}
                width={16}
                height={16}
              />
              <p className='text-xs'>Role Mais Jogada</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Pontos Totais</div>
            <div className="text-2xl font-bold text-zinc-100">{player?.totalPoints?.toLocaleString()}</div>
          </div>
          <div className="text-right flex items-center gap-2">
            <div className='flex flex-col items-center justify-center'>
              <div className="text-xs text-zinc-400">Elo Atual</div>
              <div className="text-lg font-bold text-zinc-100 flex items-center gap-1">
                <span >{player?.eloInfo?.current?.name}</span>
                <span className=''>{role ? selectedRoleElo?.elo?.current?.icon : player.eloInfo?.current?.icon}</span>
              </div>
            </div>
            <Image
              src={role ? getRoleIcon(role) || '/chiqueirinhologo.webp' : player?.highestRoleIcon}
              alt={player?.playerData?.highestStats?.roleWhithMorePoints?.role || 'Role'}
              width={32}
              height={32}
              className="bg-neutral-800"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-zinc-400">Maior Dano</div>
            <div className="font-bold text-zinc-100">{parseInt(player?.playerData?.highestStats?.highestDamage).toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-xs text-zinc-400">Maior DPS</div>
            <div className="font-bold text-zinc-100">{player?.playerData?.highestStats?.highestMaxDps}</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-zinc-400">Progresso do Elo</div>
          <div className="text-xs text-zinc-400">{role ? selectedRoleElo?.elo.progress.toFixed(0) : player.eloInfo.progress.toFixed(0)}%</div>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full ${role ? selectedRoleElo?.elo.current.color : player.eloInfo?.current?.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(role ? selectedRoleElo?.elo?.progress || 0 : player.eloInfo?.progress || 0)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className='text-center text-xs pt-2 text-zinc-400'>{role? selectedRoleElo.elo.current.icon : player.eloInfo.current.icon }{role ? selectedRoleElo.points : player.playerData?.highestStats?.roleWhithMorePoints?.points} pontos</p>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex items-center gap-1 text-zinc-400">
          <ChevronDown className="w-4 h-4" />
          <span>
            {role ? selectedRoleElo.elo.previous?.icon : player.eloInfo.previous?.icon}
            {role ? selectedRoleElo.elo.current?.threshold : player.eloInfo.current?.threshold}
          </span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <span>
            {role ? selectedRoleElo.elo.next?.icon : player.eloInfo.next?.icon} 
            {role ? selectedRoleElo.elo.next?.threshold : player.eloInfo.next?.threshold ? player.eloInfo.next?.threshold : 'MAX'}
          </span>
          <ChevronUp className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  )
}
