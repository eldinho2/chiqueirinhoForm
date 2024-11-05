'use client'

import Header from "@/app/components/Header"
import { useState, useEffect, use } from "react"

interface Role {
    MainTank: string;
    MainHealer: string;
}

interface DungeonsDetails {
    name: string;
}

export default function Dungeons({ params }: { params: { eventId: string } }) {
    // @ts-expect-error - Parâmetros do Next.js ainda não estão totalmente tipados
    const resolvedParams = use(params) as { eventId: string }
    const eventId = resolvedParams.eventId

    const [dungeonsDetails, setDungeonsDetails] = useState<DungeonsDetails[]>([])
    const [roles, setRoles] = useState<Role[]>([])  

    useEffect(() => {
        const fetchDungeonsDetails = async () => {
            const response = await fetch(`/api/getDungeon/${eventId}`)
            const data = await response.json()
            setDungeonsDetails(data)
            if (data[0]?.detalhes && Array.isArray(data[0].detalhes)) {
                setRoles(data[0].detalhes as Role[])
            } else {
                setRoles([data[0]?.detalhes].filter(Boolean) as Role[])
            }
        }
        fetchDungeonsDetails()
    }, [eventId])

    console.log('Roles:', JSON.stringify(roles, null, 2))

    return (
        <div>
            <Header />
            <div>
                <h1>{dungeonsDetails[0]?.name}</h1>
                <p>{eventId}</p>
            </div>
            <div>
                {roles && roles.map((role, index) => (
                    <div key={index}>
                        <p>Tank Principal: {role.MainTank}</p>
                        <p>Healer Principal: {role.MainHealer}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}