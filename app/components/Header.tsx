'use client'

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"

import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";

import { useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    redirect('/login');
  };

  const isLoggedIn = !!session?.user;

  console.log(session);
  

  useEffect(() => {
    setIsLoading(false);
  }, [session]);

  const Loading = () => {
    return <Skeleton className="bg-gray-500 h-4 w-28 rounded-full" />;
  };

  if (!isLoggedIn) return null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          <Image
            src="/chiqueirinhologo.webp"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>

        {isLoading ? (
          <Loading />
        ) : (
        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
            <p>{session?.user?.name}</p>
            <p>{session?.user?.email}</p>
            <Image
              src={session?.user?.image || ''}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900" align="end">
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>{session?.user?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleLogin} variant="ghost">
              Login
            </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
