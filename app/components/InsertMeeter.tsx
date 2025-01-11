"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { roles as DefaultRoles } from "@/lib/roles";
import eloService from "@/utils/eloService";
import { v4 as uuidv4 } from 'uuid';

interface Player {
  nick: string;
  role: string;
  damage: string;
  maxPercentage: string;
  maxDps: string;
  heal: string;
  points: number;
  percentage: string;
  perSecond: string;
}

interface TextDG {
  general: string;
  healers: string;
}

interface RoleNickPair {
  role: string;
  nick: string;
}

interface InsertMeeterProps {
  dungeon: {
    roles: { [key: string]: { nick: string } }[];
    name: string;
    eventId: string;
  }[];
  morList: { nick: string }[];
}

const dpsRoles = [
  "X-Bow",
  "Raiz Férrea DPS",
  "Raiz Férrea",
  "Águia",
  "Frost",
  "Fire",
];



export function InsertMeeter({ dungeon, morList }: InsertMeeterProps) {
  const [textDGs, setTextDGs] = useState<TextDG[]>([
    { general: "", healers: "" },
    { general: "", healers: "" },
  ]);
  const [presentRolesDGs, setPresentRolesDGs] = useState<Player[][]>([[], []]);
  const [warningWasRead, setWarningWasRead] = useState(false);
  const [, setMissingRolesDGs] = useState<RoleNickPair[][]>([[], []]);
  const [combinedRolesDGs, setCombinedRolesDGs] = useState<Player[][]>([
    [],
    [],
  ]);
  const [scoreOverride, setScoreOverride] = useState<{
    [nick: string]: number;
  }>({});
  const [activeTab, setActiveTab] = useState<number>(0);
  const [, setAbsentPlayers] = useState<RoleNickPair[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [missingPlayers, setMissingPlayers] = useState<RoleNickPair[]>([]);

  const roles = dungeon[0].roles;

  const roleNickPairs: RoleNickPair[] = roles.map(
    (role: { [key: string]: { nick: string } }) => {
      const [roleName, roleData] = Object.entries(role)[0];
      return {
        role: roleName,
        nick: (roleData as { nick: string }).nick,
      };
    }
  );

  const extractHPS = (inputText: string, nick: string): string => {
    const normalizedInput = inputText.toLowerCase();
    const normalizedNick = nick.toLowerCase();

    const regex = new RegExp(`${normalizedNick}:\\s*(\\d+)\\(.*?\\|.*?HPS`, "i");
    const match = normalizedInput.match(regex);

    if (!match) {
      console.warn(`HPS não encontrado para o jogador: ${nick}`);
    }

    return match ? match[1] : "0";
  };

  const extractDPS = (inputText: string, nick: string) => {
    const normalizedInput = inputText.toLowerCase();
    const normalizedNick = nick.toLowerCase();

    // Extrai os jogadores removendo o número e ponto no início
    const inputPlayers = normalizedInput
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").split(":")[0].trim()) // Remove número e ponto no início
      .filter((nick) => nick);

    const allNicks = roleNickPairs.map((pair) => pair.nick.toLowerCase());

    const playersIntrusos = inputPlayers.filter(
      (player) => !allNicks.includes(player)
    );

    setMissingPlayers(playersIntrusos as any);

    // Encontra a linha correta considerando o número no início e o nick
    const line = normalizedInput
      .split("\n")
      .find((line) => {
        // Garante que a linha começa com número e ponto (1., 2., etc.)
        const startsWithNumber = /^\d+\.\s/.test(line);
        return startsWithNumber && line.includes(`${normalizedNick}:`);
      });

    if (!line) {
      console.warn(`DPS não encontrado para o jogador: ${normalizedNick}`);
      return { total: "0", percentage: "0", perSecond: "0" };
    }

    const parts = line.split("|");
    const totalAndPercentage = parts[0];
    const perSecondWithDPS = parts[1];

    const totalAndPercentParts = totalAndPercentage.split(/[:()]/).map((part) => part.trim());
    const total = totalAndPercentParts[1];
    const percentage = totalAndPercentParts[2];

    return {
      total: total.replace(/\./g, ""),
      percentage: percentage.replace(",", "."),
      perSecond: perSecondWithDPS.split(' ')[0],
    };
  };


  const calculateDpsScore = (
    dps: number,
    maxDps: number,
    isTopDps: boolean
  ): number => {
    if (isTopDps) return 2;
    const percentage = (dps / maxDps) * 100;

    if (percentage >= 85) return 1;
    if (percentage < 65) return -1;
    return 0;
  };

  const calculateRaizScore = (
    dps: number,
    maxDps: number,
    isTopDps: boolean
  ): number => {
    if (isTopDps) return 2;
    const percentage = (dps / maxDps) * 100;

    if (percentage >= 75) return 1;
    if (percentage < 65) return -1;
    return 0;
  };

  const handleInputChange = (
    inputText: string,
    dgIndex: number,
    setPresentRoles: React.Dispatch<React.SetStateAction<Player[][]>>,
    isHealerText: boolean = false
  ) => {
    const inputNicks = Array.from(inputText.matchAll(/([\w\d]+):/gm)).map(
      (match) => match[1].toLowerCase()
    );

    setTextDGs((prev) => {
      const updatedTextDGs = [...prev];
      if (isHealerText) {
        updatedTextDGs[dgIndex].healers = inputText;
      } else {
        updatedTextDGs[dgIndex].general = inputText;
      }
      return updatedTextDGs;
    });

    const combinedText = isHealerText
      ? textDGs[dgIndex].general + "\n" + inputText
      : inputText + "\n" + textDGs[dgIndex].healers;

    const present = roleNickPairs
      .filter(
        ({ nick, role }) =>
          inputNicks.includes(nick.toLowerCase()) &&
          !morList.some(
            (morPlayer: { nick: string }) =>
              morPlayer.nick.toLowerCase() === nick.toLowerCase()
          )
      )
      .map(({ nick, role }) => {
        let points = 1;
        if ("Raiz Férrea".includes(role)) {
          points = 1;
        }
        if (dpsRoles.includes(role)) {
          points = 0;
        }

        const dpsData = extractDPS(combinedText, nick);

        let heal = extractHPS(combinedText, nick);
        heal = isNaN(parseFloat(heal)) ? "0" : heal;
        return {
          nick,
          role,
          damage: dpsData.total,
          percentage: dpsData.percentage,
          perSecond: dpsData.perSecond,
          heal,
          points: dpsRoles.includes(role) ? points : points,
          maxPercentage: "0%",
          maxDps: "0",
        };
      });

    const damageRoles = present.filter((player) =>
      dpsRoles.includes(player.role)
    );
    const otherRoles = present.filter(
      (player) => !dpsRoles.includes(player.role)
    );
    const raizRoles = present.filter((player) =>
      "Raiz Férrea".includes(player.role)
    )

    const maxDps = Math.max(
      ...damageRoles.map((player) => parseFloat(player.damage) || 0)
    );

    const topDpsPlayer = damageRoles.find(
      (player) => parseFloat(player.damage) === maxDps
    );

    const damageRolesWithScores = damageRoles.map((player) => {
      const isTopDps = player === topDpsPlayer;
      const score = calculateDpsScore(
        parseFloat(player.damage) || 0,
        maxDps,
        isTopDps
      );
      return { ...player, points: scoreOverride[player.nick] ?? score };
    });


    const raizRolesWhithScores = raizRoles.map((player) => {
      const isTopDps = player === topDpsPlayer;
      const score = calculateRaizScore(
        parseFloat(player.damage) || 0,
        maxDps,
        isTopDps
      );
      return { ...player, points: scoreOverride[player.nick] ?? score };
    });


    const presentWithScores = [...damageRolesWithScores, ...otherRoles, ...raizRolesWhithScores];

    setPresentRoles((prev) => {
      const updated = [...prev];
      updated[dgIndex] = presentWithScores.sort(
        (a, b) => parseFloat(b.damage) - parseFloat(a.damage)
      );
      return updated;
    });

    const missing = roleNickPairs.filter(
      ({ nick, role }) =>
        !inputNicks.includes(nick.toLowerCase()) &&
        !morList.some(
          (morPlayer: { nick: string }) =>
            morPlayer.nick.toLowerCase() === nick.toLowerCase()
        ) &&
        !presentRolesDGs
          .flat()
          .some((player) => player.nick.toLowerCase() === nick.toLowerCase())
    );

    setAbsentPlayers((prev) => {
      const updated = [...prev, ...missing];
      return updated;
    });

    setCombinedRolesDGs((prev) => {
      const updated = [...prev];
      updated[dgIndex] = [
        ...new Map(
          [...updated[dgIndex], ...presentWithScores].map((player) => [
            player.nick,
            player,
          ])
        ).values(),
      ].sort((a, b) => parseFloat(b.damage) - parseFloat(a.damage));
      return updated;
    });
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number,
    isHealerText: boolean = false
  ) => {
    const newText = e.target.value;
    handleInputChange(newText, index, setPresentRolesDGs, isHealerText);
  };

  const handleScoreChange = (nick: string, score: number, dgIndex: number) => {
    setScoreOverride((prev) => ({ ...prev, [`${nick}-${dgIndex}`]: score }));
    setPresentRolesDGs((prev) =>
      prev.map((dg, index) =>
        index === dgIndex
          ? dg.map((player) =>
            player.nick === nick ? { ...player, points: score } : player
          )
          : dg
      )
    );
    setCombinedRolesDGs((prev) =>
      prev.map((dg, index) =>
        index === dgIndex
          ? dg.map((player) =>
            player.nick === nick ? { ...player, points: score } : player
          )
          : dg
      )
    );
  };

  const addNewDG = () => {
    setTextDGs((prev) => [...prev, { general: "", healers: "" }]);
    setPresentRolesDGs((prev) => [...prev, []]);
    setMissingRolesDGs((prev) => [...prev, []]);
    setCombinedRolesDGs((prev) => [...prev, []]);
  };

  const removeDG = (index: number) => {
    if (textDGs.length > 2) {
      setTextDGs((prev) => prev.filter((_, i) => i !== index));
      setPresentRolesDGs((prev) => prev.filter((_, i) => i !== index));
      setMissingRolesDGs((prev) => prev.filter((_, i) => i !== index));
      setCombinedRolesDGs((prev) => prev.filter((_, i) => i !== index));
      setActiveTab(0);
    }
  };

  const calculateTotalPoints = (): Player[] => {
    const allPlayers = new Map<string, Player>();

    combinedRolesDGs.flat().forEach((player) => {
      if (!allPlayers.has(player.nick)) {
        allPlayers.set(player.nick, {
          nick: player.nick,
          role: player.role,
          points: 0,
          damage: "0",
          percentage: "0",
          perSecond: "0",
          heal: "0",
          maxDps: "0",
          maxPercentage: "0",
        });
      }
      const existingPlayer = allPlayers.get(player.nick)!;
      existingPlayer.points += player.points;
      existingPlayer.damage = (
        parseFloat(existingPlayer.damage) + parseFloat(player.damage)
      ).toString();
      existingPlayer.heal = (
        parseFloat(existingPlayer.heal) + parseFloat(player.heal)
      ).toString();

      if (parseFloat(player.perSecond) > parseFloat(existingPlayer.maxDps)) {
        existingPlayer.maxDps = player.perSecond;
      }

      if (
        parseFloat(player.percentage.replace("%", "")) >
        parseFloat(existingPlayer.maxPercentage.replace("%", ""))
      ) {
        existingPlayer.maxPercentage = player.percentage;
      }
    });

    return Array.from(allPlayers.values());
  };

  const handleClearDungeon = async () => {
    const role = dungeon[0].roles
    const eventId = dungeon[0].eventId

    await fetch("/api/clearDungeon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, eventId }),
    });
  }

  const handleSave = async () => {
    setIsWarningOpen(true)

    if (warningWasRead === false) return;

    setIsWarningOpen(false)
    setIsSaving(true);
    const totalPoints = calculateTotalPoints();

    const formatedData = totalPoints.map((player) => ({
      nick: player.nick,
      role: player.role,
      points: player.points,
      damage: player.damage,
      heal: player.heal,
      maxDps: player.maxDps,
      maxPercentage: player.maxPercentage,
    }));

    const data = {
      dungeon: dungeon[0].name,
      eventId: uuidv4(),
      players: formatedData,
    };

    await fetch("/api/insertDungeonHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    eloService(formatedData);

    setIsSaving(false);
    setActiveTab(0);
    setIsDialogOpen(false);
    handleClearDungeon();
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <motion.button className={"px-6 py-3 font-semibold rounded-lg transition-all bg-purple-600 text-white hover:bg-purple-700 active:scale-95"} >
            Abrir Inserção
          </motion.button>
        </DialogTrigger>
        <DialogContent className={`bg-[#1A1A1A] p-6 rounded-lg w-[1200px] max-h-[700px] overflow-y-auto ${missingPlayers.length > 0 ? "border border-red-700" : ""}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-300 flex justify-center">
              Calcular Meeter
            </DialogTitle>
            <DialogDescription className="text-gray-400 flex flex-col gap-2 items-center justify-center">
              Insira os dados de cada DG para calcular as pontuações.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center">
            <div className="flex gap-2 justify-center mb-4">
              <button
                className={`px-3 py-1 rounded-lg ${activeTab === 0
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
                  }`}
                onClick={() => setActiveTab(0)}
              >
                DG 1
              </button>
              <button
                className={`px-3 py-1 rounded-lg ${activeTab === 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
                  }`}
                onClick={() => setActiveTab(1)}
              >
                DG 2
              </button>
              {textDGs.slice(2).map((_, index) => (
                <div key={index + 2} className="flex items-center">
                  <button
                    className={`px-3 py-1 rounded-lg ${activeTab === index + 2
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300"
                      }`}
                    onClick={() => setActiveTab(index + 2)}
                  >
                    DG {index + 3}
                  </button>
                  <button
                    onClick={() => removeDG(index + 2)}
                    className="ml-2 px-2 py-1 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                onClick={addNewDG}
                className="px-3 py-1 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Adicionar DG
              </button>
            </div>
            <div className="gap-2 flex justify-center mb-4">
              <button
                className={`px-3 py-1 rounded-lg ${activeTab === textDGs.length
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
                  }`}
                onClick={() => setActiveTab(textDGs.length)}
              >
                Pontuações Totais
              </button>
            </div>
            {missingPlayers.length > 0 && (
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  Jogadores Faltando: (não preencherãm o forms ou estão com o nick errado!)
                </h3>
                <ul className="list-disc list-inside">
                  {missingPlayers.map((player: any, index) => (
                    <li key={index}>{player}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
          {textDGs.map((textDG, index) => (
            <motion.div
              key={index}
              className={`p-4 bg-[#2A2A2A] rounded-lg mb-4 ${activeTab === index ? "block" : "hidden"
                }`}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                DG {index + 1}
              </h3>
              <div className="flex justify-around gap-2">
                <textarea
                  value={textDG.general}
                  onChange={(e) => handleTextareaChange(e, index)}
                  className="w-1/2 p-2 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder={`Log geral do DG ${index + 1}`}
                  rows={4}
                ></textarea>
                <textarea
                  value={textDG.healers}
                  onChange={(e) => handleTextareaChange(e, index, true)}
                  className="w-1/2 p-2 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder={`Log dos healers do DG ${index + 1}`}
                  rows={4}
                ></textarea>
              </div>

              <div className="mt-4">
                <h4 className="text-purple-400 font-semibold">{`Presentes`}</h4>
                <table className="min-w-full bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Jogador
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Role
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Dano
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Porcentagem
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        DPS
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Cura
                      </th>
                      <th className="py-2 px-4 border-b border-gray-600">
                        Pontos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedRolesDGs[index].map((player, playerIndex) => (
                      <tr key={playerIndex}>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          {player.nick}
                        </td>
                        <td className="py-4 px-4 border-b border-gray-600 flex items-center justify-center">
                          <Image
                            src={
                              DefaultRoles.find(
                                (role) => role.value === player.role
                              )?.icon ?? "/path/to/default/icon.png"
                            }
                            alt={player.role}
                            width={25}
                            height={25}
                            className="mx-2"
                          />
                          {player.role}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          {Number(player.damage).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          {player.percentage}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          {player.perSecond}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          {Number(player.heal).toLocaleString() || 0}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-600 text-center">
                          <input
                            type="number"
                            max={2}
                            min={-2}
                            value={
                              scoreOverride[`${player.nick}-${index}`] ??
                              player.points.toString()
                            }
                            onChange={(e) =>
                              handleScoreChange(
                                player.nick,
                                +e.target.value,
                                index
                              )
                            }
                            className="w-12 p-1 bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
          <motion.div
            className={`p-4 bg-[#2A2A2A] rounded-lg mb-4 ${activeTab === textDGs.length ? "block" : "hidden"
              }`}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                Pontuações Totais
              </h3>
              <p className="text-gray-300">
                {calculateTotalPoints().length} - jogadores
              </p>
            </div>
            <table className="min-w-full bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-600">Jogador</th>
                  <th className="py-2 px-4 border-b border-gray-600">Role</th>
                  <th className="py-2 px-4 border-b border-gray-600">Pontos</th>
                  <th className="py-2 px-4 border-b border-gray-600">Total de Dano</th>
                  <th className="py-2 px-4 border-b border-gray-600">Cura Total</th>
                  <th className="py-2 px-4 border-b border-gray-600">Maior DPS</th>
                  <th className="py-2 px-4 border-b border-gray-600">Maior %</th>
                </tr>
              </thead>
              <tbody>
                {calculateTotalPoints()
                  .sort((a: any, b: any) => b.damage - a.damage as any)
                  .map((player, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.nick}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 flex items-center justify-center">
                        <Image
                          src={
                            DefaultRoles.find((role) => role.value === player.role)?.icon ??
                            "/path/to/default/icon.png"
                          }
                          alt={player.role}
                          width={25}
                          height={25}
                          className="mx-2"
                        />
                        {player.role}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.points}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {Number(player.damage).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.heal}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.maxDps}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.maxPercentage}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-4">
              <button
                className="p-2 rounded-lg bg-green-600 font-bold"
                onClick={() => {
                  handleSave()
                }}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
      <Dialog open={isWarningOpen}>
        <DialogContent className="bg-[#2A2A2A] p-6 rounded-lg w-[400px]">
          <DialogTitle className="text-xl text-center font-bold text-purple-300 mb-4">
            ⚠ Aviso Importante ⚠
          </DialogTitle>
          <motion.div
            className="text-red-500 p-4 rounded-lg shadow-lg max-w-md mx-auto flex flex-col gap-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p>
              A dg será limpa após salvar.
            </p>
            <p>
              Confira os players do meeter e os que participaram da dg.
            </p>
            <p>
              Antes de salvar, verifique se todos os dados estão corretos.
            </p>
            <p>
              A operação de salvar é irreversível.
            </p>
            <p>
              Certifique-se de ter certeza de que deseja realizar essa operação.
            </p>
            <p>
              Caso tenha certeza, clique em OK para prosseguir com a operação.
            </p>
          </motion.div>
          <div className="flex justify-end">
            <DialogClose
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              onClick={() => {
                setIsWarningOpen(false);
                setWarningWasRead(true);
              }}
            >
              OK
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
