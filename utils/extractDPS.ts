export const extractDPS = (inputText: string, nick: string, setMissingPlayers: any, roleNickPairs: any) => {
  const normalizedInput = inputText.toLowerCase();
  const normalizedNick = nick.toLowerCase();

  const inputPlayers = normalizedInput
    .split("\n")
    .map((line) => 
      line.replace(/^\d+\.\s*/, "")
          .split(":")[0].trim()
    )
    .filter((nick) => nick);

  const allNicks = roleNickPairs.map((pair: any) => pair.nick.toLowerCase());

  const playersIntrusos = inputPlayers.filter(
    (player) => !allNicks.includes(player)
  );
  setMissingPlayers(playersIntrusos as any);

  const line = normalizedInput
    .split("\n")
    .find((line) => {
      const startsWithNumber = /^\d+\.\s/.test(line);
      const containsNick = line.includes(`${normalizedNick}:`);
      return (startsWithNumber || true) && containsNick;
    });

  if (!line) {
    console.warn(`DPS não encontrado para o jogador: ${normalizedNick}`);
    return { total: "0", percentage: "0", perSecond: "0" };
  }

  const parts = line.split("|");
  const totalAndPercentage = parts[0];
  const perSecondWithDPS = parts[1];

  const totalAndPercentParts = totalAndPercentage
    .split(/[:()]/)
    .map((part) => part.trim());
  const total = totalAndPercentParts[1];
  const percentage = totalAndPercentParts[2];

  const perSecond = perSecondWithDPS.split(" ")[0];

  return {
    total: total.replace(/\./g, ""),
    percentage: percentage.replace(",", "."),
    perSecond: perSecond,
  };
};