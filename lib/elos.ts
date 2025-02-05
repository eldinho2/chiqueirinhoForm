
export const ELOS = {
  semElo: {
    name: "Sem Elo",
    icon: "😇",
    threshold: 0,
    color: "bg-amber-500",
    textColor: "text-amber-500",
  },
  bronze: {
    name: "Bronze",
    icon: "🥉",
    threshold: 40,
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  silver: {
    name: "Prata",
    icon: "🥈",
    threshold: 80,
    color: "bg-gray-400",
    textColor: "text-gray-400",
  },
  gold: {
    name: "Ouro",
    icon: "🥇",
    threshold: 160,
    color: "bg-yellow-400",
    textColor: "text-yellow-400",
  },
  diamante: {
    name: "Diamante",
    icon: "💎",
    threshold: 300,
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
  master: {
    name: "Mestre",
    icon: "👑",
    threshold: 500,
    color: "bg-purple-500",
    textColor: "text-purple-500",
  },
} as const;