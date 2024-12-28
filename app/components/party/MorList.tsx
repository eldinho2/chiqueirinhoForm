import { PlayerList } from "./PlayerList";
import { PlayerCard } from "./PlayerCard";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

interface Player {
  nick: string;
  role: string;
  roleIcon: string;
  ip: string;
}

interface MorListProps {
  eventId: string;
  morList: Player[];
}

export default function MorList({ eventId, morList }: MorListProps) {
  const { toast } = useToast()

  const removeFromMorList = async (playerNick: string, playerRole: string, playerIp: string) => {
    try {
      const response = await fetch("/api/removePlayerFromMorList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          eventId, 
          playerData: { 
            nick: playerNick, 
            role: playerRole, 
            ip: playerIp 
          } 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove player");
      }

      toast({
        title: "Jogador removido!",
        description: "O jogador foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error removing player:", error);
      toast({
        title: "Jogador não removido!",
        description: "O jogador foi removido com sucesso.",
      });
    }
  };

  return (
    <div>
      <Toaster />
      <PlayerList>
        {morList?.map((player) => (
          <PlayerCard
            key={`${player.nick}-${player.role}-${player.ip}`}
            nick={player.nick}
            role={player.role}
            roleIcon={player.roleIcon}
            onRemove={() => removeFromMorList(player.nick, player.role, player.ip)}
          />
        ))}
      </PlayerList>
    </div>
  );
}