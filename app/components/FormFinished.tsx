import Image from "next/image"

export default function FormFinished() {
  return (  
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4 p-4 bg-black/60 rounded-lg">
        <Image className="rounded-full" src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} />
        <div>Informações recebidas, obrigado!</div>
        <span>Seu IP foi registrado com sucesso!</span>
        <span>Você já pode fechar esta página, e aguardar o início do mass!</span>
      </div>
    </div>
  )
}