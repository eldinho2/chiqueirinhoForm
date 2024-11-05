'use client'

import Header from "@/app/components/Header"
import { useState, useEffect } from "react"
import { useParams } from 'next/navigation'

interface Role {
    MainTank: string;
    MainHealer: string;
}

interface DungeonsDetails {
    name: string;
}

export default function Dungeons() {
    const params = useParams()

    const eventId = params.eventId

    console.log(params.eventId)

    const [dungeonsDetails, setDungeonsDetails] = useState<DungeonsDetails[]>([])
    const [roles, setRoles] = useState<Role[]>([])  

    useEffect(() => {
        const fetchDungeonsDetails = async () => {
            const response = await fetch(`/api/getDungeon/${eventId}`)
            const data = await response.json()
            setDungeonsDetails(data)
            console.log(data)
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