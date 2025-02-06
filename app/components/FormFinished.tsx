import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import Header from "./Header"

export default function FormFinished() {
  const [copied, setCopied] = useState(false)

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("#forcecityoverload true")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (  
    <>
    <Header />

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center flex-col p-6"
    >
      <motion.div 
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center flex flex-col items-center gap-4 pb-6 "
      >
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Image className="rounded-full" src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} />
          </Link>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-green-400"
        >
          Informações recebidas, obrigado!
        </motion.div>
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-300"
        >
          Seu IP foi registrado com sucesso!
        </motion.span>
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-300"
        >
          Você já pode fechar esta página, e aguardar o início do mass!
        </motion.span>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 rounded-lg max-w-2xl w-full"
      >
        <motion.div 
          className="text-red-500 font-bold text-2xl text-center mb-2"
        >⚠
          IMPORTANTE
          ⚠
        </motion.div>
        <h1 className="text-xl font-bold text-center mb-6 text-yellow-400">
          Para sua dg correr bem use o botão abaixo para copiar o comando de super lotar a cidade
        </h1>
        <div className="flex flex-col items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleCopyCommand}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold transition-all"
            >
              {copied ? "Comando Copiado!" : "Copiar comando"}
            </Button>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-300 mb-2">Desktop:</h2>
              <Image 
                className="rounded-lg shadow-lg hover:scale-105 transition-transform"
                src="/formfinished2.png" 
                alt="Desktop" 
                width={340} 
                height={340} 
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-300 mb-2">Mobile:</h2>
              <Image 
                className="rounded-lg shadow-lg hover:scale-105 transition-transform"
                src="/formfinished1.png" 
                alt="Mobile" 
                width={340} 
                height={340} 
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
    </>
  )
}
