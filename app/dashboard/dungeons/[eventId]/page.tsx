/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Header from "@/app/components/Header"
import { useState, useEffect } from "react"
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import Loading from "@/utils/Loading"


interface Role {
    value: string
    label: string
    icon: string
}

interface DungeonDetails {
    name: string
    roles: Role[]
}



const roles: Role[] = [
  { value: "OffTank", label: "OffTank", icon: "/rolesIcons/offtank.webp" },
  { value: "Arcano Silence", label: "Arcano Silence", icon: "/rolesIcons/arcanosilence.webp" },
  { value: "Arcano Elevado", label: "Arcano Elevado", icon: "/rolesIcons/arcanoelevado.webp" },
  { value: "Main Healer", label: "Main Healer", icon: "/rolesIcons/mainhealer.webp" },
  { value: "Bruxo", label: "Bruxo", icon: "/rolesIcons/bruxo.webp" },
  { value: "Raiz Férrea", label: "Raiz Férrea", icon: "/rolesIcons/raiz.webp" },
  { value: "Raiz Férrea - DPS", label: "Raiz Férrea - DPS", icon: "/rolesIcons/raizDps.webp" },
  { value: "X-Bow", label: "X-Bow", icon: "/rolesIcons/xbow.webp" },
  { value: "Quebra Reinos", label: "Quebra Reinos", icon: "/rolesIcons/quebrareinos.webp" },
  { value: "Incubus", label: "Incubus", icon: "/rolesIcons/incubus.webp" },
  { value: "Oculto", label: "Oculto", icon: "/rolesIcons/oculto.png" },
]

export default function Dungeons() {
    const params = useParams()
    const eventId = params.eventId

    const [dungeonsDetails, setDungeonsDetails] = useState<DungeonDetails[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDungeonsDetails = async () => {
            const response = await fetch(`/api/getDungeon/${eventId}`)
            const data = await response.json()
            setDungeonsDetails(data)
            setIsLoading(false)
        }
        fetchDungeonsDetails()
    }, [eventId])
    const filterUsersByRole = (roleName: string) => {
        const roleUsers = dungeonsDetails[0]?.roles?.filter((role: any) => 
            Object.keys(role)[0] === roleName
        ).map((role: any) => ({
            nick: role[roleName]?.nick,
            ip: role[roleName]?.ip || '0',
            hasMor: role[roleName]?.hasMor || false
        })) ?? [];

        return roleUsers.sort((a, b) => {
            if (a.hasMor !== b.hasMor) {
                return b.hasMor ? 1 : -1;
            }
            return parseInt(b.ip) - parseInt(a.ip);
        });
    }

    const renderPlayerSlot = (role: Role) => {
        const players = filterUsersByRole(role.value);
        return (
            <Card key={role.value} className="flex flex-col border border-[#2A2A2A] p-4 rounded-md">
                <div className="flex items-center gap-3 mb-3">
                    <Image src={role.icon} alt={role.label} width={32} height={32} className="rounded" />
                    <span className="text-gray-200 text-base font-medium">{role.label}</span>
                </div>
                {players && players.length > 0 ? (
                    <div className="space-y-2">
                        {players.map((player, index: number) => (
                            <div key={index} className="flex items-center gap-3 pl-3">
                                <span className="text-sm text-gray-400">{String(index + 1).padStart(2, '0')}</span>
                                <span className={`text-base ${player.hasMor ? 'text-green-400' : 'text-gray-300'}`}>
                                    {player.nick}
                                    <span className="ml-2 text-sm text-gray-500">
                                        {player.ip !== '0' && `(${player.ip})`}
                                        {player.hasMor && ' ★'}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="pl-3">
                        <span className="text-base text-gray-500">Empty</span>
                    </div>
                )}
            </Card>
        )
    }

    console.log(dungeonsDetails[0]?.roles)

    if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loading /></div>

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white">
            <Header />
            <main className="container mx-auto p-6">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-8 text-center">{dungeonsDetails[0]?.name || 'Loading...'}</h1>
                    <span className="text-gray-400 text-sm mb-4">{dungeonsDetails[0]?.roles.length} pings</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {roles.map(role => renderPlayerSlot(role))}
                </div>
            </main>
        </div>
    )
}