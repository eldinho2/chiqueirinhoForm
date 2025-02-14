"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import localFont from "next/font/local"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Header from "./components/Header"
import Leaderboard from "@/app/components/leaderboard/Leaderboard"
import RoleLeaderboard from "@/app/components/leaderboard/RoleLeaderboard"
import HighestEloLeaderboard from "@/app/components/leaderboard/HighestEloLeaderboard"
import Loading from "@/utils/Loading"

const koch = localFont({
  src: "../public/fonts/Koch Fraktur.ttf",
  weight: "100",
})

const fetchAllTimePlayersData = async () => {
  const response = await fetch("/api/getAllTimePlayersData")
  if (!response.ok) {
    throw new Error("Failed to fetch all-time players data")
  }
  return response.json()
}

export default function Home() {
  const [activeLeaderboard, setActiveLeaderboard] = useState("total")

  const {
    data: allTimePlayersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allTimePlayersData"],
    queryFn: fetchAllTimePlayersData,
  })

  const enhancedPlayers = allTimePlayersData?.data || []

  // const handleGetHistory = async () => {
  //   try {
  //     const response = await fetch("/api/getLastWeekDungeons");
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch all-time players data");
  //     }
  //     const data = await response.json();
  
  //     const playerParticipation = {};
  
  //     data.forEach((dungeon) => {
  //       dungeon.players.forEach((player) => {
  //         if (!playerParticipation[player.nick]) {
  //           playerParticipation[player.nick] = {
  //             name: player.nick,
  //             participateDungeons: 0,
  //           };
  //         }
  //         playerParticipation[player.nick].participateDungeons += 1;
  //       });
  //     });
      
  //     const result = Object.values(playerParticipation);
  //     const filteredResult = result.sort((a, b) => b.participateDungeons - a.participateDungeons).filter((player) => player.participateDungeons > 1);
  //     console.log(filteredResult);
  //   } catch (error) {
  //     console.error("Error fetching player history:", error);
  //   }
  // };
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="">
        <motion.h1
          className={`${koch.className} font-koch text-6xl mt-6 flex justify-center mb-2 text-white`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Chiqueirinho Avaloniano
        </motion.h1>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <motion.div
              className="flex justify-center space-x-4 mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                onClick={() => setActiveLeaderboard("total")}
                variant="outline"
                className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
                  activeLeaderboard === "total" ? "bg-zinc-400" : ""
                }`}
              >
                Pontos Totais
              </Button>
              <Button
                onClick={() => setActiveLeaderboard("role")}
                variant="outline"
                className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
                  activeLeaderboard === "role" ? "bg-zinc-400" : ""
                }`}
              >
                Pontos por Role
              </Button>
              <Button
                onClick={() => setActiveLeaderboard("highestElos")}
                variant="outline"
                className={`text-sm border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 ${
                  activeLeaderboard === "highestElos" ? "bg-zinc-400" : ""
                }`}
              >
                Jogadores com maior Elo
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-sm"
            >
              {activeLeaderboard === "total" && <Leaderboard players={enhancedPlayers} />}
              {activeLeaderboard === "role" && <RoleLeaderboard players={enhancedPlayers} />}
              {activeLeaderboard === "highestElos" && <HighestEloLeaderboard players={enhancedPlayers} />}
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}

