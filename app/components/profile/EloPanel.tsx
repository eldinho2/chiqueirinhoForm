import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Target, Percent, Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { roles } from "@/lib/roles";
import { StatItem } from "./StatItem";
import { RoleProgress } from "./RoleProgress";
import { ELOS } from "@/lib/elos";
import { motion } from 'framer-motion'


export function EloPanel({ profile }: { profile: Profile }) {
  const [eloInfo, setEloInfo] = useState(() => {
    const points = profile.highestStats.roleWhithMorePoints.points;

    const currentEloIndex = Object.entries(ELOS).findIndex(
      ([key, value], index) => {
        const prevThreshold =
          index === 0
            ? -Infinity
            : Object.entries(ELOS)[index - 1][1].threshold;
        const isInRange = points > prevThreshold && points <= value.threshold;
        return isInRange;
      }
    );

    const currentElo =
      Object.entries(ELOS)[currentEloIndex] ||
      Object.entries(ELOS).reverse()[0];

    const nextElo =
      currentEloIndex + 1 < Object.entries(ELOS).length
        ? Object.entries(ELOS)[currentEloIndex + 1][1]
        : null;

    const previousElo =
      currentEloIndex - 1 >= 0
        ? Object.entries(ELOS)[currentEloIndex - 1][1]
        : null;

    return {
      current: currentElo[1],
      next: nextElo,
      previous: previousElo,
      progress:
        (profile.highestStats.roleWhithMorePoints.points /
          currentElo[1].threshold) *
        100,
    };
  });

  useEffect(() => {
    let points = profile.highestStats.roleWhithMorePoints.points;

    const currentEloIndex = Object.entries(ELOS).findIndex(
      ([key, value], index) => {
        const nextThreshold =
          index + 1 < Object.entries(ELOS).length
            ? Object.entries(ELOS)[index + 1][1].threshold
            : Infinity;
        return points >= value.threshold && points < nextThreshold;
      }
    );

    const currentElo =
      currentEloIndex >= 0
        ? Object.entries(ELOS)[currentEloIndex]
        : Object.entries(ELOS)[0];

    const nextElo =
      currentEloIndex + 1 < Object.entries(ELOS).length
        ? Object.entries(ELOS)[currentEloIndex + 1][1]
        : null;

    const previousElo =
      currentEloIndex - 1 >= 0
        ? Object.entries(ELOS)[currentEloIndex - 1][1]
        : null;

    setEloInfo({
      current: currentElo[1],
      next: nextElo,
      previous: previousElo,
      progress: Math.min(
        ((points - currentElo[1].threshold) /
          ((nextElo?.threshold || points + 1) - currentElo[1].threshold)) *
          100,
        100
      ),
    });
  }, [profile.highestStats.roleWhithMorePoints.points]);

  console.log(eloInfo.progress.toFixed(0));
  

  const getRoleIcon = (roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon;
  };

  return (
    <div className="space-y-4">
      <Card className="border-neutral-800">
        <CardHeader>
          <div className="">
            <div className="flex justify-center items-center gap-4">
              <div>{profile.highestStats.roleWhithMorePoints.role}</div>
              <Image
                src={
                  getRoleIcon(profile.highestStats.roleWhithMorePoints.role) ||
                  ""
                }
                alt={profile.highestStats.roleWhithMorePoints.role}
                width={40}
                height={40}
                className="bg-neutral-800"
              />
              <CardTitle
                className={`text-3xl font-bold flex flex-col justify-center items-center gap-4 ${eloInfo.current.textColor}`}
              >
                {eloInfo.current.name}
                <span className="ml-2 text-8xl">{eloInfo.current.icon}</span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">
                {profile.highestStats.roleWhithMorePoints.points} Pontos
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">Progresso</span>
                <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(eloInfo.progress)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
              </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-5/6 flex items-center gap-4">
                  {eloInfo.current ? (
                    <span className="flex flex-col items-center justify-center">
                      <p className={`text-sm ${eloInfo.current.textColor} `}>
                        {eloInfo.current.threshold}
                      </p>
                      <p>{eloInfo.current.icon}</p>
                    </span>
                  ) : null}
                  <div className="relative w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${eloInfo.progress}%` }}
                      className={`absolute top-0 left-0 h-full ${eloInfo.current.color} transition-all duration-300`}
                    />
                  </div>
                  {eloInfo.next ? (
                    <span className="flex flex-col items-center justify-center">
                      <p className={`text-sm ${eloInfo.next.textColor} `}>
                        {eloInfo.next.threshold}
                      </p>
                      <p>{eloInfo.next.icon}</p>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="grid grid-cols-2 gap-6">
              <StatItem
                icon={<Swords className="h-5 w-5" />}
                label="Maior Dano Causado"
                value={profile.highestStats.highestDamage.toLocaleString()}
              />
              <StatItem
                icon={<Target className="h-5 w-5" />}
                label="Maior DPS"
                value={profile.highestStats.highestMaxDps.toFixed(2)}
              />
              <StatItem
                icon={<Percent className="h-5 w-5" />}
                label="Maior Porcentagem"
                value={`${profile.highestStats.highestMaxPercentage}%`}
              />
              <StatItem
                icon={<Award className="h-5 w-5" />}
                label="Role Preferida"
                value={profile.highestStats.mostFrequentRole}
              />
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <h4 className="text-lg font-semibold mb-4 text-emerald-400">
                Roles Mais Jogadas
              </h4>
              <div className="space-y-4">
                {profile.highestStats.rolesWithPoints.map((role) => (
                  <RoleProgress
                    key={role.role}
                    role={role.role}
                    points={role.points}
                    totalPoints={profile.highestStats.roleWhithMorePoints.points}
                    ELOS={ELOS}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
