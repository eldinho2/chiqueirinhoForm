export const roles = [
  "MainTank",
  "OffTank",
  "Arcano Silence",
  "Arcano Elevado",
  "Main Healer",
  "Bruxo",
  "Quebra Reinos",
  "Incubus",
  "Oculto",
  "Raiz Férrea",
  "Raiz Férrea - DPS",
  "X-Bow",
  "Águia",
  "Frost",
  "Fire",
  "Scout",
]

import { ELOS as elos } from '@/lib/elos';

export function calculateHighestStats(participacoes) {
  let highestDamage = 0;
  let highestMaxDps = 0;
  let highestMaxPercentage = 0;
  let roleOccurrences = {};
  let totalParticipations = 0;
  let totalPoints = 0;

  let rolePoints = {};

  participacoes.forEach((participacao) => {
    totalParticipations++;
    totalPoints += participacao.points;

    const role = participacao.role;
    rolePoints[role] = (rolePoints[role] || 0) + participacao.points;

    const damage = parseInt(participacao.damage.replace(',', ''));
    if (damage > highestDamage) highestDamage = damage;

    const maxDps = parseFloat(participacao.maxDps.replace(',', '.'));
    if (maxDps > highestMaxDps) highestMaxDps = maxDps;

    const maxPercentage = parseFloat(participacao.maxPercentage.replace(',', '.'));
    if (maxPercentage > highestMaxPercentage) highestMaxPercentage = maxPercentage;

    roleOccurrences[role] = (roleOccurrences[role] || 0) + 1;
  });

  let mostFrequentRole = '';
  let maxRoleCount = 0;
  for (const [role, count] of Object.entries(roleOccurrences)) {
    if (count > maxRoleCount) {
      mostFrequentRole = role;
      maxRoleCount = count;
    }
  }

  const getEloByPoints = (points) => {
    const sortedElos = Object.values(elos).sort((a, b) => a.threshold - b.threshold);
  
    let currentEloIndex = sortedElos.findIndex((elo) => points < elo.threshold) - 1;
  
    if (currentEloIndex < 0) {
      currentEloIndex = sortedElos.length - 1;
    }
  
    const currentElo = sortedElos[currentEloIndex] || null;
    const nextElo = sortedElos[currentEloIndex + 1] || null;
  
    const progress =
      currentElo && nextElo
        ? ((points - currentElo.threshold) / (nextElo.threshold - currentElo.threshold)) * 100
        : 100;
  
    return {
      previous: currentEloIndex > 0 ? sortedElos[currentEloIndex - 1] : null,
      current: currentElo
        ? {
            name: currentElo.name,
            icon: currentElo.icon,
            threshold: currentElo.threshold,
            color: currentElo.color,
            textColor: currentElo.textColor
          }
        : {
            name: "Sem Elo",
            icon: "😇",
            threshold: 0,
            color: "bg-amber-500",
            textColor: "text-amber-500"
          },
      next: nextElo
        ? {
            name: nextElo.name,
            icon: nextElo.icon,
            threshold: nextElo.threshold,
            color: nextElo.color,
            textColor: nextElo.textColor
          }
        : null,
      progress: Math.min(progress, 100)
    };
  };
  
    const allPlayersRoles = Object.entries(rolePoints).map(([role, points]) => ({
    role,
    points,
    elo: getEloByPoints(points)
  }));

  return {
    highestDamage,
    highestMaxDps,
    highestMaxPercentage,
    mostFrequentRole,
    roleWhithMorePoints: allPlayersRoles.sort((a, b) => b.points - a.points)[0],
    totalParticipations,
    totalPoints,
    allPlayersRoles
  };
}
