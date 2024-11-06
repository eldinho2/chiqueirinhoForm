/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Loading from "@/utils/Loading";
import { Trash2 } from "lucide-react";
import useSWR from 'swr'
import { roles } from "@/lib/roles";

interface Role {
  value: string;
  label: string;
  icon: string;
}

export default function Dungeons() {
    const params = useParams()
    const eventId = params?.eventId as string

    const fetcher = async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Falha ao carregar dados')
      return response.json()
    }

    const { data: dungeonsDetails, error, isLoading } = useSWR(
      `/api/getDungeon/${eventId}`,
      fetcher,
      {
        refreshInterval: 1000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true
      }
    )


    if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loading /></div>
    if (error) return <div>Erro ao carregar dados</div>

    const filterUsersByRole = (roleName: string) => {
      const roleUsers =
        dungeonsDetails[0]?.roles
          ?.filter((role: any) => Object.keys(role)[0] === roleName)
          .map((role: any) => ({
            nick: role[roleName]?.nick,
            ip: role[roleName]?.ip || "0",
            hasMor: role[roleName]?.hasMor || false,
          })) ?? [];

      return roleUsers.sort((a: { hasMor: boolean, ip: string }, b: { hasMor: boolean, ip: string }) => {
        if (a.hasMor !== b.hasMor) {
          return b.hasMor ? 1 : -1;
        }
        return parseInt(b.ip) - parseInt(a.ip);
      });
    };

    const handleDeletePlayer = (nick: string, roleName: string) => {
      const players = filterUsersByRole(roleName);
      const playerIndex = players.findIndex((player: {nick: string}) => player.nick === nick);
      players.splice(playerIndex, 1);
    };

    const renderPlayerSlot = (role: Role) => {
      const players = filterUsersByRole(role.value);
      return (
        <Card
          key={role.value}
          className="flex flex-col border border-[#2A2A2A] p-4 rounded-md h-full"
        >
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={role.icon}
              alt={role.label}
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-gray-200 text-base font-medium">
              {role.label}
            </span>
          </div>
          <div className="flex-grow overflow-y-auto max-h-72">
            {players && players.length > 0 ? (
              <div className="space-y-2">
                {players.map((player: {nick: string, ip: string, hasMor: boolean}, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 bg-[#2A2A2A] p-2 rounded-md"
                  >
                    <Trash2 onClick={() => handleDeletePlayer(player.nick, role.value)} className="text-gray-500 hover:text-red-600 min-w-4 min-h-4" />

                    <span className="text-sm text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`px-2 text-base ${
                        player.hasMor ? "text-green-400" : "text-gray-300"
                      }`}
                    >
                      {player.nick}
                      <span className="ml-2 text-sm text-gray-500">
                        {player.ip !== "0" && `(${player.ip})`}
                        {player.hasMor && " ★"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pl-3">
                <span className="text-base text-gray-500">Empty</span>
              </div>
            )}
          </div>
        </Card>
      );
    };

    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <Header />
        <main className="container mx-auto">
          <div className="flex justify-center items-center gap-4">
            <h1 className="text-2xl font-bold mb-8 text-center">
              {dungeonsDetails[0]?.name || "Loading..."}
            </h1>
            <span className="text-gray-400 text-sm mb-4">
              {dungeonsDetails[0]?.roles.length} pings
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roles.map((role) => renderPlayerSlot(role))}
          </div>
        </main>
      </div>
    );
}
