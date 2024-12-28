import Image from "next/image";
import { Trash2 } from "lucide-react";

interface PlayerCardProps {
  nick: string;
  role: string;
  roleIcon: string;
  onRemove?: () => void;
}

export function PlayerCard({ nick, role, roleIcon, onRemove }: PlayerCardProps) {
  return (
    <li className="flex w-full items-center justify-between rounded-md bg-neutral-800 p-3 transition-colors hover:bg-neutral-700">
      <div className="flex w-full items-center gap-4">
        <Image 
          src={roleIcon} 
          alt={role} 
          width={24} 
          height={24} 
          className="rounded" 
        />
        <span 
          className="w-32 truncate text-base text-neutral-300" 
          title={nick}
        >
          {nick.length > 17 ? `${nick.slice(0, 17)}...` : nick}
        </span>
        <span className="whitespace-nowrap text-sm text-neutral-500">
          {role}
        </span>
      </div>
      {
        onRemove &&
        <button
          onClick={onRemove}
          className="group p-1"
          aria-label="Remove player"
        >
          <Trash2 className="h-5 w-5 text-red-500 transition-colors group-hover:text-red-400" />
        </button>
      }
    </li>
  );
}