import { PlayerList } from "./PlayerList";
import { PlayerCard } from "./PlayerCard";

interface Player {
  nick: string;
  role: string;
  roleIcon: string;
  ip: string;
}

interface RemoveMorListProps {
  removeMorList: any;
}

export default function RemoveMorList({ removeMorList }: RemoveMorListProps) {
  return (
    <PlayerList>
      {removeMorList?.map((player: Player) => (
        <PlayerCard
          key={`${player.nick}-${player.role}-${player.ip}`}
          nick={player.nick}
          role={player.role}
          roleIcon={player.roleIcon}
        />
      ))}
    </PlayerList>
  );
}
