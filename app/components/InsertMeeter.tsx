'use client';

import { useState } from "react";
import Image from "next/image"
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { roles as DefaultRoles } from "@/lib/roles"


export function InsertMeeter({ dungeon, morList }: any) {
  const roles = dungeon[0].roles;

  const [textDGs, setTextDGs] = useState(["", ""]);
  const [presentRolesDGs, setPresentRolesDGs] = useState<
    { nick: string; role: string; damage: string; points: number }[][]
  >([[], []]);
  const [missingRolesDGs, setMissingRolesDGs] = useState<
    { nick: string; role: string }[][]
  >([[], []]);
  const [scoreOverride, setScoreOverride] = useState<{ [nick: string]: number }>(
    {}
  );

  const [editingNick, setEditingNick] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [newNick, setNewNick] = useState<string>("");

  const roleNickPairs = roles.map((role: any) => {
    const [roleName, roleData] = Object.entries(role)[0];
    return {
      role: roleName,
      nick: (roleData as { nick: string }).nick
    };
  });



  interface Player {
    nick: string;
    role: string;
    damage: string;
    points: number;
  }

  const extractDamage = (inputText: string, nick: string): string => {
    const regex = new RegExp(`${nick}:\\s*(\\d+)\\(`, "i");
    const match = inputText.match(regex);

    if (!match) {
      console.warn(`Dano não encontrado para o jogador: ${nick}`);
    }

    return match ? match[1] : "0";
  };
  

  const handleInputChange = (
    inputText: string,
    dgIndex: number,
    setPresentRoles: Function,
    setMissingRoles: Function 
  ) => {
    const inputNicks = Array.from(inputText.matchAll(/([\w\d]+):/gm)).map(
      (match) => match[1].toLowerCase()
    );

    const present = roleNickPairs
      .filter(
        ({ nick, role }: { nick: string; role: string }) =>
          inputNicks.includes(nick.toLowerCase()) &&
          !["Main Healer", "OffTank"].includes(role) &&
          !morList.some(
            (morPlayer: any) =>
              morPlayer.nick.toLowerCase() === nick.toLowerCase()
          )
      )
      .map(({ nick, role }: { nick: string; role: string }) => {
        let points = 0;
        if (["X-Bow", "Raiz Férrea DPS", "Raiz Férrea", "Águia", "Frost"].includes(role)) {
          points = 0;
        } else {
          points = 1;
        }
        return {
          nick,
          role,
          damage: extractDamage(inputText, nick),
          points,
        };
      });

    const maxDps = Math.max(
      ...present.map((player: { nick: string; role: string; damage: string; points: number }) => parseFloat(player.damage) || 0)
    );

    const presentWithScores = present.map((player: { nick: string; role: string; damage: string; points: number }) => {
      const score = calculateScore(parseFloat(player.damage), maxDps);
      return { ...player, points: scoreOverride[player.nick] ?? score };
    });

    setPresentRoles((prev: any[]) => {
      const updated = [...prev];
      updated[dgIndex] = presentWithScores.sort(
        (a: { nick: string; role: string; damage: string; points: number }, b: { nick: string; role: string; damage: string; points: number }) => parseFloat(b.damage) - parseFloat(a.damage)
      );
      return updated;
    });

    console.log(morList)


    

    const missing = roleNickPairs.filter(      

      ({ nick }: { nick: string }) =>
        !inputNicks.includes(nick.toLowerCase()) &&
        !morList.some(
          (morPlayer: any) =>
            morPlayer.nick.toLowerCase() === nick.toLowerCase()
        )
    );

    setMissingRoles((prev: any[]) => {
      const updated = [...prev];
      updated[dgIndex] = missing;
      return updated;
    });
  };


  const calculateScore = (dps: number, maxDps: number) => {
    const percentage = (dps / maxDps) * 100;

    if (percentage >= 85) return 2;
    if (percentage >= 60) return 1;
    if (percentage < 50) return -1;
    return 0;
  };


  const handleAddToMeeter = (
    nick: string,
    role: string,
    dgIndex: number,
    setPresentRoles: Function,
    setMissingRoles: Function
  ) => {
    const newPlayer = { nick, role, damage: "0", points: 0 };
    setPresentRoles((prev: any[]) => {
      const updated = [...prev];
      updated[dgIndex] = [...updated[dgIndex], newPlayer];
      return updated;
    });
    setMissingRoles((prev: any[]) => {
      const updated = [...prev];
      updated[dgIndex] = updated[dgIndex].filter(
        (player: any) => player.nick !== nick
      );
      return updated;
    });
  };

  const handleScoreChange = (nick: string, score: number) => {
    setScoreOverride((prev) => ({ ...prev, [nick]: score }));
  };

  const addNewDG = () => {
    setTextDGs((prev) => [...prev, ""]);
    setPresentRolesDGs((prev) => [...prev, []]);
    setMissingRolesDGs((prev) => [...prev, []]);
  };

  const calculateTotalPoints = () => {
    const allPlayers = new Map();

    presentRolesDGs.flat().forEach((player) => {
      if (!allPlayers.has(player.nick)) {
        allPlayers.set(player.nick, { nick: player.nick, role: player.role, points: 0 });
      }
      allPlayers.get(player.nick).points += player.points;
    });

    return Array.from(allPlayers.values());
  };

  const handlePlayerEdit = (nick: string, role: string) => {
    setEditingNick(nick);
    setNewNick(nick);
    setNewRole(role);
  };

  const savePlayerEdit = () => {
    setPresentRolesDGs((prev) =>
      prev.map((dg) =>
        dg.map((player) =>
          player.nick === editingNick
            ? { ...player, nick: newNick, role: newRole }
            : player
        )
      )
    );
    setEditingNick(null);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 active:scale-95 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Abrir Inserção
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] p-6 rounded-lg w-[1000px] max-h-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-300 flex justify-center">
            Calcular Meeter
          </DialogTitle>
          <DialogDescription className="text-gray-400 flex flex-col gap-4 items-center justify-center">
            Insira os dados de cada DG para calcular as pontuações.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-9 justify-center">
          {textDGs.map((textDG, index) => (
            <motion.div
              key={index}
              className="p-4 bg-[#2A2A2A] rounded-lg mb-6"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-lg font-semibold text-purple-300 mb-3">
                DG {index + 1}
              </h3>
              <textarea
                value={textDG}
                onChange={(e) => {
                  const updatedTextDGs = [...textDGs];
                  updatedTextDGs[index] = e.target.value;
                  setTextDGs(updatedTextDGs);
                  handleInputChange(
                    e.target.value,
                    index,
                    setPresentRolesDGs,
                    setMissingRolesDGs
                  );
                }}
                className="w-full p-3 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder={`Insira o log do DG ${index + 1}`}
                rows={4}
              ></textarea>

              <div className="mt-4">
                <h4 className="text-purple-400 font-semibold">{`Presentes (jogadores que constam no meeter e no forms)`}</h4>
                <ul className="text-gray-300">
                  {presentRolesDGs[index].map((player, playerIndex) => (
                    <li
                      key={playerIndex}
                      className="flex py-2 border-b border-gray-600"
                    >
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => handlePlayerEdit(player.nick, player.role)}
                      >
                      </div>
                      <div className="flex flex-1 items-center">
                        <span className="">{player.nick}</span>
                        <span>
                          <Image
                            src={
                              DefaultRoles.find((role) => role.value === player.role)?.icon ?? '/path/to/default/icon.png'
                            }
                            alt={player.role}
                            width={20}
                            height={20}
                            className="mx-2"
                          />
                        </span> - Dano: {Number(player.damage).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Pontos:</span>
                        <input
                          type="number"
                          value={
                            scoreOverride[player.nick] ??
                            player.points.toString()
                          }
                          onChange={(e) =>
                            handleScoreChange(player.nick, +e.target.value)
                          }
                          className="w-12 p-1 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="text-purple-400 font-semibold">{`Ausentes (jogadores que constam no forms porem não no meeter)`}</h4>
                <ul className="text-gray-300">
                  {missingRolesDGs[index].map((player, playerIndex) => (
                    <li
                      key={playerIndex}
                      className="flex items-center justify-between py-2 border-b border-gray-600"
                    >
                      {player.nick} ({player.role})
                      <button
                        onClick={() =>
                          handleAddToMeeter(
                            player.nick,
                            player.role,
                            index,
                            setPresentRolesDGs,
                            setMissingRolesDGs
                          )
                        }
                        className="px-3 py-1 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
                      >
                        Adicionar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={addNewDG}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 mt-6"
        >
          Adicionar Nova DG
        </button>
        <div className="mt-6">
          <h3 className="text-xl text-purple-400 font-bold">Pontuações Totais:</h3>
          <ul className="text-gray-300 mt-3">
            {calculateTotalPoints().map((player, index) => (
              <li
                key={index}
                className="flex justify-between py-2 border-b border-gray-600"
              >
                {editingNick === player.nick ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newNick}
                      onChange={(e) => setNewNick(e.target.value)}
                      className="p-2 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                                alt={selectRole.label}
                                width={26}
                                height={26}
                                className="ml-2"
                              />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={savePlayerEdit}
                      className="px-3 py-1 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                    >
                      Salvar
                    </button>
                  </div>

                ) : (
                  <div
                    className="cursor-pointer hover:underline flex justify-center items-center space-x-2"
                    onClick={() => handlePlayerEdit(player.nick, player.role)}
                  >
                    <span>{player.nick}</span>
                    <span className="text-gray-500">({player.role})</span>
                    <span>
                      <Image
                        src={
                          DefaultRoles.find((role) => role.value === player.role)?.icon ?? '/path/to/default/icon.png'
                        }
                        alt={player.role}
                        width={20}
                        height={20}
                        className="ml-2"
                      />
                    </span>
                    <span className="ml-2">- Pontos: {player.points}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
