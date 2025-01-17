'use client';

import { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import PlayerDetails from './PlayerDetails';
import { roles } from '@/lib/roles';
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useSession } from 'next-auth/react';

export default function LogTable({ data }: any) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDungeon, setExpandedDungeon] = useState(null);
  const { toast } = useToast();

  const getRoleIcon = useCallback((roleName: string) => {
    const role = roles.find((r) => r.value === roleName);
    return role?.icon || '/chiqueirinhologo.webp';
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/deleteDungeonHistory`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: id }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Dungeon deleted successfully",
        });

        await fetch(`${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: `A dungeon "${name}" foi deletada por: ${session?.user?.nick}(${session?.user?.username})` }),
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Failed to delete dungeon');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete dungeon",
      });
    }
  };

  const filteredData = data.filter((item: { dungeon: string; players: any[]; }) =>
    item.dungeon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.players.some(player => player.nick.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log(filteredData);
  

  return (
    <div className="space-y-6">
      <Toaster/>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input
          placeholder="Search dungeons or players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="secondary">
          {filteredData.length} {filteredData.length === 1 ? 'Entry' : 'Entries'}
        </Badge>
      </div>
      
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead className="font-bold">Dungeon</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold text-right">Players</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item: any) => (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => setExpandedDungeon(expandedDungeon === item.id ? null : item.id)}
                  >
                    <TableCell>
                      {expandedDungeon === item.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.dungeon}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{item.players.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => handleDelete(item.eventId, e, item.dungeon)}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                        aria-label="Delete dungeon"
                      >
                        <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedDungeon === item.id && (
                    <PlayerDetails players={item.players} getRoleIcon={getRoleIcon} />
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}