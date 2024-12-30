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

export function calculateHighestStats(participacoes) {
  let highestDamage = 0;
  let highestMaxDps = 0;
  let highestMaxPercentage = 0;
  let roleOccurrences = {};
  let totalParticipations = 0;
  let totalPoints = 0;

  let rolePoints = {};

  participacoes.forEach((participacao) => {
    //console.log(participacao);
    
    totalParticipations++;

    totalPoints += participacao.points;

    const role = participacao.role;
    rolePoints[role] = (rolePoints[role] || 0) + participacao.points;

    const damage = parseInt(participacao.damage.replace(',', ''));
    if (damage > highestDamage) {
      highestDamage = damage;
    }

    const maxDps = parseFloat(participacao.maxDps.replace(',', '.'));
    if (maxDps > highestMaxDps) {
      highestMaxDps = maxDps;
    }

    const maxPercentage = parseFloat(participacao.maxPercentage.replace(',', '.'));
    if (maxPercentage > highestMaxPercentage) {
      highestMaxPercentage = maxPercentage;
    }

    roleOccurrences[participacao.role] = (roleOccurrences[participacao.role] || 0) + 1;
  });

  let mostFrequentRole = '';
  let maxRoleCount = 0;
  for (const [role, count] of Object.entries(roleOccurrences)) {
    if (count > maxRoleCount) {
      mostFrequentRole = role;
      maxRoleCount = count;
    }
  }

  const rolesWithPoints = Object.entries(rolePoints).map(([role, points]) => ({
    role,
    points
  }));

  return {
    highestDamage,
    highestMaxDps,
    highestMaxPercentage,
    mostFrequentRole,
    roleWhithMorePoints: rolesWithPoints.sort((a, b) => b.points - a.points)[0],
    totalParticipations,
    totalPoints,
    rolesWithPoints
  };
}
