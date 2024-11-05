'use client'

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import FormFinished from "../components/FormFinished"

const roles = [
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

export default function Event() {
  const { eventId } = useParams()
  const [dungeons, setDungeons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserFinished, setHasUserFinished] = useState(false)

  const [selectedRole, setSelectedRole] = useState("")
  const [hasMor, setHasMor] = useState(false)
  const [hasEquip, setHasEquip] = useState("no")
  const [nick, setNick] = useState("")
  const [ip, setIp] = useState("")

  useEffect(() => {
    const fetchDungeons = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/getDungeon/${eventId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch dungeons")
        }
        const data = await response.json()
        setDungeons(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDungeons()
  }, [eventId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log({
      nick,
      ip,
      role: selectedRole,
      hasMor: hasMor,
      equipamentos83: hasMor ? hasEquip : "N/A"
    })
    setIsSubmitting(false)
    setHasUserFinished(true)
  }

  if (isLoading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>
  if (hasUserFinished) return <FormFinished />

  return (
      <main className="min-h-screen flex flex-col items-center justify-center py-6 sm:px-6 lg:px-8">
        <Image className="rounded-full" src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} />
        <div className="px-4 py-6 sm:px-0  max-w-3xl">
          <div className="shadow overflow-hidden sm:rounded-lg">
            <div className="flex flex-col items-center justify-center gap-4 px-4 py-5 sm:p-6">
              <h1>{dungeons.name}</h1>
              <h2 className="text-lg leading-6 font-medium mb-4">Disputa IP</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nick">Nick</Label>
              <Input 
                id="nick" 
                placeholder="Seu nick no jogo" 
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Qual a role que você quer disputar?</Label>
              <Select required onValueChange={(value) => setSelectedRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione sua role" />
                </SelectTrigger>
                <SelectContent className="w-full max-h-[300px] overflow-y-auto bg-black text-white">
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{role.label}</span>
                        <Image
                          src={role.icon}
                          alt={role.label}
                          width={26}
                          height={26}
                          className="ml-2"
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              <Label>Você possui MOR nesta role?</Label>
              <RadioGroup defaultValue="no" onValueChange={(value) => setHasMor(value === "yes")}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="morYes" />
                  <Label htmlFor="morYes">Sim</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="morNo" />
                  <Label htmlFor="morNo">Não</Label>
                </div>
              </RadioGroup>

              {hasMor && (
                <div className="flex flex-col gap-4">
                  <Label>MOR, está usando equipamentos 8.3 Excelente?</Label>
                  <RadioGroup defaultValue="no" onValueChange={setHasEquip}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="equipYes" />
                      <Label htmlFor="equipYes">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="equipNo" />
                      <Label htmlFor="equipNo">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>


            <div className="flex flex-col gap-2">
              <Label htmlFor="ip">IP</Label>
              <Input 
                id="ip" 
                placeholder="Seu IP na arma de disputa" 
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                required
              />
            </div>

            {!isSubmitting && (
              <Button
                disabled={isSubmitting}
              className="w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white"
              type="submit"
              >
                Enviar
              </Button>
            )}
          </form>
        </div>
      </main>
  )
}