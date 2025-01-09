'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/app/components/Header"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from 'uuid'

export default function CreateDungeonPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const creatorName = session?.user?.nick || "maintank";

  const [name, setName] = useState("")

  const roles = [
    {"MainTank": {
      "nick": creatorName
    }}
  ]

  const [eventId] = useState(uuidv4())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()


    try {
      await fetch('/api/createDungeon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, creatorName, roles, eventId })
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create dungeon:", error)
    }
  }

  return (
    <div className="mx-auto">
      <Header />
      <div className="max-w-md mx-auto mt-4">
        <h1 className="text-3xl font-bold mb-6">Criar Dungeon</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da DG</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full shadow-sm hover:bg-[#747474] bg-[#1A1A1A]">Criar Dungeon</Button>
        </form>
      </div>
    </div>
  )
}