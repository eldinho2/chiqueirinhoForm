import { Card, CardContent } from "@/components/ui/card";
import EditPointsDialog from "./EditPointsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

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
        title: "Points Updated",
        description: `Successfully updated points for ${nickname} from ${oincPoints} to ${newPoints}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update points",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-secondary border-none">
      <CardContent className="p-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={image || fallbackImage} alt={nickname} />
          <AvatarFallback>{nickname[0]}</AvatarFallback>
        </Avatar>
        <div className="flex justify-between items-center w-full">
          <div className="">
            <h3 className="text-lg font-semibold">{nickname}</h3>
            {username && <p className="text-sm text-muted-foreground">@{username}</p>}
          </div>
          <div className="flex flex-col items-center justify-end">
          <EditPointsDialog
              nickname={nickname}
              currentPoints={oincPoints}
              onSave={handlePointsUpdate}
            />
            <h3 className="text-lg font-semibold">Oinc Points: {oincPoints} 💰</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}