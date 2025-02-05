'use client';

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserCard from "@/app/components/oincpoints/UseCard";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Loading from "@/utils/Loading";
import { useSession } from "next-auth/react";

export default function OincPoints() {
  const { data: session, status } = useSession();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortByPoints, setSortByPoints] = useState(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchOincPoints = async () => {
    const response = await fetch("/api/getOincPoints");
    const data = await response.json();
    return data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["oincPoints"],
    queryFn: fetchOincPoints,
  });

  const handlePointsUpdate = async (nickname: string, oldPoints: number, newPoints: number) => {
    
    console.log(`User ${nickname} points updated from ${oldPoints} to ${newPoints}`);

    try {
      const response = await fetch("/api/updateOincPoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, oldPoints, newPoints }),
      });      

      await fetch(`${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: `Os oinc Points do usuario ${nickname} foram alterados de ${oldPoints} para ${newPoints} por: ${session?.user?.nick}(${session?.user?.username})` }),
      });

      if (!response.ok) {
        throw new Error("Failed to update points");
      }

      const cached = queryClient.getQueryData(["oincPoints"]) as any;
      if (cached) {
        queryClient.setQueryData(["oincPoints"], {
          ...cached,
          users: cached.users.map((user: any) => {
            if (user.nickname === nickname) {
              return {
                ...user,
                oincPoints: newPoints,
              };
            }
            return user;
          }),
        });
      }
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const filteredAndSortedUsers = data?.users
    ?.filter((user: any) =>
      user.nickname.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortByPoints) {
        return b.oincPoints - a.oincPoints;
      }
      return a.nickname.localeCompare(b.nickname);
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-6xl text-center mb-8">Oinc Points</h1>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Input
              placeholder="Procurar por nickname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={sortByPoints}
                onCheckedChange={setSortByPoints}
                id="sort-mode"
              />
              <Label htmlFor="sort-mode">
                Ordenar por {sortByPoints ? "pontos" : "nick"}
              </Label>
            </div>
          </div>

          {isLoading ? (
            <Loading />
          ) : isError ? (
            <p className="text-center text-destructive">Erro carregando dados</p>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedUsers?.length > 0 ? (
                filteredAndSortedUsers.map((user: any) => (
                  <UserCard
                    key={user.nickname}
                    {...user}
                    onPointsUpdate={(points: number) =>
                      handlePointsUpdate(user.nickname, user.oincPoints, points)
                    }
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
