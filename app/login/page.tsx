'use client'

import { signIn } from "next-auth/react"
import Image from "next/image"

export default function LoginPage() {

    const credentialsAction = (formData: FormData) => {
        signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
        })
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-xs flex flex-col items-center justify-center">
                <h1 className="mb-12 text-center text-xl font-light text-white">Entrar</h1>
                <Image src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} className="mb-12 rounded-full" />
                <form action={credentialsAction} className="space-y-8">
                    <div className="space-y-6">
                        <input 
                            type="text" 
                            name="username"
                            placeholder="Username"
                            required
                            className="w-full bg-transparent border-0 border-b border-gray-600 pb-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                        />
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password"
                            required
                            className="w-full bg-transparent border-0 border-b border-gray-600 pb-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="mt-12 w-full border border-white px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-white/10"
                    >
                        Entrar
                    </button>
                    <div
                        className="h-8"
                        aria-live="polite"
                        aria-atomic="true"
                    />
                </form>
            </div>
            
            <button onClick={() => signIn('discord')}>Sign in</button>


        </main>
    );
}