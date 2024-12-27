"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { admins } from "@/lib/admins";

export default function Header() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    redirect("/login");
  };

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    setIsLoading(false);
  }, [session]);

  if (isLoading) {
    return null;
  }
  
  return (
    <header className="bg-[#2A2A2A] border-b border-[#3A3A3A] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/chiqueirinhologo.webp"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className={`text-xl font-extrabold`}>Chiqueirinho</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user?.role && admins.includes(session?.user?.role) && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link
                href={`/perfil/${session?.user?.id}`}
                className="flex items-center gap-2"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 p-1 rounded-full bg-[#3A3A3A]" />
                )}
                <Button variant="ghost" size="sm" className="text-white">
                  Perfil
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogin}
              className="text-white"
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

