import Image from 'next/image';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PlayerDetails({ players, getRoleIcon }: any) {
  return (
    <>
      {players.map((player: any, index: any) => (
        <TableRow key={`${player.nick}-${index}`} className="bg-muted/50 hover:bg-muted/70 transition-colors">
          <TableCell></TableCell>
          <TableCell className="font-medium">{player.nick}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6">
                <Image
                  src={getRoleIcon(player.role) || "/placeholder.svg"}
                  alt={player.role}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <span className="text-sm text-muted-foreground">{player.role}</span>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Points:</span>
                <Badge variant="outline">{player.points}</Badge>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Damage:</span>
                <Badge variant="outline" className="bg-red-500/10">{player.damage}</Badge>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Heal:</span>
                <Badge variant="outline" className="bg-green-500/10">{player.heal}</Badge>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}