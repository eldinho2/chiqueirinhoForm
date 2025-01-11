import Image from "next/image";
import { roles } from "@/lib/roles";
import { motion } from "framer-motion";

interface RoleProgressProps {
  role: string;
  points: number;
  totalPoints: number;
  ELOS: {
    [key: string]: {
      threshold: number;
      icon: string;
      color: string;
      textColor: string;
    };
  };
}

export function RoleProgress({ role, points, ELOS }: RoleProgressProps) {
  const getRoleIcon = (roleName: string) => {
    const roleData = roles.find((r) => r.value === roleName);
    return roleData?.icon;
  };

  const eloEntries = Object.entries(ELOS);

  const currentEloIndex = eloEntries.findIndex(
    ([, value], index) => {
      const nextThreshold =
        index + 1 < eloEntries.length ? eloEntries[index + 1][1].threshold : Infinity;
      return points >= value.threshold && points < nextThreshold;
    }
  );

  const currentElo = eloEntries[currentEloIndex] || eloEntries[0];
  const nextElo = currentEloIndex + 1 < eloEntries.length ? eloEntries[currentEloIndex + 1][1] : null;
  const previousElo = currentEloIndex - 1 >= 0 ? eloEntries[currentEloIndex - 1][1] : null;

  const progress = Math.min(
    ((points - currentElo[1].threshold) /
      ((nextElo?.threshold || points + 1) - currentElo[1].threshold)) * 100,
    100
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src={getRoleIcon(role) || ""}
            alt={role}
            width={32}
            height={32}
            className="rounded-full bg-neutral-800"
          />
          <span className="font-medium text-neutral-200">{role}</span>
        </div>
        <div className="flex items-center gap-3">
          {previousElo && (
            <div className="flex flex-col items-center">
              <span className={`text-xs font-bold ${currentElo[1].textColor}`}>
                {currentElo[1].threshold}
              </span>
              <span className="text-lg">{currentElo[1].icon}</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${currentElo[1]?.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className={`flex gap-2 items-center ${currentElo[1].textColor}`}>
              {points} <p className="text-xs">pontos</p>
            </span>
          </div>
          {nextElo && (
            <div className="flex flex-col items-center">
              <span className={`text-xs font-bold ${nextElo.textColor}`}>
                {nextElo.threshold}
              </span>
              <span className="text-lg">{nextElo.icon}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
