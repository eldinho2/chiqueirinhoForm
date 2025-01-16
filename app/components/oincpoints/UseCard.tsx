import { Card, CardContent } from "@/components/ui/card";
import EditPointsDialog from "./EditPointsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link";

interface UserCardProps {
  nickname: string;
  username: string | null;
  oincPoints: number;
  image: string | null;
  onPointsUpdate: (points: number) => void;
}

export default function UserCard({ nickname, username, oincPoints, image, onPointsUpdate }: UserCardProps) {
  const { data: session, status } = useSession();

  const { toast } = useToast();

  const fallbackImage = "/chiqueirinhologo.webp";

  const handlePointsUpdate = async (newPoints: number) => {
    try {
      await onPointsUpdate(newPoints);
      console.log(`os pontos do usuario ${nickname} foram alterados de ${oincPoints} para ${newPoints} por: ${session?.user?.nick}(${session?.user?.username})`);
      toast({
        title: "Pontos atualizados 🤩",
        description: `Os pontos do usuario ${nickname} foram atualizados de ${oincPoints} para ${newPoints}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar pontos",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-secondary border-none">
      <Toaster />
      <CardContent className="p-4 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={image || fallbackImage} alt={nickname} />
          <AvatarFallback>{nickname[0]}</AvatarFallback>
        </Avatar>
        <div className="flex justify-between items-center w-full">
          <Link href={`/perfil/${nickname}`} className="">
            <h3 className="text-base font-semibold">{nickname}</h3>
            {username && <p className="text-sm text-muted-foreground">@{username}</p>}
          </Link>
          <div className="flex flex-col items-center justify-end">
          <EditPointsDialog
              nickname={nickname}
              currentPoints={oincPoints}
              onSave={handlePointsUpdate}
            />
            <h3 className="text-sm font-semibold">Oinc Points: {oincPoints} 💰</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}