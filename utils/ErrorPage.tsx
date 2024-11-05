import Header from "@/app/components/Header"
import Image from "next/image"

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Header />
            <h1 className="text-center text-red-500 p-4">Não há nenhuma disputa para este evento</h1>
            <Image 
                src="/porco error.png" 
                alt="Error" 
                width={300} 
                height={300} 
            />
        </div>
    )
}