"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { admins } from '@/lib/admins'


interface SearchResult {
  userID: string;
  name: string;
  username: string;
  image: string;
}

export default function Header() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const useDebouncedFunction = <Args extends unknown[]>(
    func: (...args: Args) => void,
    delay: number
  ): ((...args: Args) => void) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const debouncedFunction = useCallback(
      (...args: Args) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          func(...args);
        }, delay);
      },
      [func, delay]
    );
  
    return debouncedFunction;
  };



  const debouncedSearch = useDebouncedFunction(
    async (query: string) => {
      if (query.length > 0) {
        setIsSearching(true);
        setSearchError(null);
        try {
          const response = await fetch(`/api/searchProfile/${encodeURIComponent(query)}`);
          if (!response.ok) {
            throw new Error('Search failed');
          }
          const data: SearchResult[] = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Um erro ocorreu ao buscar perfis:', error);
          setSearchError('Um erro ocorreu ao buscar perfis.');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    },
    300
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleLogout = async () => {
    await signOut();
    redirect("/");
  };

  const handleLogin = () => {
    redirect("/login");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsSearchFocused(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    setIsLoading(false);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [status]);

  if (isLoading || status === 'loading') {
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
          <span className="text-xl font-bold">Chiqueirinho</span>
        </Link>

        <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Procurar Jogadores..."
              className="w-full pl-8 bg-[#3A3A3A] border-[#4A4A4A] text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
          </div>
          {isSearchFocused && (searchResults.length > 0 || isSearching || searchError) && (
            <div className="absolute z-10 w-full mt-1 bg-[#3A3A3A] border border-[#4A4A4A] rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : searchError ? (
                <div className="px-4 py-2 text-red-400">{searchError}</div>
              ) : (
                searchResults.map((player) => (
                  <Link
                    key={uuidv4()}
                    href={`/perfil/${player.userID}`}
                    className="flex items-center px-4 py-2 hover:bg-[#4A4A4A] transition-colors duration-150"
                  >
                    <Image
                      src={player.image || "/chiqueirinhologo.webp"}
                      alt={`${player.name}'s avatar`}
                      width={32}
                      height={32}
                      className="rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-sm text-gray-400">@{player.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {admins.includes(session?.user?.role as any) && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          {session?.user ? (
            <>
              <Link
                href={`/perfil/${session.user.id}`}
                className="flex items-center gap-2"
              >
                {session.user.image ? (
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
