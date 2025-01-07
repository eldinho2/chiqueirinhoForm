import { NextRequest } from 'next/server';
import prisma from "@/services/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ query: string }> }
) {
  try {
    const { query } = await context.params;

    if (typeof query !== 'string' || !query || query.length > 30) {
      return new Response(
        JSON.stringify({ error: 'Search query must be a non-empty string with max length 30' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
      const aPriority = a.name.toLowerCase().startsWith(query.toLowerCase()) ? 1 :
                        a.username?.toLowerCase().startsWith(query.toLowerCase()) ? 2 : 3;
      const bPriority = b.name.toLowerCase().startsWith(query.toLowerCase()) ? 1 :
                        b.username?.toLowerCase().startsWith(query.toLowerCase()) ? 2 : 3;
      return aPriority - bPriority;
    });

    return new Response(JSON.stringify(sortedResults), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar perfis:', error);
    return new Response(
      JSON.stringify({ error: 'Um erro ocorreu ao buscar perfis' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

