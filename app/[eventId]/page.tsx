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
import { motion } from "framer-motion"
import Loading from "@/utils/Loading"
import ErrorPage from "@/utils/ErrorPage"
import Header from "../components/Header"
import { roles } from "@/lib/roles"
import { mutate } from 'swr'
import { useSession } from "next-auth/react"

interface Dungeons {
  name: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

export default function Event() {
  const { eventId } = useParams()
  const { data: session } = useSession()

  console.log(session?.user || {});
  

  const [dungeons, setDungeons] = useState<Dungeons[]>([])
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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido' as any)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDungeons()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const roleData = {
      [selectedRole]: {
        nick: nick,
        ip: ip,
        hasMor: hasMor,
        hasEquip: hasMor ? hasEquip : "N/A"
      }
    }

    try {
      const response = await fetch("/api/insertRole", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId, roleData })
      })
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados')
      }
      
      mutate(`/api/getDungeon/${eventId}`)
      
      setHasUserFinished(true)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setNick(session?.user.nick)
  }, [session?.user.nick])

  if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center"><Loading /></div>
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>
  if (hasUserFinished) return <FormFinished />
  if (!dungeons.length) return <ErrorPage />
  
  return (
    <main className="min-h-screen">
      <Header />
      <div className="flex flex-col justify-center items-center mt-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image className="rounded-full" src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} />
      </motion.div>

      <div className="px-4 py-6 sm:px-0 max-w-3xl">
        <motion.div 
          className="shadow overflow-hidden sm:rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-5 sm:p-6">
            <h1>{dungeons[0]?.name || "Desconhecido"}</h1>
            <h2 className="text-lg leading-6 font-medium mb-4">Disputa IP</h2>
          </div>
        </motion.div>

        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="flex flex-col gap-8 w-[300px]"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label htmlFor="nick">Nick</Label>
            <Input 
              id="nick" 
              placeholder="Seu nick no jogo" 
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label htmlFor="role">Qual a role que você quer disputar?</Label>
            <Select required onValueChange={(value) => setSelectedRole(value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione sua role" />
              </SelectTrigger>
              <SelectContent className="w-full h-[300px] overflow-y-auto bg-black text-white">
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
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4">
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
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label htmlFor="ip">IP</Label>
            <Input 
              type="number"
              id="ip" 
              placeholder="Seu IP na arma de disputa" 
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              max="2500"
              min="0"
              required
            />
          </motion.div>

          {!isSubmitting && (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                disabled={isSubmitting}
                className="w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white"
                type="submit"
              >
                Enviar
              </Button>
            </motion.div>
          )}
        </motion.form>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <footer className="flex flex-col items-center gap-2">
          <p>Desenvolvido com ❤️ por luana2</p>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span>Versão 2.0.0</span>
            <span>•</span>
          </div>
          <p className="mt-2">© {new Date().getFullYear()} Chiqueirinho - Todos os direitos reservados</p>
        </footer>
      </motion.div>
      </div>
    </main>
  )
}