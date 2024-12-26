'use client';

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Shield, Sword, Trophy, Star } from 'lucide-react';
import Header from "@/app/components/Header";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import Loading from "@/utils/Loading";

export default function ProfileComponent() {
  const { profileId } = useParams()
  interface Profile {
    id: string;
    userID: string;
    banner?: string;
    image?: string;
    name?: string;
    username?: string;
    profilename?: string;
    email?: string;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  console.log(session?.user);
    
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

  const bannerUrl = profile?.banner ? `https://cdn.discordapp.com/banners/${profile.userID}/${profile.banner}.gif?size=480` : null;

  const level = 42;
  const xp = 7500;
  const maxXp = 10000;
  const achievements = [
    { icon: <Trophy className="w-6 h-6" />, name: "Champion" },
    { icon: <Sword className="w-6 h-6" />, name: "Warrior" },
    { icon: <Shield className="w-6 h-6" />, name: "Defender" },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      <Header />
      {isLoading ? <div className="flex items-center justify-center h-screen"> <Loading /> </div> : (
              <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="relative mb-8">
                <div className={`p-1 ${bannerUrl ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' : 'bg-pink-500'} rounded-lg shadow-lg`}>
                  {bannerUrl ? (
                    <Image src={bannerUrl} width={1920} height={480} alt="Banner" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-48 rounded-lg"></div>
                  )}
                </div>
                <div className="absolute -bottom-16 left-4">
                  <Image 
                    src={profile?.image || "/chiqueirinhologo.webp"} 
                    width={168} 
                    height={168} 
                    alt="Avatar" 
                    className="rounded-full border-4 border-[#1A1A1A] shadow-lg"
                  />
                </div>
              </div>
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
                    <p className="text-gray-400">@{profile?.username}</p>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Achievements</h2>
                    <div className="flex justify-between">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="bg-[#3A3A3A] rounded-full p-3 mb-2">
                            {achievement.icon}
                          </div>
                          <span className="text-sm">{achievement.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Level {level}</h2>
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-yellow-400 mr-2" />
                      <span>{xp} / {maxXp} XP</span>
                    </div>
                    <Progress value={(xp / maxXp) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Stats</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Wins</span>
                        <span className="font-semibold">152</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses</span>
                        <span className="font-semibold">43</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-semibold">77.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      )}
    </div>
  );
}

