import Image from "next/image";
import { Trash2  } from "lucide-react";

interface MorListProps {
  eventId: string;
  morList: { nick: string; role: string; roleIcon: string; ip: string }[];
}

export default function MorList({ eventId, morList }: MorListProps) {

  const removeFromMorList = async (playerNick: string, playerRole: string, playerIp: string): Promise<void> => {
    console.log(playerNick, playerRole);

    try {
      const response = await fetch("/api/removePlayerFromMorList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, playerData: { nick: playerNick, role: playerRole, ip: playerIp } }),
      });

      if (!response.ok) {
        throw new Error("Falha ao remover jogador");
      }
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
    }
    
  }

  return (
    <div className="flex flex-col gap-2 max-w-full max-h-[600px] overflow-y-auto">
      <ul className="flex flex-col gap-2">
        {morList.map((player) => (
          <li key={player.nick} className="flex items-center justify-between bg-[#2A2A2A] p-2 rounded-md w-full">
            <div className="flex items-center gap-4 w-full">
              <Image src={player.roleIcon} alt={player.role} width={24} height={24} className="rounded" />
              <span className="text-base text-gray-300 truncate w-32" title={player.nick}>
                {player.nick.length > 17 ? `${player.nick.slice(0, 17)}...` : player.nick}
              </span>
              <span className="text-sm text-gray-500 whitespace-nowrap">{player.role}</span>
            </div>
            <Trash2 
              onClick={() => removeFromMorList(player.nick, player.role, player.ip)} 
              className="text-red-500 hover:text-red-600 cursor-pointer"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}