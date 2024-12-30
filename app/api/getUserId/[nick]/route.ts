import { NextRequest } from 'next/server';
import prisma from "@/services/prisma";

export async function GET(
  request: NextRequest,
) {
  try {    
    const nickname = request.nextUrl.pathname.split('/').pop() || '';    

    const user = await prisma.users.findUnique({
      where: {
        name: nickname.toString().toLowerCase()
      }
    })    

    return Response.json(user?.userID)
  } catch (error) {
    return Response.json({ error: `Erro ao buscar user: ${error}` }, { status: 500 })
  }
}