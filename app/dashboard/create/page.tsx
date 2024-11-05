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
  const creatorName = session?.user?.name || ""

  const [name, setName] = useState("")
  const [detalhes] = useState({"MainTank": creatorName})
  const [eventId] = useState(uuidv4())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log(JSON.stringify({ name, creatorName, detalhes, eventId }))

    try {
      await fetch('/api/createDungeon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, creatorName, detalhes, eventId })
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create dungeon:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Create New Dungeon</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Dungeon Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">Create Dungeon</Button>
      </form>
    </div>
  )
}