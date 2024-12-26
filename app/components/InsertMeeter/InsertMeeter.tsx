"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { roles as DefaultRoles } from "@/lib/roles";

interface Player {
  nick: string;
  role: string;
  damage: string;
  percentage: string;
  perSecond: string;
  heal: string;
  points: number;
}

interface TextDG {
  general: string;
  healers: string;
}

interface InsertMeeterProps {
  dungeon: any;
  morList: any;
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
  const [missingRolesDGs, setMissingRolesDGs] = useState<RoleNickPair[][]>([
    [],
    [],
  ]);
  const [combinedRolesDGs, setCombinedRolesDGs] = useState<Player[][]>([[], []]);
  const [scoreOverride, setScoreOverride] = useState<{
    [nick: string]: number;
  }>({});
  const [activeTab, setActiveTab] = useState<number>(0);
  const [absentPlayers, setAbsentPlayers] = useState<RoleNickPair[]>([]);

  const roles = dungeon[0].roles;

  const roleNickPairs: RoleNickPair[] = roles.map((role: any) => {
    const [roleName, roleData] = Object.entries(role)[0];
    return {
      role: roleName,
      nick: (roleData as { nick: string }).nick,
    };
  });

  const extractHPS = (inputText: string, nick: string): string => {
    const regex = new RegExp(`${nick}:\\s*(\\d+)\\(.*?\\|.*?HPS`, "i");
    const match = inputText.match(regex);

    if (!match) {
      console.warn(`HPS não encontrado para o jogador: ${nick}`);
    }

    return match ? match[1] : "0";
  };

  const extractDPS = (
    inputText: string,
    nick: string
  ): { total: string; percentage: string; perSecond: string } => {
    const regex = new RegExp(
      `${nick}:\\s*(\\d+)\\((\\d+,\\d+)%\\)\\|(\\d+,\\d+)\\s*DPS`,
      "i"
    );
    const match = inputText.match(regex);

    if (!match) {
      console.warn(`DPS não encontrado para o jogador: ${nick}`);
    }

    return match
      ? { total: match[1], percentage: match[2], perSecond: match[3] }
      : { total: "0", percentage: "0%", perSecond: "0" };
  };

  const calculateScore = (
    dps: number,
    maxDps: number,
    isTopDps: boolean
  ): number => {
    if (isTopDps) return 2;
    const percentage = (dps / maxDps) * 100;

    if (percentage >= 60) return 1;
    if (percentage < 50) return -1;
    return 0;
  };

  const handleInputChange = (
    inputText: string,
    dgIndex: number,
    setPresentRoles: React.Dispatch<React.SetStateAction<Player[][]>>,
    setMissingRoles: React.Dispatch<React.SetStateAction<RoleNickPair[][]>>,
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
          !["MainTank", "Scout"].includes(role) &&
          !morList.some(
            (morPlayer: any) =>
              morPlayer.nick.toLowerCase() === nick.toLowerCase()
          )
      )
      .map(({ nick, role }) => {
        let points = 1;
        if (dpsRoles.includes(role)) {
          points = 0;
        }
        if (isHealerText) {
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
          points,
        };
      });

    const damageRoles = present.filter((player) =>
      dpsRoles.includes(player.role)
    );
    const otherRoles = present.filter(
      (player) => !dpsRoles.includes(player.role)
    );

    const maxDps = Math.max(
      ...damageRoles.map((player) => parseFloat(player.damage) || 0)
    );

    const topDpsPlayer = damageRoles.find(
      (player) => parseFloat(player.damage) === maxDps
    );

    const damageRolesWithScores = damageRoles.map((player) => {
      const isTopDps = player === topDpsPlayer;
      const score = calculateScore(
        parseFloat(player.damage) || 0,
        maxDps,
        isTopDps
      );
      return { ...player, points: scoreOverride[player.nick] ?? score };
    });

    const presentWithScores = [...damageRolesWithScores, ...otherRoles];

    setPresentRoles((prev) => {
      const updated = [...prev];
      updated[dgIndex] = presentWithScores.sort(
        (a, b) => parseFloat(b.damage) - parseFloat(a.damage)
      );
      return updated;
    });

    console.log("Presentes:", presentWithScores);
    console.log("roleNickPairs:", roleNickPairs);

    const missing = roleNickPairs.filter(
      ({ nick, role }) =>
        !inputNicks.includes(nick.toLowerCase()) &&
        !["MainTank", "Scout"].includes(role) &&
        !morList.some(
          (morPlayer: any) =>
            morPlayer.nick.toLowerCase() === nick.toLowerCase()
        )
    );

    console.log("Ausentes:", missing);

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
    handleInputChange(
      newText,
      index,
      setPresentRolesDGs,
      setMissingRolesDGs,
      isHealerText
    );
  };

  const handleScoreChange = (nick: string, score: number) => {
    setScoreOverride((prev) => ({ ...prev, [nick]: score }));
    setPresentRolesDGs((prev) =>
      prev.map((dg) =>
        dg.map((player) =>
          player.nick === nick ? { ...player, points: score } : player
        )
      )
    );
  };

  const addNewDG = () => {
    setTextDGs((prev) => [...prev, { general: "", healers: "" }]);
    setPresentRolesDGs((prev) => [...prev, []]);
    setMissingRolesDGs((prev) => [...prev, []]);
    setCombinedRolesDGs((prev) => [...prev, []]);
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
          percentage: "0%",
          perSecond: "0",
          heal: "0",
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
    });

    return Array.from(allPlayers.values());
  };

  const handleSave = () => {
    const totalPoints = calculateTotalPoints();
    console.log("Pontuações Totais:", totalPoints);
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
      <DialogContent className="bg-[#1A1A1A] p-6 rounded-lg w-[1200px] max-h-[900px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-300 flex justify-center">
            Calcular Meeter
          </DialogTitle>
          <DialogDescription className="text-gray-400 flex flex-col gap-2 items-center justify-center">
            Insira os dados de cada DG para calcular as pontuações.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-center mb-4">
          <button
            className={`px-3 py-1 rounded-lg ${
              activeTab === 0
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(0)}
          >
            DG 1
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              activeTab === 1
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(1)}
          >
            DG 2
          </button>
          {textDGs.slice(2).map((_, index) => (
            <button
              key={index + 2}
              className={`px-3 py-1 rounded-lg ${
                activeTab === index + 2
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setActiveTab(index + 2)}
            >
              DG {index + 3}
            </button>
          ))}
          <button
            onClick={addNewDG}
            className="px-3 py-1 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Adicionar DG
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              activeTab === textDGs.length
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(textDGs.length)}
          >
            Pontuações Totais
          </button>
        </div>
        {textDGs.map((textDG, index) => (
          <motion.div
            key={index}
            className={`p-4 bg-[#2A2A2A] rounded-lg mb-4 ${
              activeTab === index ? "block" : "hidden"
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
                    <th className="py-2 px-4 border-b border-gray-600">Jogador</th>
                    <th className="py-2 px-4 border-b border-gray-600">Role</th>
                    <th className="py-2 px-4 border-b border-gray-600">Dano</th>
                    <th className="py-2 px-4 border-b border-gray-600">Porcentagem</th>
                    <th className="py-2 px-4 border-b border-gray-600">DPS</th>
                    <th className="py-2 px-4 border-b border-gray-600">Cura</th>
                    <th className="py-2 px-4 border-b border-gray-600">Pontos</th>
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
                        {Number(player.damage).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-600 text-center">
                        {player.percentage} %
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
                          value={scoreOverride[player.nick] ?? player.points.toString()}
                          onChange={(e) => handleScoreChange(player.nick, +e.target.value)}
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
          className={`p-4 bg-[#2A2A2A] rounded-lg mb-4 ${
            activeTab === textDGs.length ? "block" : "hidden"
          }`}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              Pontuações Totais
            </h3>
            <p className="text-gray-300">{calculateTotalPoints().length} - jogadores</p>
          </div>
          <table className="min-w-full bg-[#1A1A1A] text-gray-300 rounded-lg border border-gray-700">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-600">Jogador</th>
                <th className="py-2 px-4 border-b border-gray-600">Role</th>
                <th className="py-2 px-4 border-b border-gray-600">Dano</th>
                <th className="py-2 px-4 border-b border-gray-600">Cura</th>
                <th className="py-2 px-4 border-b border-gray-600">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {calculateTotalPoints().map((player, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-gray-600 text-center">
                    {player.nick}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 flex items-center justify-center">
                    <Image
                      src={
                        DefaultRoles.find((role) => role.value === player.role)
                          ?.icon ?? "/path/to/default/icon.png"
                      }
                      alt={player.role}
                      width={20}
                      height={20}
                      className="mx-2"
                    />{" "}
                    {player.role}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-center">
                    {Number(player.damage).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-center">
                    {Number(player.heal).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-center">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 mt-4"
          >
            Salvar
          </button>
          <div className="mt-4">
            <h4 className="text-purple-400 font-semibold">{`Ausentes (players que não preencheram o forms)`}</h4>
            <ul className="text-gray-300">
              {absentPlayers.map((player, playerIndex) => (
                <li
                  key={playerIndex}
                  className="flex items-center justify-between py-2 border-b border-gray-600"
                >
                  <p>{player.nick}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
