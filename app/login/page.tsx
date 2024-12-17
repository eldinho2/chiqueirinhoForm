'use client'

import { signIn } from "next-auth/react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { DiscordLogoIcon } from '@radix-ui/react-icons'
import { useSearchParams, redirect } from 'next/navigation'

export default function LoginPage() {
    const [showAdminLogin, setShowAdminLogin] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        const errorMessage = searchParams.get('error')
        if (errorMessage) {
            switch (errorMessage) {
                case 'CredentialsSignin':
                    setError('Credenciais inválidas. Por favor, tente novamente.')
                    break
                case 'OAuthSignin':
                case 'OAuthCallback':
                case 'OAuthCreateAccount':
                case 'EmailCreateAccount':
                case 'Callback':
                    setError('Ocorreu um erro ao fazer login com o Discord. Por favor, tente novamente.')
                    break
                default:
                    setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.')
            }
        }
    }, [searchParams])

    const credentialsAction = async (formData: FormData) => {
        const result = await signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
            redirect: false,
        })

        if (result?.error) {
            setError('Credenciais inválidas. Por favor, tente novamente.')
        }

        if (!result?.error) {
            redirect('/')
        }
    }

    const handleDiscordSignIn = () => {
        signIn('discord', { callbackUrl: '/dashboard' })
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#1A1A1A] p-4">
            <div className="w-full max-w-xs flex flex-col items-center justify-center">
                <Image src="/chiqueirinhologo.webp" alt="Logo" width={100} height={100} className="mb-12 rounded-full" />
                
                {error && (
                    <div className="mb-4 p-3 bg-red-500 text-white text-sm rounded">
                        {error}
                    </div>
                )}

                {!showAdminLogin ? (
                    <>
                        <button 
                            onClick={handleDiscordSignIn}
                            className="flex items-center justify-center w-full bg-[#5865F2] text-white px-4 py-2 rounded-xl hover:bg-[#4752C4] transition-colors"
                        >
                            <DiscordLogoIcon className="mr-2 h-5 w-5" />
                            Entrar com Discord
                        </button>
                        <p className="mt-4 text-sm text-gray-400">
                            <button 
                                onClick={() => setShowAdminLogin(true)}
                                className="text-white hover:underline"
                            >
                                Deseja logar como admin?
                            </button>
                        </p>
                    </>
                ) : (
                    <form action={credentialsAction} className="space-y-8 w-full">
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
                            Entrar como Admin
                        </button>
                        <p className="mt-4 text-sm text-gray-400">
                            <button 
                                onClick={() => setShowAdminLogin(false)}
                                className="text-white hover:underline flex gap-2"
                            >
                                Voltar para login com Discord
                                <DiscordLogoIcon className="mr-2 h-5 w-5" />

                            </button>
                        </p>
                    </form>
                )}

                <div
                    className="h-8 mt-4"
                    aria-live="polite"
                    aria-atomic="true"
                />
            </div>
        </main>
    );
}

