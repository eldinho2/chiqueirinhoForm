'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';
import UserCard from "@/app/components/oincpoints/UseCard";
import { useState } from "react";
import Header from "../components/Header";
import Loading from "@/utils/Loading";

export default function OincPoints() {
  const [search, setSearch] = useState("");
  const [sortByPoints, setSortByPoints] = useState(true);

  const fetchOincPoints = async () => {
    const response = await fetch('/api/getOincPoints');
    const data = await response.json();
    return data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['oincPoints'],
    queryFn: fetchOincPoints,
  });

  const handlePointsUpdate = async (nickname: string, oldPoints: number, newPoints: number) => {
    console.log(`User ${nickname} points updated from ${oldPoints} to ${newPoints}`);
  };

  const filteredAndSortedUsers = data?.users
    ?.filter((user: any) =>
      user.nickname.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Search by nickname..."
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
                Sort by {sortByPoints ? "points" : "name"}
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
                    onPointsUpdate={(points: number) => handlePointsUpdate(user.nickname, user.oincPoints, points)}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">Nenhum usuario encontrado</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}