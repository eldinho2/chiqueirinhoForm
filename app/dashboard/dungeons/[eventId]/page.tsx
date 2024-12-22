"use client";

import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Loading from "@/utils/Loading";
import { Plus, Trash2, Pencil } from "lucide-react";
import useSWR from "swr";
import { roles } from "@/lib/roles";
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { InsertMeeter } from "@/app/components/InsertMeeter";

import PlayerFormOptions from '@/app/components/PlayerFormOptions';
import MorList from '@/app/components/MorList';

interface Role {
  value: string;
  label: string;
  icon: string;
}

export default function Dungeons() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const cleanUpRoles = () => {
    fetch(`/api/deleteAllFormRoles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId, roleData: dungeonsDetails[0]?.roles }),
    }).then((response) => {
      if (response.ok) {
        console.log("Roles limpos com sucesso!");
      }
    })
  };

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


  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  if (error) return <div>Erro ao carregar dados</div>;

  const filterUsersByRole = (roleName: string) => {
    const roleUsers =
      dungeonsDetails[0]?.roles
        ?.filter((role: any) => Object.keys(role)[0] === roleName)
        .map((role: any) => ({
          nick: role[roleName]?.nick,
          ip: role[roleName]?.ip || "0",
          hasMor: role[roleName]?.hasMor || false,
        })) ?? [];

    return roleUsers.sort(
      (
        a: { hasMor: boolean; ip: string },
        b: { hasMor: boolean; ip: string }
      ) => {
        if (a.hasMor !== b.hasMor) {
          return b.hasMor ? 1 : -1;
        }
        return parseInt(b.ip) - parseInt(a.ip);
      }
    );
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
            alt={`Role icon for ${role.label}`}
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
              {players.map(
                (
                  player: { nick: string; ip: string; hasMor: boolean },
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex flex-col bg-[#2A2A2A] p-2 rounded-md gap-1"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center gap-3 min-w-[60px]">
                        <PlayerFormOptions player={player} role={role} dungeonsDetails={dungeonsDetails} eventId={eventId} />
                        <span className="text-sm text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        <span
                          className={`px-2 text-base ${player.hasMor ? "text-green-400" : "text-gray-300"
                            }`}
                        >
                          {player.nick}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
                )
              )}
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
          <h1 className="text-2xl font-bold my-8 text-center overflow-hidden">
            {dungeonsDetails[0]?.name || "Loading..."}
          </h1>
          <span className="text-gray-400 text-sm my-6">
            {dungeonsDetails[0]?.roles.length} pings
          </span>
          <div>
            <InsertMeeter dungeon={dungeonsDetails} morList={dungeonsDetails[0]?.morList} />
          </div>
          <div className="my-6">
            <Dialog>
              <DialogTrigger>Limpar Formulário</DialogTrigger>
              <DialogContent className="bg-[#1A1A1A] max-w-lg">
                <DialogHeader>
                  <DialogTitle>⚠Isso limpará todos os pings!⚠</DialogTitle>
                  <DialogDescription>
                    Essa ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>Cancelar</DialogClose>
                  <DialogClose onClick={() => cleanUpRoles()} className="bg-red-500 hover:bg-red-600 p-2">Limpar</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:flex-row gap-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roles.map((role) => renderPlayerSlot(role))}
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Lista de M.O.R</h1>
               <MorList eventId={eventId} morList={dungeonsDetails[0]?.morList} />
          </div>
        </div>
      </main>
    </div>
  );
}
