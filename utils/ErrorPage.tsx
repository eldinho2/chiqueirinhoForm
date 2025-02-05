import Header from "@/app/components/Header"
import Image from "next/image"

export default function ErrorPage() {
    return (
        <div className="">
            <Header />
            <h1 className="text-center text-red-500 p-4">Oops! Algo deu errado.</h1>
            <Image 
                src="/porco error.png" 
                alt="Error" 
                width={300} 
                height={300} 
                className="mx-auto"
            />
        </div>
    )
}