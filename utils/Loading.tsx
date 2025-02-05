import Image from "next/image"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center">
            <Image 
                src="/chiqueirinhologo.webp" 
                alt="Loading" 
                width={100} 
                height={100} 
                className="loader rounded-full" 
            />
        </div>
    )
}