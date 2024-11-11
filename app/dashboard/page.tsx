'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from '../components/Header';
import { useEffect, useState } from "react"
import { Trash2, Clipboard, CheckCheck } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import Loading from "@/utils/Loading";

export default function Dashboard() {
  interface Dungeon {
    creatorName: string
    id: string
    eventId: string
    name: string
    description: string
    date: string
  }

  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDungeons = async () => {
      const response = await fetch('/api/getDungeons')
      const data = await response.json()
      setDungeons(data)
      setIsLoading(false)
    }
    fetchDungeons()
  }, [])  


  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/deleteDungeon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    })
    
    if (response.ok) {
      const deletedDungeon = dungeons.find(dungeon => dungeon.id === id)
      setDungeons(dungeons.filter(dungeon => dungeon.id !== id))
      toast({
        title: "Dungeon deletada",
        description: `A dungeon ${deletedDungeon?.name} foi removida com sucesso.`,
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a dungeon.",
        variant: "destructive",
      })
    }
  } 

  const handleCopy = async (eventId: string) => {
    const url = `https://chiqueirinho-form.vercel.app/${eventId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(eventId);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para sua área de transferência.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  console.log(dungeons) 

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl text-white">
      <Toaster />
      <Header />
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl py-2 font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
          Dungeons
        </h1>
        <Button 
          asChild 
          className="bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 transition-all duration-300"
        >
          <Link href="/dashboard/create">Criar Nova Dungeon</Link>
        </Button>
      </div>
      {isLoading && <Loading />}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {dungeons.map((dungeon) => (
          <Card 
            key={dungeon.id} 
            className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 border-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <CardHeader className="space-y-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-white overflow-hidden">
                  {dungeon.name}
                </CardTitle>
                <CardTitle 
                  className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                  onClick={() => handleDelete(dungeon.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-400">
                {dungeon.creatorName}
              </CardDescription>
              <CardDescription className="text-sm text-gray-400">
                {new Date(dungeon.date).toLocaleDateString('pt-BR') + " às " + new Date(dungeon.date).toLocaleTimeString('pt-BR')}
              </CardDescription>
              <CardDescription className="text-sm font-mono bg-zinc-800 p-2 rounded text-gray-300 flex items-center gap-2">
                <span 
                  className="cursor-pointer hover:text-purple-500 transition-colors"
                  onClick={() => handleCopy(dungeon.eventId)}
                >
                  {copiedId === dungeon.eventId ? 
                    <CheckCheck className="h-4 w-4 text-green-500" /> : 
                    <Clipboard className="h-4 w-4" />
                  }
                </span>
                <span className="text-gray-400">https://chiqueirinho-form.vercel.app/{dungeon.eventId}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-6 line-clamp-3">
                {dungeon.description}
              </p>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-zinc-700 text-white hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <Link href={`/dashboard/dungeons/${dungeon.eventId}`}>Ver Detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}