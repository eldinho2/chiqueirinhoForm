'use client';

import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { PlayerList } from "./PlayerList";
import { PlayerCard } from "./PlayerCard";

interface Player {
  nick: string;
  role: string;
  roleIcon: string;
  ip: string;
}

interface RemoveMorListProps {
  removeMorList: Player[];
}

export default function RemoveMorList({ removeMorList }: RemoveMorListProps) {
  const [filteredRemoveMorListMorList, setFilteredRemoveMorListMorList] = useState<Player[]>([]);

  useEffect(() => {
    setFilteredRemoveMorListMorList(removeMorList || []);
  }, [removeMorList]);

  const removeFromRemoveMorList = (playerNick: string, playerRole: string, playerIp: string) => {
    setFilteredRemoveMorListMorList(prev => 
      prev.filter(player => 
        !(player.nick === playerNick && 
          player.role === playerRole && 
          player.ip === playerIp)
      )
    );
  };

  return (
    <PlayerList>
      {filteredRemoveMorListMorList.length > 0 ? (
        filteredRemoveMorListMorList.map((player: Player) => (
          <PlayerCard
            key={`${player.nick}-${player.role}-${player.ip}`}
            nick={player.nick}
            role={player.role}
            roleIcon={player.roleIcon}
            onRemove={() => removeFromRemoveMorList(player.nick, player.role, player.ip)}
          />
        ))
      ) : (
        <p>Nenhum jogador na lista</p>
      )}
    </PlayerList>
  );
}
