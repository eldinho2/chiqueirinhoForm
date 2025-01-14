'use client'

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { roles as DefaultRoles } from "@/lib/roles";

interface Player {
  nick: string;
  ip: string;
}

interface Role {
  value: string;
  icon: string;
}

interface DungeonDetails {
  morList: { nick: string; role: string }[];
}

interface PlayerFormOptionsProps {
  player: Player;
  role: Role;
  dungeonsDetails: DungeonDetails[];
  eventId: string;
  setRemoveMor: any;
}

export default function PlayerFormOptions({ player, role, dungeonsDetails, eventId, setRemoveMor }: PlayerFormOptionsProps) {
  const morList = dungeonsDetails?.length > 0 ? dungeonsDetails[0].morList : [];

  const playerData: PlayerData = {
    nick: player.nick,
    ip: player.ip,
    role: role.value,
    roleIcon: role.icon,
  };

  interface PlayerData {
    nick: string;
    ip: string;
    role: string;
    roleIcon: string;
  }

  const [isAddingToMor, setIsAddingToMor] = useState(false);
  const [newNick, setNewNick] = useState(player.nick);
  const [newRole, setNewRole] = useState(role.value);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToMorList = async (playerData: PlayerData) => {
    if (isAddingToMor) return;

    const isPlayerInMorList = morList.some(
      (mor) => mor.nick === playerData.nick && mor.role === playerData.role
    );

    if (isPlayerInMorList) {
      return;
    }

    setIsAddingToMor(true);

    try {
      const response = await fetch("/api/insertPlayerInMorList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, playerData }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar dados");
      }
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
    }
  };

  const removeFromForm = async (playerData: PlayerData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/deletePlayerInForms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, playerData }),
      });

      if (!response.ok) {
        throw new Error("Falha ao remover jogador");
      }
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = async (playerData: PlayerData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/editPlayerInForms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, playerData: { ...playerData, newNick, newRole } }),
      });

      if (!response.ok) {
        throw new Error("Falha ao editar jogador");
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar jogador:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    setNewNick(player.nick);
    setNewRole(role.value);
    setIsDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-0 m-0"><EllipsisVertical /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full bg-black flex flex-col gap-2">
          <div className="hover:bg-[#2A2A2A]">
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddToMorList(playerData)} ><Plus /> Adicionar M.O.R</DropdownMenuItem>
          </div>
          <div className="hover:bg-[#2A2A2A]">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setRemoveMor((prev: any) => [...prev, playerData])} ><Plus /> Remover M.O.R</DropdownMenuItem>
          </div>
          <div className="hover:bg-[#2A2A2A]">
            <DropdownMenuItem className="cursor-pointer" onClick={openEditDialog}><Pencil /> Editar Player</DropdownMenuItem>
          </div>
          <div className="hover:bg-[#2A2A2A]">
            <DropdownMenuItem className="cursor-pointer" onClick={() => removeFromForm(playerData)}><Trash2 /> Remover Player</DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[400px] bg-black">
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
          </DialogHeader>
          <div>
            <input
              type="text"
              value={newNick}
              onChange={(e) => setNewNick(e.target.value)}
              placeholder="Novo Nick"
              className="w-full p-2 mb-4 border rounded text-black"
            />
            <Select required value={newRole} onValueChange={(value) => setNewRole(value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione a nova role" />
              </SelectTrigger>
              <SelectContent className="w-full h-[300px] overflow-y-auto bg-black text-white">
                {DefaultRoles.map((selectRole) => (
                  <SelectItem key={selectRole.value} value={selectRole.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{selectRole.label}</span>
                      <Image
                        src={selectRole.icon}
                        alt={`Role icon for ${selectRole.label}`}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" onClick={() => handleEditPlayer(playerData)} className="mt-4" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

