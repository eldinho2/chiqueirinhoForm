
'use client';

import { PlayerList } from "./PlayerList";
import { PlayerCard } from "./PlayerCard";
import { useCallback } from "react";
import { roles } from "@/lib/roles";

interface Player {
  nick: string;
  role: string;
  roleIcon: string;
  ip: string;
}

interface PlayersWithMorInAnotherDg {
  PlayersWithMorInAnotherDg: any;
}

export default function PlayersWithMorInAnotherDg({ PlayersWithMorInAnotherDg }: PlayersWithMorInAnotherDg) {
  const getRoleIcon = useCallback((roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon || '/chiqueirinhologo.webp';
  }, []);

  return (
    <PlayerList>
      {PlayersWithMorInAnotherDg?.map((player: Player) => (
        <PlayerCard
          key={`${player.nick}-${player.role}-${player.ip}`}
          nick={player.nick}
          role={player.role}
          roleIcon={getRoleIcon(player.role)}
        />
      ))}
    </PlayerList>
  );
}
