export const extractHPS = (inputText: string, nick: string): string => {
  const normalizedInput = inputText.toLowerCase();
  const normalizedNick = nick.toLowerCase();

  const line = normalizedInput
    .split("\n")
    .find((line) => {
      const startsWithNumber = /^\d+\.\s/.test(line);
      const containsNick = line.includes(`${normalizedNick}:`);
      return (startsWithNumber || true) && containsNick;
    });

  if (!line) {
    console.warn(`HPS não encontrado para o jogador: ${nick}`);
    return "0";
  }

  const parts = line.split("|");
  const totalAndPercentage = parts[0];
  
  const totalAndPercentParts = totalAndPercentage
    .split(/[:()]/) 
    .map((part) => part.trim()); 

  const hps = totalAndPercentParts[1]; 
  return hps || "0";
};