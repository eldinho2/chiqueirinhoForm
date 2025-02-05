import { PlayerList } from "./PlayerList";
import { PlayerCard } from "./PlayerCard";

interface Player {
  nick: string;
  role: string;
  roleIcon: string;
  ip: string;
}

interface MyParty{
  nick: string;
  role: string;
  ip: string;
}

interface MyPartyProps {
  myParty: any;
  setMyParty: React.Dispatch<React.SetStateAction<MyParty[]>>;
}

export default function MyParty({ myParty, setMyParty }: MyPartyProps) {
  const removeFromMyParty = (playerNick: string, playerRole: string, playerIp: string) => {
    setMyParty(prev => 
      prev.filter(player => 
        !(player.nick === playerNick && 
          player.role === playerRole && 
          player.ip === playerIp)
      )
    );
  };

  return (
    <PlayerList>
      {myParty.map((player: Player) => (
        <PlayerCard
          key={`${player.nick}-${player.role}-${player.ip}`}
          nick={player.nick}
          role={player.role}
          roleIcon={player.roleIcon}
          onRemove={() => removeFromMyParty(player.nick, player.role, player.ip)}
        />
      ))}
    </PlayerList>
  );
}