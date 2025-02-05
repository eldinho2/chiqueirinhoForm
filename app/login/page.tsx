'use client';

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation';

function LoginComponent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      switch (errorMessage) {
        case 'CredentialsSignin':
          setError('Credenciais inválidas. Por favor, tente novamente.');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
          setError('Ocorreu um erro ao fazer login com o Discord. Por favor, tente novamente.');
          break;
        default:
          setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
      }
    }
  }, [searchParams]);

  const handleDiscordSignIn = () => {
    signIn('discord', { callbackUrl: '/' });
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center justify-center">
      <Image
        src="/chiqueirinhologo.webp"
        alt="Logo"
        width={100}
        height={100}
        className="mb-12 rounded-full"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-500 text-white text-sm rounded">
          {error}
        </div>
      )}
      <button
        onClick={handleDiscordSignIn}
        className="flex items-center justify-center w-full bg-[#5865F2] text-white px-4 py-2 rounded-xl hover:bg-[#4752C4] transition-colors"
      >
        <DiscordLogoIcon className="mr-2 h-5 w-5" />
        Entrar com Discord
      </button>
      <div className="h-8 mt-4" aria-live="polite" aria-atomic="true" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1A1A1A] p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginComponent />
      </Suspense>
    </main>
  );
}
