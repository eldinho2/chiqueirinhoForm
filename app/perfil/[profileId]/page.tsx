'use client'

import { useParams } from "next/navigation";
import { Flame, Clock, GamepadIcon } from 'lucide-react';
import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import Loading from "@/utils/Loading";
import { roles } from '@/lib/roles'
import Image from "next/image";
import { EloPanel } from "@/app/components/profile/EloPanel";
import ErrorPage from "@/utils/ErrorPage";

export default function ProfileComponent() {
  const { profileId } = useParams()
  
  interface Profile {
    user: {
      id: string;
      userID: string;
      banner?: string;
      image?: string;
      name?: string;
      username?: string;
      profilename?: string;
      email?: string; 
    },
    highestStats: {
      totalParticipations: number;
      mostFrequentRole: string;
      highestDamage: number;
      highestDps: number;
      highestMaxPercentage: number;
      totalPoints: number;
    },
    lastFiveDungeons: {
      date: string;
      nick: string;
      role: string;
      points: string;
      heal: string;
      damage: string;
      maxPercentage: string;
      maxDps: string;
    }[]
  }

  const dpsRoles = [
    "X-Bow",
    "Raiz Férrea DPS",
    "Raiz Férrea",
    "Águia",
    "Frost",
    "Fire",
  ];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    
  useEffect(() => {
    const fetchDungeons = async () => {
      if (profileId) {
        const response = await fetch(`/api/getUserProfile/${profileId}`)
        const data = await response.json()
        setProfile(data)
        setIsLoading(false)
      }
    }
    fetchDungeons()
  }, [profileId])    

  console.log(profile);
  

  const bannerUrl = profile?.user?.banner ? `https://cdn.discordapp.com/banners/${profile.user.userID}/${profile.user.banner}.gif?size=480` : null;

  const getRoleIcon = (role: string) => roles.find((r) => r.value === role)?.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nicknamenormalized = profile?.user?.name?.charAt(0).toUpperCase() as any + profile?.user?.name?.slice(1);

  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <GamepadIcon className="w-16 h-16 text-gray-500 mb-4 animate-bounce" />
      <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Nenhum dado disponível ainda
      </h3>
      <p className="text-gray-400 max-w-md">
        Jogue uma partida para começar a registrar suas estatísticas e histórico de jogos!
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-200">
      <Header />
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="relative mb-16">
            <div className={`p-1 ${bannerUrl ? 'bg-gradient-to-r from-purple-700 via-pink-700 to-red-700' : 'bg-gradient-to-r from-gray-800 to-gray-700'} rounded-2xl shadow-lg`}>
              {bannerUrl ? (
                <Image src={bannerUrl} width={1920} height={480} alt="Banner" className="w-full h-64 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-64 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                  <Flame className="w-20 h-20 text-gray-600" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-16 left-8">
              <div className="p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-lg">
                <Image 
                  src={profile?.user?.image || "/chiqueirinhologo.webp"} 
                  width={140} 
                  height={140} 
                  alt="Avatar" 
                  className="rounded-full border-4 border-[#1A1A1A]"
                />
              </div>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#141414] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#111111]">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {nicknamenormalized || "Unknown Adventurer"}
                  </h1>
                  <p className="text-gray-400 text-sm">Pontos totais: {profile?.highestStats?.totalPoints || 0}</p>
                </div>
                <p className="text-gray-400 text-base">@{profile?.user?.username || "username"}</p>
              </div>
              <div className="bg-[#141414] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#111111]">
                <h2 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Histórico
                </h2>
                {profile?.lastFiveDungeons?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-[#111111]">
                          <th className="pb-2 text-sm font-medium text-gray-400">Data</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">Role</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">Cura Lançada</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">Dano</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">DPS</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">%</th>
                          <th className="pb-2 text-sm font-medium text-gray-400">Pontos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.lastFiveDungeons.map((dungeon, index) => (
                          <tr key={index} className="border-b border-[#111111] last:border-0">
                            <td className="py-3 text-sm">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {formatDate(dungeon?.date)}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center">
                                <Image 
                                  src={getRoleIcon(dungeon.role) || ""} 
                                  width={20} 
                                  height={20} 
                                  alt={dungeon.role} 
                                  className="mr-2"
                                />
                                <span className="text-sm">{dungeon.role}</span>
                              </div>
                            </td>
                            {dungeon.heal === "0" ? <td className="py-3 text-sm">0</td> : <td className="py-3 text-sm">{parseInt(dungeon.heal).toLocaleString()}</td>}
                            {dungeon.damage === "0" ? <td className="py-3 text-sm">0</td> : <td className="py-3 text-sm">{parseInt(dungeon.damage).toLocaleString()}</td>}
                            <td className="py-3 text-sm">{dungeon.maxDps}</td>
                            <td className="py-3 text-sm">{dungeon.maxPercentage}</td>
                            <td className="py-3 text-sm flex items-center justify-center text-green-300">{Math.sign(dungeon.points as any) >= 0 ? "+" : "-"}{Math.abs(dungeon.points as any)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <NoDataMessage />
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#111111]">
                <EloPanel profile={profile} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}