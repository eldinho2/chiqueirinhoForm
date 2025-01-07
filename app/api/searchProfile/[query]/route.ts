import { NextRequest } from 'next/server';
import prisma from "@/services/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { query: string } }
) {
  try {
    const { params } = context;
    const query = params.query;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchResults = await prisma.users.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { username: { startsWith: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        userID: true,
        name: true,
        username: true,
        image: true,
      },
      take: 10,
    });
    
    const sortedResults = searchResults.sort((a, b) => {
      const aStartsWithName = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWithName = b.name.toLowerCase().startsWith(query.toLowerCase());
      const aStartsWithUsername = a.username?.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWithUsername = b.username?.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWithName && !bStartsWithName) return -1;
      if (!aStartsWithName && bStartsWithName) return 1;
      if (aStartsWithUsername && !bStartsWithUsername) return -1;
      if (!aStartsWithUsername && bStartsWithUsername) return 1;
      return 0;
    });

    return new Response(JSON.stringify(sortedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Um erro ocorreu ao buscar perfis:', error);
    return new Response(JSON.stringify({ error: 'Um erro ocorreu ao buscar perfis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
