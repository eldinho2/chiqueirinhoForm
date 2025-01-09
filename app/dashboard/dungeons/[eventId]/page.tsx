"use client";

import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Loading from "@/utils/Loading";
import useSWR from "swr";
import Image from "next/image";
import { roles } from "@/lib/roles";
import { InsertMeeter } from "@/app/components/InsertMeeter";
import { useState, useEffect } from "react";
import PlayerFormOptions from "@/app/components/PlayerFormOptions";
import MorList from "@/app/components/party/MorList";
import MyParty from "@/app/components/party/MyParty";
import RemoveMorList from "@/app/components/party/RemoveMorList";
import ErrorPage from "@/utils/ErrorPage";
import axios from "axios";

interface Role {
  value: string;
  label: string;
  icon: string;
}

interface PlayerData {
  nick: string;
  role: string;
  ip: string;
  hasMor: boolean;
  roleIcon: string;
}

interface MyParty {
  nick: string;
  role: string;
  ip: string;
}

export default function Dungeons() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [myParty, setMyParty] = useState<MyParty[]>([]);
  const [removeMor, setRemoveMor] = useState<MyParty[]>([]);
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [isProcessingRemove, setIsProcessingRemove] = useState(false);

  const handleAddToMyParty = async (playerData: PlayerData) => {
    if (
      myParty.some(
        (player) =>
          player.nick === playerData.nick &&
          player.role === playerData.role &&
          player.ip === playerData.ip
      )
    ) {
      return;
    }
    setMyParty([...myParty, playerData]);
  };

  async function fetchWithRetry(url: string, options = {}, retries = 50, delay = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios(url, options);
        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error(`Erro na tentativa ${i + 1}:`, error);
        if (i === retries - 1) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  async function handleAddMor(players: PlayerData[]) {
    if (isProcessingAdd) return;
    setIsProcessingAdd(true);
  
    const messageBody: { nickname: string; role: string }[] = players.map((player) => ({
      nickname: player.nick,
      role: player.role,
    }));
    
    try {
      await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/message/${process.env.NEXT_PUBLIC_MOR_ROOM_ID}`,
        {
          method: 'POST',
          data: { content: messageBody },
        },
        50,
        2000 
      );
    } catch (error) {
      console.error("Erro ao adicionar MOR:", error);
    } finally {
      setTimeout(() => setIsProcessingAdd(false), 5000);
    }
  }
  
  async function handleRemoveMor(players: PlayerData[]) {
    if (isProcessingRemove) return;
    setIsProcessingRemove(true);
  
    try {
      const messages = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/history/${process.env.NEXT_PUBLIC_MOR_ROOM_ID}`,
        {},
        50,
        2000
      );
  
      const playersToRemove = players.map((player) => player.nick.trim());
      const messageIdsToDelete: { nickname: string; id: string }[] = [];      
      
      for (const message of messages) {
        const playerNick = playersToRemove.find((nick) =>
          message.cleanContent.toLowerCase().includes(nick.toLowerCase().trim())
      );
  
        if (playerNick) {
          messageIdsToDelete.push({ nickname: playerNick, id: message.id });
        }
      }
  
      await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/deleteMessage/${process.env.NEXT_PUBLIC_MOR_ROOM_ID}`,
        {
          method: 'POST',
          data: { idList: messageIdsToDelete },
        },
        5,
        2000
      );
  
    } catch (error) {
      console.error("Erro ao remover MOR:", error);
    } finally {
      setTimeout(() => setIsProcessingRemove(false), 5000);
    }
  }
  

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao carregar dados");
    return response.json();
  };

  const {
    data: dungeonsDetails,
    error,
    isLoading,
  } = useSWR(`/api/getDungeon/${eventId}`, fetcher, {
    refreshInterval: 1000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    if (dungeonsDetails && dungeonsDetails[0]?.roles) {
      const playersWithMor = dungeonsDetails[0]?.roles.flatMap(
        (
          role: Record<string, { nick: string; ip?: string; hasMor?: boolean }>
        ) =>
          Object.values(role)
            .filter((player) => player.hasMor)
            .map((player) => ({
              nick: player.nick,
              role: Object.keys(role)[0],
              ip: player.ip || "0",
              hasMor: player.hasMor,
              roleIcon: roles.find((r) => r.value === Object.keys(role)[0])
                ?.icon,
            }))
      );

      if (playersWithMor) {
        setRemoveMor(playersWithMor);
      }
    }
  }, [dungeonsDetails]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) return <ErrorPage />;

  const filterUsersByRole = (roleName: string) => {
    const roleUsers =
      dungeonsDetails[0]?.roles
        ?.filter(
          (
            role: Record<
              string,
              { nick: string; ip?: string; hasMor?: boolean }
            >
          ) => Object.keys(role)[0] === roleName
        )
        .map(
          (
            role: Record<
              string,
              { nick: string; ip?: string; hasMor?: boolean }
            >
          ) => ({
            nick: role[roleName]?.nick,
            ip: role[roleName]?.ip || "0",
            hasMor: role[roleName]?.hasMor || false,
            role: roleName,
            roleIcon: roles.find((r) => r.value === roleName)?.icon,
          })
        ) ?? [];

    return roleUsers.sort((a: PlayerData, b: PlayerData) => {
      if (a.hasMor !== b.hasMor) return b.hasMor ? 1 : -1;
      return parseInt(b.ip) - parseInt(a.ip);
    });
  };

  const renderPlayerSlot = (role: Role) => {
    const players = filterUsersByRole(role.value);

    return (
      <Card
        key={role.value}
        className="flex flex-col border border-neutral-800 rounded-md p-4 h-full"
      >
        <div className="flex items-center gap-3 mb-3">
          <Image
            src={role.icon}
            alt={`Role icon for ${role.label}`}
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-base font-medium text-neutral-200">
            {role.label}
          </span>
        </div>
        <div className="flex-grow overflow-y-auto max-h-72">
          {players && players.length > 0 ? (
            <div className="space-y-2">
              {players.map((player: PlayerData, index: number) => (
                <div
                  key={index}
                  onDoubleClick={() => handleAddToMyParty(player)}
                  className="flex flex-col gap-1 rounded-md bg-neutral-800 p-2 transition-colors hover:bg-neutral-700"
                >
                  <div className="flex items-center">
                    <div className="flex min-w-[60px] items-center gap-3">
                      <PlayerFormOptions
                        player={player}
                        role={role}
                        dungeonsDetails={dungeonsDetails}
                        eventId={eventId}
                      />
                      <span className="text-sm text-neutral-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600 overflow-x-auto whitespace-nowrap">
                      <span
                        className={`px-2 text-base ${
                          player.hasMor
                            ? "text-emerald-400"
                            : "text-neutral-300"
                        }`}
                      >
                        {player.nick}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Image
                      src={role.icon}
                      alt={`Role icon for ${role.label}`}
                      width={22}
                      height={22}
                      className="rounded"
                    />
                    {player.ip !== "0" && `IP: ${player.ip}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-3">
              <span className="text-base text-neutral-500">Empty</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const handleClearDungeon = async () => {
    const role = dungeonsDetails[0].roles
    console.log(role);
    

    await fetch("/api/clearDungeon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, eventId }),
    });
  };

  return (
    <div className="min-h-screen text-white">
      <Header />
      <main className="mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <h1 className="my-8 text-center text-2xl font-bold overflow-hidden">
            {dungeonsDetails[0]?.name || "Loading..."}
          </h1>
          <span className="my-6 text-sm text-neutral-400">
            {dungeonsDetails[0]?.roles.length} pings
          </span>
          <button onClick={handleClearDungeon} className="hover:underline hover:text-gray-500">Limpar Dungeon</button>
          <div>
            <InsertMeeter
              dungeon={dungeonsDetails}
              morList={dungeonsDetails[0]?.morList}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:justify-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {roles.map(renderPlayerSlot)}
          </div>

          <div className="flex flex-col gap-6">
            <section className="flex flex-col h-[400px] max-h-[400px] overflow-y-auto items-center">
              <h2 className="mb-4 text-2xl font-bold">
                Minha Party ({myParty.length})
              </h2>
              <MyParty myParty={myParty} setMyParty={setMyParty} />
            </section>
            <div className="flex">
              <section className="flex flex-col items-center">
                <h2 className="mb-4 text-2xl font-bold">Lista de M.O.R</h2>
                <button
                  className={`mb-4 px-2 py-2 border text-white rounded-lg ${
                    isProcessingAdd ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleAddMor(dungeonsDetails[0]?.morList)}
                  disabled={isProcessingAdd}
                >
                  {isProcessingAdd ? "Adicionando..." : "Adicionar M.O.R"}
                </button>
                <MorList
                  eventId={eventId}
                  morList={dungeonsDetails[0]?.morList}
                />
              </section>

              <section className="flex flex-col items-center">
                <h2 className="mb-4 text-2xl font-bold">Remover M.O.R</h2>
                <button
                  className={`mb-4 px-2 py-2 border text-white rounded-lg ${
                    isProcessingRemove ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleRemoveMor(removeMor as PlayerData[])}
                  disabled={isProcessingRemove}
                >
                  {isProcessingRemove ? "Removendo..." : "Remover M.O.R"}
                </button>
                <RemoveMorList removeMorList={removeMor} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
