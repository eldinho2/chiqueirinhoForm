export function calculateHighestStats(participacoes) {
  let highestDamage = 0;
  let highestMaxDps = 0;
  let highestMaxPercentage = 0;
  let roleOccurrences = {};
  let totalParticipations = 0;

  participacoes.forEach((participacao) => {
    
    totalParticipations++;

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

  return {
    highestDamage,
    highestMaxDps,
    highestMaxPercentage,
    mostFrequentRole,
    totalParticipations
  };
}
